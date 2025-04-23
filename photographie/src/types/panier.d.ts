// Type pour un article du panier
export interface ArticlePanierType {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  image?: string; // Prévisualisation de l'image
}
