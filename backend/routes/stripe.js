const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { articles } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: articles.map(article => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: article.nom,
            images: article.image ? [article.image] : [],
          },
          unit_amount: Math.round(article.prix * 100),
        },
        quantity: article.quantite,
      })),
      mode: 'payment',
      success_url: 'http://localhost:5173/checkout?success=true',
      cancel_url: 'http://localhost:5173/checkout?canceled=true',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
