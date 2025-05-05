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
