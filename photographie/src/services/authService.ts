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
// Service de connexion robuste avec gestion des erreurs et timeout
export async function login(email: string, motdepasse: string) {
  try {
    // Timeout de sécurité : 10 secondes max
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, motdepasse }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    let data;
    try {
      data = await res.json();
    } catch (e) {
      // Si la réponse n'est pas du JSON
      return { error: "Réponse serveur invalide" };
    }
    if (!res.ok) {
      // Gestion des erreurs HTTP
      return { error: data?.error || "Erreur d’authentification" };
    }
    return data;
  } catch (e: any) {
    // Gestion des erreurs réseau ou timeout
    if (e.name === 'AbortError') {
      return { error: "Délai de connexion dépassé (timeout)" };
    }
    return { error: "Erreur réseau ou serveur" };
  }
}
