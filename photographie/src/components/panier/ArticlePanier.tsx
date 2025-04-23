import React from 'react';
import { ArticlePanierType } from '../../types/panier';
import { usePanier } from '../../store/panierContext';

interface Props {
  article: ArticlePanierType;
}

// Composant pour afficher un article du panier
const ArticlePanier: React.FC<Props> = ({ article }) => {
  const { retirerArticle } = usePanier();

  return (
    <div className="flex items-center justify-between bg-[#151520] p-4 rounded shadow mb-4">
      <div className="flex items-center gap-4">
        {/* Prévisualisation de l'image si disponible */}
        {article.image && (
          <img
            src={article.image}
            alt={article.nom}
            className="w-20 h-20 object-cover rounded border border-[#ffe992]"
          />
        )}
        <div>
          <h2 className="font-semibold text-lg text-[#ffe992]">{article.nom}</h2>
          <p className="text-gray-400">Quantité : {article.quantite}</p>
          <p className="text-gray-300">Prix unitaire : {article.prix} €</p>
        </div>
      </div>
      <button
        className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        onClick={() => retirerArticle(article.id)}
      >
        Retirer
      </button>
    </div>
  );
};

export default ArticlePanier;
