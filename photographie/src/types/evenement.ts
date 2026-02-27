export interface PhotoOriginale {
  _id?: string;
  nom: string;
  fichierR2: string;
  miniature?: string;
  taille: number;
  format: string;
  dateUpload?: string;
  nbTelechargements?: number;
}

export interface Evenement {
  id: string;
  _id?: string;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  image?: string;
  photos?: string[];
  theme?: string;
  visibilite?: "public" | "prive";
  client?:
    | string
    | { _id: string; email: string; nom?: string; prenom?: string };
  clientEmail?: string;

  codeAcces?: string;
  photosOriginales?: PhotoOriginale[];
  typeValidite?: "permanent" | "temporaire";
  dateExpiration?: string;
  typeLimiteTelechargement?: "illimite" | "par_photo" | "total";
  maxTelechargementParPhoto?: number;
  maxTelechargementTotal?: number;
  nbTelechargementTotal?: number;
  statut?: "actif" | "expire" | "suspendu";
}
