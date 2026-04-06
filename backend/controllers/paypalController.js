// Fix PayPal validation - support tirages personnalisés v2
const paypal = require("@paypal/checkout-server-sdk");
const Photo = require("../models/Photo");
const OeuvreGraphique = require("../models/OeuvreGraphique");
const TarifConfig = require("../models/TarifConfig");
const logger = require("../utils/logger");

// Configuration de l'environnement PayPal
// En production, utilisez LiveEnvironment au lieu de SandboxEnvironment
let environment;
if (process.env.NODE_ENV === "production") {
  environment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET,
  );
} else {
  environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET,
  );
}
const client = new paypal.core.PayPalHttpClient(environment);

/**
 * 🔒 FONCTION DE VALIDATION STRICTE DES PRIX
 * Récupère le prix RÉEL depuis la base de données TarifConfig
 * NE FAIT JAMAIS CONFIANCE AU PRIX ENVOYÉ PAR LE CLIENT
 */
async function getValidatedPrice(article) {
  // Log des données reçues pour debug
  logger.info("Validation prix - Article reçu", {
    id: article.id,
    nom: article.nom,
    format: article.format,
    support: article.support,
    prix: article.prix,
  });

  // 1. Cas spécial HD (prix fixe)
  if (article.id && article.id.includes("-HD-")) {
    const photoId = article.id.split("-HD-")[0];
    if (!photoId || !photoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`ID Photo invalide pour HD: ${article.id}`);
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      throw new Error(`Photo introuvable pour HD: ${photoId}`);
    }

    return {
      nomArticle: `${photo.titre || "Photo"} (Fichier Numérique HD)`,
      prixUnitaire: 25.0, // Prix fixe HD
    };
  }

  // 2. Récupérer la configuration des tarifs V2
  const tarifConfig = await TarifConfig.findOne();
  if (!tarifConfig || !tarifConfig.categories) {
    throw new Error("Configuration des tarifs introuvable");
  }

  // 3. Chercher le tarif correspondant dans la config
  let prixValidé = null;
  let nomArticle = article.nom || "Article";

  logger.info("Recherche tarif dans config", {
    recherche: { format: article.format, support: article.support },
    nbCategories: tarifConfig.categories.length,
  });

  for (const category of tarifConfig.categories) {
    if (!category.formats) continue;

    for (const format of category.formats) {
      logger.debug("Comparaison format", {
        formatConfig: format.nom,
        formatArticle: article.format,
        match: format.nom === article.format,
      });

      if (format.nom === article.format) {
        // Si c'est un tirage avec supports
        if (format.supports && Array.isArray(format.supports)) {
          logger.info("Format trouvé avec supports", {
            format: format.nom,
            supports: format.supports.map((s) => s.nom),
          });

          const support = format.supports.find(
            (s) => s.nom === article.support,
          );
          if (support) {
            prixValidé = support.prix;
            logger.info("Prix validé trouvé", {
              prix: prixValidé,
              support: support.nom,
            });
            break;
          } else {
            logger.warn("Support non trouvé dans format", {
              supportRecherché: article.support,
              supportsDisponibles: format.supports.map((s) => s.nom),
            });
          }
        }
        // Si c'est un format simple sans supports
        else if (format.prix !== undefined) {
          prixValidé = format.prix;
          logger.info("Prix validé trouvé (format simple)", {
            prix: prixValidé,
          });
          break;
        }
      }
    }
    if (prixValidé !== null) break;
  }

  // 4. Si prix non trouvé dans config, vérifier DB photo (fallback)
  const possiblePhotoId = article.id ? article.id.split("-")[0] : "";
  if (possiblePhotoId && possiblePhotoId.match(/^[0-9a-fA-F]{24}$/)) {
    const photo = await Photo.findById(possiblePhotoId);
    if (photo) {
      nomArticle = photo.titre || article.nom;

      // Si prix non validé par config, chercher dans photo.tarifs
      if (prixValidé === null && photo.tarifs && photo.tarifs.length > 0) {
        const tarif = photo.tarifs.find(
          (t) => t.format === article.format && t.support === article.support,
        );
        if (tarif) {
          prixValidé = tarif.prix;
        }
      }
    }
  }

  // 5. Fallback pour tirages personnalisés : recherche flexible dans TarifConfig
  if (prixValidé === null && article.format) {
    logger.info("Tentative de validation flexible pour tirage personnalisé");

    for (const category of tarifConfig.categories) {
      if (!category.formats) continue;

      for (const format of category.formats) {
        // Correspondance flexible : le format peut contenir le label (ex: "10x10 cm" contient "10x10")
        const formatMatch =
          format.nom === article.format ||
          article.format.includes(format.nom) ||
          format.nom.includes(article.format);

        if (formatMatch) {
          // Si le format a des supports, chercher le support correspondant
          if (
            format.supports &&
            Array.isArray(format.supports) &&
            article.support
          ) {
            const support = format.supports.find(
              (s) =>
                s.nom === article.support ||
                article.support.includes(s.nom) ||
                s.nom.includes(article.support),
            );

            if (support) {
              prixValidé = support.prix;
              logger.info(
                "Prix validé via correspondance flexible (avec support)",
                {
                  formatConfig: format.nom,
                  formatArticle: article.format,
                  supportConfig: support.nom,
                  supportArticle: article.support,
                  prix: prixValidé,
                },
              );
              break;
            }
          }
          // Si le format n'a pas de supports, utiliser le prix du format directement
          else if (format.prix !== undefined) {
            prixValidé = format.prix;
            logger.info(
              "Prix validé via correspondance flexible (format simple)",
              {
                formatConfig: format.nom,
                formatArticle: article.format,
                prix: prixValidé,
              },
            );
            break;
          }
        }
      }
      if (prixValidé !== null) break;
    }
  }

  // 6. Si toujours aucun prix validé, REJETER la commande
  if (prixValidé === null || prixValidé === undefined) {
    logger.error("Prix non validable - aucun tarif trouvé", {
      articleNom: article.nom,
      format: article.format,
      support: article.support,
      prixClient: article.prix,
      categoriesDisponibles: tarifConfig.categories.map((c) => ({
        nom: c.nom,
        formats: c.formats?.map((f) => ({
          nom: f.nom,
          supports: f.supports?.map((s) => s.nom),
        })),
      })),
    });
    throw new Error(
      `Prix non validable pour: ${article.nom} - Format: ${article.format || "non spécifié"}, Support: ${article.support || "non spécifié"}`,
    );
  }

  return {
    nomArticle,
    prixUnitaire: prixValidé,
  };
}

