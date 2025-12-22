const paypal = require("@paypal/checkout-server-sdk");
const Photo = require("../models/Photo");
const OeuvreGraphique = require("../models/OeuvreGraphique");

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

exports.createOrder = async (req, res) => {
  const { articles } = req.body;

  try {
    // Calcul du total côté serveur pour éviter la fraude
    let total = 0;
    const verifiedItems = [];

    for (const article of articles) {
      let prixUnitaire = 0;
      let nomArticle = article.nom || "Article";

      // 1. Essayer de trouver une Photo
      // On vérifie si l'ID est un ObjectId valide pour éviter les erreurs de cast
      if (article.id && article.id.match(/^[0-9a-fA-F]{24}$/)) {
        const photo = await Photo.findById(article.id);
        
        if (photo) {
          nomArticle = photo.titre || article.nom;
          // Chercher le tarif correspondant au format/support
          if (photo.tarifs && photo.tarifs.length > 0) {
            const tarif = photo.tarifs.find(
              (t) => t.format === article.format && t.support === article.support
            );
            if (tarif) {
              prixUnitaire = tarif.prix;
            } else {
              // Fallback si format non trouvé (ne devrait pas arriver si synchro)
              // On peut logger une erreur ou utiliser le prix par défaut
              console.warn(`Tarif non trouvé pour photo ${article.id} format ${article.format}`);
              prixUnitaire = photo.prix || 0; 
            }
          } else {
            prixUnitaire = photo.prix || 0;
          }
        } else {
          // 2. Essayer de trouver une OeuvreGraphique
          const oeuvre = await OeuvreGraphique.findById(article.id);
          if (oeuvre) {
            nomArticle = oeuvre.titre || article.nom;
            prixUnitaire = oeuvre.prix;
          } else {
            console.warn(`Article non trouvé en base: ${article.id}`);
            // Si l'article n'est pas trouvé en base, on ne peut pas valider le prix.
            // Option: rejeter la commande ou (risqué) utiliser le prix client.
            // Ici on rejette pour sécurité.
            throw new Error(`Article non trouvé ou indisponible: ${article.nom}`);
          }
        }
      } else {
         // ID invalide ou manquant
         console.warn(`ID article invalide: ${article.id}`);
         throw new Error(`Article invalide: ${article.nom}`);
      }

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
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Erreur création commande PayPal:", err);
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

    console.log("✅ Paiement PayPal enregistré :", nouveauPaiement);
    
    // Envoi de l'email de confirmation
    const { sendOrderConfirmation } = require("../services/emailService");
    if (payer.email_address) {
      sendOrderConfirmation(payer.email_address, nouveauPaiement)
        .catch(err => console.error("Erreur envoi email confirmation:", err));
    }

    res.json(result);
  } catch (err) {
    console.error("Erreur capture commande PayPal:", err);
    res.status(500).json({ error: err.message });
  }
};
