export interface Service {
  _id?: string;
  id?: string;
  titre: string;
  description: string;
  prix: number;
  images: string[];
  categorie: "Mariage" | "Shooting" | "Studio" | "Evenement" | "Autre";
  createdAt?: string;
}
