export interface Service {
  _id?: string;
  id?: string;
  titre: string;
  description: string;
  prix: number;
  images: string[];
  categorie: "Mariage" | "Shooting" | "Studio" | "Evenement" | "Autre";
  createdAt?: string;

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
