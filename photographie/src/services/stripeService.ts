// ❌ FICHIER DÉSACTIVÉ : Stripe retiré du projet, seul PayPal est utilisé
// ==============================
//  Service pour communiquer avec l'API Stripe côté backend (OBSOLÈTE)
// ==============================
/*
import { ArticlePanierType } from "../types/panier";
import { API_URL } from "../config/api";

export async function createCheckoutSession(articles: ArticlePanierType[]) {
  // On adapte les données des articles pour correspondre au format attendu par Stripe
  const articlesStripe = articles.map((article) => ({
    nom: article.nom, // Nom du produit
    image: article.image || "", // URL de l'image (vide si non fournie)
    prix: article.prix, // Prix en euros (multiplié par 100 côté backend)
    quantite: article.quantite || 1, // Quantité (1 par défaut si non précisé)
  }));

  // Envoi d'une requête POST vers notre backend pour créer la session Stripe
  const response = await fetch(
    `${API_URL}/api/stripe/create-checkout-session`, // URL de l'API backend
    {
      method: "POST", // Méthode HTTP POST pour envoyer des données
      headers: { "Content-Type": "application/json" }, // Type des données envoyées : JSON
      body: JSON.stringify({ articles: articlesStripe }), // Corps de la requête JSON contenant les articles adaptés
    }
  );

  // Vérification si la réponse est bonne (code HTTP 200-299)
  if (!response.ok)
    // Si erreur HTTP, on lance une exception avec un message explicite
    throw new Error("Erreur lors de la création de la session Stripe");

  // On retourne la réponse convertie en JSON (typiquement contient l'URL de paiement)
  return response.json();
}
*/

// Fonction vide pour éviter les erreurs d'import
export async function createCheckoutSession() {
  throw new Error("Stripe désactivé - Utiliser PayPal uniquement");
}
