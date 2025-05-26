// ==============================
//   Importations des modules et ressources
// ==============================

// React : Importation des fonctions nécessaires pour créer un contexte et gérer l'état
import { createContext, useContext, useState, ReactNode } from "react";

// Importation du type TypeScript pour définir la structure d'un article dans le panier
import { ArticlePanierType } from "../types/panier";

// ==============================
//   Définition de l'interface du Contexte Panier
// ==============================
// Cette interface décrit les données et fonctions disponibles dans le contexte
interface PanierContextType {
  articles: ArticlePanierType[]; // Liste des articles présents dans le panier
  total: number; // Montant total du panier
  ajouterArticle: (article: ArticlePanierType) => void; // Fonction pour ajouter un article
  retirerArticle: (id: string) => void; // Fonction pour retirer un article par son ID
  viderPanier: () => void; // Fonction pour vider complètement le panier
}

// ==============================
//   Création du Contexte Panier
// ==============================
// On initialise le contexte avec "undefined" pour forcer l'utilisation via le Provider
const PanierContext = createContext<PanierContextType | undefined>(undefined);

// ==============================
//   Hook personnalisé : usePanier
// ==============================
// Permet d'accéder facilement au contexte Panier dans les composants enfants
export const usePanier = () => {
  const context = useContext(PanierContext);
  if (!context) {
    // Sécurisation : empêche l'utilisation du hook en dehors du Provider
    throw new Error("usePanier doit être utilisé dans un PanierProvider");
  }
  return context;
};

// ==============================
//   Provider : PanierProvider
// ==============================
// Ce composant englobe toute l'application (ou une partie) pour fournir l'accès global au panier
export const PanierProvider = ({ children }: { children: ReactNode }) => {
  // State local pour stocker les articles du panier
  const [articles, setArticles] = useState<ArticlePanierType[]>([]);

  // ==============================
  //   Calcul dynamique du total du panier
  // ==============================
  const total = articles.reduce(
    (acc, article) => acc + article.prix * article.quantite,
    0
  );

  // ==============================
  //   Ajouter un article au panier
  // ==============================
  const ajouterArticle = (nouvelArticle: ArticlePanierType) => {
    setArticles((prev) => {
      // Vérifie si l'article existe déjà dans le panier
      const existant = prev.find((a) => a.id === nouvelArticle.id);

      if (existant) {
        // Si l'article existe, on incrémente simplement la quantité
        return prev.map(
          (a) =>
            a.id === nouvelArticle.id // Si l'article existe, on incrémente la quantité
              ? { ...a, quantite: a.quantite + nouvelArticle.quantite } // Incrémente la quantité
              : a // Sinon, on retourne l'article tel qu'il est
        );
      }

      // Si l'article n'existe pas, on l'ajoute au tableau
      return [...prev, nouvelArticle];
    });
  };

  // ==============================
  //   Retirer un article du panier par son ID
  // ==============================
  const retirerArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // ==============================
  //   Vider complètement le panier
  // ==============================
  const viderPanier = () => {
    setArticles([]); // Réinitialise le tableau des articles
  };

  // ==============================
  //  Fourniture du contexte aux composants enfants
  // ==============================
  return (
    <PanierContext.Provider
      value={{ articles, total, ajouterArticle, retirerArticle, viderPanier }}
    >
      {children} {/* Tous les composants enfants auront accès au contexte */}
    </PanierContext.Provider>
  );
};
