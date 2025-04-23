// Service pour communiquer avec l'API Stripe côté backend
export async function createCheckoutSession(articles: any[]) {
  const response = await fetch('http://localhost:5000/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles }),
  });
  if (!response.ok) throw new Error('Erreur lors de la création de la session Stripe');
  return response.json();
}
