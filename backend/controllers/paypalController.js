const paypal = require("@paypal/checkout-server-sdk");

// Configuration de l'environnement PayPal
// En production, utilisez LiveEnvironment au lieu de SandboxEnvironment
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

exports.createOrder = async (req, res) => {
  const { articles } = req.body;

  // Calcul du total
  // Note: Idéalement, le prix devrait être recalculé côté serveur à partir de la DB pour éviter la fraude
  let total = 0;
  articles.forEach((article) => {
    total += article.prix * article.quantite;
  });

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
        items: articles.map((article) => ({
          name: article.nom,
          unit_amount: {
            currency_code: "EUR",
            value: article.prix.toFixed(2),
          },
          quantity: article.quantite.toString(),
        })),
      },
    ],
  });

  try {
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
