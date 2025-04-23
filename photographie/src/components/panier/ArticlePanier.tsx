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
          <div className="group relative">
            <img
              src={article.image}
              alt={article.nom}
              className="w-20 h-20 object-cover rounded border border-[#ffe992] transition-transform duration-300 group-hover:scale-150 z-10"
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
        <div>
          <h2 className="font-semibold text-lg text-[#ffe992]">{article.nom}</h2>
          <p className="text-gray-400">Quantité : {article.quantite}</p>
          <p className="text-gray-300">Prix unitaire : {article.prix} €</p>
        </div>
      </div>
      <button
        className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
        onClick={() => retirerArticle(article.id)}
      >
        Retirer
      </button>
    </div>
  );
};

export default ArticlePanier;
