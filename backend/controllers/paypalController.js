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

exports.captureOrder = async (req, res) => {
  const { orderID } = req.params;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    // Ici, vous pouvez enregistrer la commande dans votre base de données
    // ex: await Commande.create({ ... })
    
    res.json(capture.result);
  } catch (err) {
    console.error("Erreur capture commande PayPal:", err);
    res.status(500).json({ error: err.message });
  }
};
