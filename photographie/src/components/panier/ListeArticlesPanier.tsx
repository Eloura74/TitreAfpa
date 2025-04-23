import React from 'react';
import ArticlePanier from './ArticlePanier';
import { ArticlePanierType } from '../../types/panier';

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
