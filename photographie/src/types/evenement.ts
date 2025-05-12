// TypeScript : Définition du type Evenement pour la page des événements
export interface Evenement {
  id: string; // Normalisé depuis _id MongoDB
  titre: string;
  description?: string;
  date: string;
  dateDebut?: string;
  dateFin?: string;
  lieu?: string;
  urlAffiche?: string;
  photos?: string[];
  theme?: string; // Ajout du champ optionnel theme
}
