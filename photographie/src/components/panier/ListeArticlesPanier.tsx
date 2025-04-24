// Importations des modules nécessaires
// React : framework React
// ArticlePanier : composant pour afficher un article du panier
// ArticlePanierType : type pour les articles du panier
import React from "react";
import ArticlePanier from "./ArticlePanier";
import { ArticlePanierType } from "../../types/panier";

// Interface pour les props du composant
interface Props {
  articles: ArticlePanierType[];
}

// Liste des articles dans le panier
const ListeArticlesPanier: React.FC<Props> = ({ articles }) => {
  if (articles.length === 0) {
    return <p className="text-gray-500">Votre panier est vide.</p>;
  }
  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticlePanier key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ListeArticlesPanier;
