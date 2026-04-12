export interface PhotoOriginale {
  _id?: string;
  nom: string;
  fichierR2: string;
  miniature?: string;
  taille: number;
  format: string;
  dateUpload?: string;
  nbTelechargements?: number;
  commentaire?: string | null;
}

export interface Evenement {
  id: string;
  _id?: string;
  titre: string;
  slug?: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  image?: string;
  photos?: Array<string | { _id?: string; id?: string; src: string }>;
  theme?: string;
  visibilite?: "public" | "prive";
  client?:
    | string
    | { _id: string; email: string; nom?: string; prenom?: string };
  clientEmail?: string;

  codeAcces?: string;
  isPublic?: boolean;
  availableTariffIds?: string[];
  photosOriginales?: PhotoOriginale[];
  typeValidite?: "permanent" | "temporaire";
  dateExpiration?: string;
  typeLimiteTelechargement?: "illimite" | "par_photo" | "total";
  maxTelechargementParPhoto?: number;
  maxTelechargementTotal?: number;
  nbTelechargementTotal?: number;
  statut?: "actif" | "expire" | "suspendu";

  customization?: {
    accentColor?: string;
    backgroundColor?: string | null;
    badge?: {
      text?: string | null;
      color?: string;
      position?: "top-left" | "top-right";
    };
    typography?: {
      titleFont?: "default" | "playfair" | "cinzel" | "montserrat";
      titleSize?: "small" | "medium" | "large";
      titleStyle?: "normal" | "bold" | "italic";
    };
    displayOrder?: number;
    icon?: string | null;
    hoverEffect?: "none" | "zoom" | "rotate" | "glow";
  };
}
