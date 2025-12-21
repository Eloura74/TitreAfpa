import { API_URL } from "../config/api";

// ==============================
//  Service pour s'inscrire (register)
// ==============================
export async function register(
  email: string,
  motdepasse: string,
  nom?: string,
  prenom?: string,
  telephone?: string,
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  }
) {
  // Envoi d'une requête POST vers l'API pour créer un nouvel utilisateur
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST", // Méthode HTTP utilisée : POST pour envoyer des données
    headers: { "Content-Type": "application/json" }, // Type de contenu envoyé : JSON
    body: JSON.stringify({
      email,
      motdepasse,
      nom,
      prenom,
      telephone,
      adresse,
    }), // Corps de la requête converti en JSON
  });
  // Retourne la réponse de l'API sous forme d'objet JSON
  return res.json();
}

// ==============================
//  Service pour se connecter (login) avec gestion des erreurs et timeout
// ==============================
export async function login(email: string, motdepasse: string) {
  try {
    // Création d'un contrôleur pour gérer un timeout sur la requête
    const controller = new AbortController();
    // Définition d'un délai maximal de 10 secondes avant d'annuler la requête
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Envoi de la requête POST pour l'authentification
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST", // Méthode HTTP POST
      headers: { "Content-Type": "application/json" }, // Envoi JSON
      body: JSON.stringify({ email, motdepasse }), // Données à envoyer
      signal: controller.signal, // Permet d'annuler la requête en cas de timeout
    });

    // Nettoyage du timeout si la réponse arrive avant 10 secondes
    clearTimeout(timeout);

    let data;
    try {
      // Tentative de conversion de la réponse en JSON
      data = await res.json();
    } catch (e) {
      // Si la réponse n'est pas un JSON valide, on renvoie une erreur claire
      return { error: "Réponse serveur invalide" };
    }

    // Si la réponse HTTP n'est pas un succès (code 200-299)
    if (!res.ok) {
      // Renvoie l'erreur reçue du serveur ou un message générique
      return { error: data?.error || "Erreur d’authentification" };
    }

    // Si tout est OK, on retourne les données JSON (ex: token, info utilisateur)
    return data;
  } catch (e: any) {
    // Gestion des erreurs réseau ou d'annulation
    if (e.name === "AbortError") {
      // La requête a été annulée (timeout dépassé)
      return { error: "Délai de connexion dépassé (timeout)" };
    }
    // Toute autre erreur réseau ou serveur
    return { error: "Erreur réseau ou serveur" };
  }
}
