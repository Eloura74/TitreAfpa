// Interface pour les tarifs standards (API)
export interface Tarif {
  id: string;
  nom: string;
  type: "tirage" | "poster" | "toile" | "cadeau" | "textile";
  format: string;
  prix: number;
  support: string;
  actif: boolean;
  imageUrl?: string;
}

// Interface pour les tarifs dynamiques (formats/supports/prix) des photos
export interface TarifOeuvre {
  id: string;
  format: string;
  support: string;
  prix: number;
}
