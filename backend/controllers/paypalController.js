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
    process.env.PAYPAL_CLIENT_SECRET
  );
} else {
  environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}
const client = new paypal.core.PayPalHttpClient(environment);

/**
 * 🔒 FONCTION DE VALIDATION STRICTE DES PRIX
 * Récupère le prix RÉEL depuis la base de données TarifConfig
 * NE FAIT JAMAIS CONFIANCE AU PRIX ENVOYÉ PAR LE CLIENT
 */
async function getValidatedPrice(article) {
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
      prixUnitaire: 25.0 // Prix fixe HD
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

  for (const category of tarifConfig.categories) {
    if (!category.formats) continue;
    
    for (const format of category.formats) {
      if (format.nom === article.format) {
        // Si c'est un tirage avec supports
        if (format.supports && Array.isArray(format.supports)) {
          const support = format.supports.find(s => s.nom === article.support);
          if (support) {
            prixValidé = support.prix;
            break;
          }
        }
        // Si c'est un format simple sans supports
        else if (format.prix !== undefined) {
          prixValidé = format.prix;
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
          t => t.format === article.format && t.support === article.support
        );
        if (tarif) {
          prixValidé = tarif.prix;
        }
      }
    }
  }

  // 5. Si toujours aucun prix validé, REJETER la commande
  if (prixValidé === null || prixValidé === undefined) {
    logger.error("Prix non validable", { 
      article: article.nom, 
      format: article.format, 
      support: article.support,
      prixClient: article.prix
    });
    throw new Error(`Prix non validable pour: ${article.nom} (${article.format})`);
  }

  return {
    nomArticle,
    prixUnitaire: prixValidé
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
    logger.info("Commande PayPal créée", { orderId: order.result.id, total: total.toFixed(2) });
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
      transactionId: nouveauPaiement.transactionId 
    });

    // Import des services d'email
    const {
      sendOrderConfirmation,
      sendAdminNotification,
    } = require("../services/emailService");

    // 1. Email Client
    if (payer.email_address) {
      sendOrderConfirmation(payer.email_address, nouveauPaiement).catch((err) =>
        logger.error("Erreur envoi email confirmation", { error: err.message })
      );
    }

    // 2. Email Admin
    sendAdminNotification(nouveauPaiement, items).catch((err) =>
      logger.error("Erreur envoi email admin", { error: err.message })
    );

    res.json(result);
  } catch (err) {
    logger.error("Erreur capture commande PayPal", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