exports.createOrder = async (req, res) => {
  const { articles } = req.body;

  try {
    // 🔒 Calcul du total côté serveur avec validation STRICTE des prix
    let total = 0;
    const verifiedItems = [];

    for (const article of articles) {
      // ✅ Validation stricte : récupère le prix depuis la DB
      const { nomArticle, prixUnitaire } = await getValidatedPrice(article);

      total += prixUnitaire * article.quantite;

      verifiedItems.push({
        name: nomArticle,
        unit_amount: {
          currency_code: "EUR",
          value: prixUnitaire.toFixed(2),
        },
        quantity: article.quantite.toString(),
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "EUR",
                value: total.toFixed(2),
              },
            },
          },
          items: verifiedItems,
        },
      ],
    });

    const order = await client.execute(request);
    logger.info("Commande PayPal créée", {
      orderId: order.result.id,
      total: total.toFixed(2),
    });
    res.json({ id: order.result.id });
  } catch (err) {
    logger.error("Erreur création commande PayPal", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

const Paiement = require("../models/Paiement"); // Import du modèle Paiement

exports.captureOrder = async (req, res) => {
  const { orderID } = req.params;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    const result = capture.result;

    // Extraction des informations du payeur
    const payer = result.payer;
    const purchaseUnit = result.purchase_units[0];
    const amount = purchaseUnit.payments.captures[0].amount.value;

    // Récupération des articles pour l'email admin (si disponibles dans la réponse)
    // Note: PayPal ne renvoie pas toujours les items dans la réponse de capture,
    // il faut parfois refaire un getOrder ou se fier à ce qu'on a envoyé.
    // Mais purchase_units[0].items devrait être là si on a mis 'return=representation' à la création ?
    // Pas garanti. On va essayer de les récupérer, sinon liste vide.
    const items = purchaseUnit.items || [];

    // Enregistrement du paiement en base de données
    const nouveauPaiement = await Paiement.create({
      montant: parseFloat(amount),
      date: new Date(),
      statut: "payé",
      source: "paypal",
      transactionId: result.id,
      nomClient: `${payer.name.given_name} ${payer.name.surname}`,
      emailClient: payer.email_address,
      // utilisateur: req.user ? req.user._id : undefined // Si on avait l'user connecté
    });

    logger.info("Paiement PayPal enregistré", {
      montant: nouveauPaiement.montant,
      transactionId: nouveauPaiement.transactionId,
    });

    // Import des services d'email
    const {
      sendOrderConfirmation,
      sendAdminNotification,
    } = require("../services/emailService");

    // 1. Email Client
    if (payer.email_address) {
      sendOrderConfirmation(payer.email_address, nouveauPaiement).catch((err) =>
        logger.error("Erreur envoi email confirmation", { error: err.message }),
      );
    }

    // 2. Email Admin
    sendAdminNotification(nouveauPaiement, items).catch((err) =>
      logger.error("Erreur envoi email admin", { error: err.message }),
    );

    res.json(result);
  } catch (err) {
    logger.error("Erreur capture commande PayPal", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
