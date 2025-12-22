export interface Utilisateur {
  isAuthenticated: boolean; // ✔️ Indique si l'utilisateur est connecté (authentifié)
  isAdmin: boolean; // 👑 Indique si l'utilisateur possède les droits administrateur
  nom: string; // 🧑 Nom de famille
  prenom?: string; // Prénom
  email?: string; // 📧 Email de l'utilisateur
  telephone?: string; // Téléphone
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
}
