// ==============================
//  Service d'authentification pour l'inscription
// ==============================
export async function register(email: string, motdepasse: string) {
  // Inscription
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
    method: "POST", // Méthode HTTP
    headers: { "Content-Type": "application/json" }, // En-têtes HTTP
    body: JSON.stringify({ email, motdepasse }), // corps de la requête
  });
  return res.json();
}

// ==============================
//  Service d'authentification pour la connexion
// ==============================
export async function login(email: string, motdepasse: string) {
  // Connexion
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    method: "POST", // Méthode HTTP
    headers: { "Content-Type": "application/json" }, // En-têtes HTTP
    body: JSON.stringify({ email, motdepasse }), // corps de la requête
  });
  return res.json(); // retournera aussi le role
}
