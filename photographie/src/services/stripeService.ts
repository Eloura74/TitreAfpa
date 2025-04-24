// ==============================
//  Service pour communiquer avec l'API Stripe côté backend
// ==============================
export async function createCheckoutSession(articles: any[]) {
  const response = await fetch(
    "http://localhost:5001/api/stripe/create-checkout-session",
    {
      method: "POST", // Méthode HTTP
      headers: { "Content-Type": "application/json" }, // En-têtes HTTP
      body: JSON.stringify({ articles }), // corps de la requête
    }
  );
  // Vérification de la réponse
  if (!response.ok)
    throw new Error("Erreur lors de la création de la session Stripe");
  return response.json();
}
