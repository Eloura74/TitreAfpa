// Importation du framework Express pour gérer les routes HTTP
const express = require("express");

// Création d'un routeur Express pour définir des routes liées au paiement
const router = express.Router();

// Importation du module Stripe pour gérer les paiements
const Stripe = require("stripe");

// Initialisation de Stripe avec la clé secrète (via process.env pour Vercel)
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY manquant. Les paiements Stripe ne fonctionneront pas.");
}

// ------------------------------
// Route POST – Création d'une session de paiement Stripe Checkout
// ------------------------------
router.post("/create-checkout-session", async (req, res) => {
  // Récupération du tableau d'articles envoyé dans le corps de la requête
  const { articles } = req.body;

  try {
    // Création d'une session de paiement Stripe avec les paramètres nécessaires
    const session = await stripe.checkout.sessions.create({
      // Méthode de paiement acceptée : carte bancaire
      payment_method_types: ["card"],

      // Définition des articles à payer (format attendu par Stripe)
      line_items: articles.map((article) => ({
        price_data: {
          currency: "eur", // Devise en euros
          product_data: {
            name: article.nom, // Nom de l'article
            images: article.image ? [article.image] : [], // Image de l'article si disponible
          },
          unit_amount: Math.round(article.prix * 100), // Prix en centimes (Stripe attend un montant en cts)
        },
        quantity: article.quantite, // Quantité d'articles commandés
      })),

      // Mode de paiement simple (paiement unique)
      mode: "payment",

      // URL de redirection après succès du paiement
      success_url: "http://localhost:5173/checkout?success=true",

      // URL de redirection en cas d'annulation du paiement
      cancel_url: "http://localhost:5173/checkout?canceled=true",
    });

    // Renvoi au client de l'URL de la session Stripe pour rediriger vers la page de paiement
    res.json({ url: session.url });
  } catch (err) {
    // Gestion des erreurs : si la création de la session échoue
    res.status(500).json({ error: err.message });
  }
});

// Exportation du routeur pour pouvoir l'utiliser dans l'application principale (app.js ou server.js)
module.exports = router;
