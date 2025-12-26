// TypeScript : Définition du type Evenement pour la page des événements
export interface Evenement {
  id: string; // Normalisé depuis _id MongoDB
  _id?: string; // ID MongoDB original (optionnel)
  titre: string;
  description?: string;
  dateDebut: string; // Date de début (obligatoire)
  dateFin: string;   // Date de fin (obligatoire)
  lieu?: string;
  image?: string;    // URL de l'image de couverture (optionnelle)
  photos?: string[];
  theme?: string;    // Thème optionnel
  visibilite?: "public" | "prive";
  client?: string;   // ID du client (User)
  clientEmail?: string; // Pour le formulaire seulement
}

