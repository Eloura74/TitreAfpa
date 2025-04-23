import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ArticlePanierType } from '../types/panier';

interface PanierContextType {
  articles: ArticlePanierType[];
  total: number;
  ajouterArticle: (article: ArticlePanierType) => void;
  retirerArticle: (id: string) => void;
  viderPanier: () => void;
}

const PanierContext = createContext<PanierContextType | undefined>(undefined);

export const usePanier = () => {
  const context = useContext(PanierContext);
  if (!context) {
    throw new Error('usePanier doit être utilisé dans un PanierProvider');
  }
  return context;
};

export const PanierProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<ArticlePanierType[]>([]);

  // Calcul du total du panier
  const total = articles.reduce((acc, article) => acc + article.prix * article.quantite, 0);

  // Ajouter un article au panier
  const ajouterArticle = (nouvelArticle: ArticlePanierType) => {
    setArticles((prev) => {
      const existant = prev.find((a) => a.id === nouvelArticle.id);
      if (existant) {
        return prev.map((a) =>
          a.id === nouvelArticle.id ? { ...a, quantite: a.quantite + nouvelArticle.quantite } : a
        );
      }
      return [...prev, nouvelArticle];
    });
  };

  // Retirer un article du panier
  const retirerArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Vider le panier
  const viderPanier = () => {
    setArticles([]);
  };

  return (
    <PanierContext.Provider value={{ articles, total, ajouterArticle, retirerArticle, viderPanier }}>
      {children}
    </PanierContext.Provider>
  );
};
