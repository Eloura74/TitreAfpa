// ==============================
//  Service pour communiquer avec l'API Stripe côté backend
// ==============================
import { ArticlePanierType } from '../types/panier';

export async function createCheckoutSession(articles: ArticlePanierType[]) {
  // Adaptation des articles pour Stripe
  const articlesStripe = articles.map((article) => ({
    nom: article.nom,
    image: article.image || '',
    prix: article.prix, // prix en euros (sera multiplié par 100 côté backend)
    quantite: article.quantite || 1,
  }));

  const response = await fetch(
    "http://localhost:5001/api/stripe/create-checkout-session",
    {
      method: "POST", // Méthode HTTP
      headers: { "Content-Type": "application/json" }, // En-têtes HTTP
      body: JSON.stringify({ articles: articlesStripe }), // corps de la requête
    }
  );
  // Vérification de la réponse
  if (!response.ok)
    throw new Error("Erreur lors de la création de la session Stripe");
  return response.json();
}
