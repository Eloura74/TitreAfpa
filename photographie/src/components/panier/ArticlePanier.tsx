// === Importations de base ===
import React from "react";
import { ArticlePanierType } from "../../types/panier"; // Type pour définir la structure d’un article du panier
import { usePanier } from "../../store/panierContext"; // Contexte personnalisé pour accéder aux fonctions liées au panier

// Interface des props attendues par le composant
interface Props {
  article: ArticlePanierType; // Un seul article à afficher, typé avec son format
}

// === Composant fonctionnel qui affiche un article dans le panier ===
const ArticlePanier: React.FC<Props> = ({ article }) => {
  // On récupère la fonction pour retirer un article du panier
  const { retirerArticle } = usePanier();

  return (
    <div className="flex items-center justify-between bg-[#151520] p-4 rounded shadow mb-4">
      {/* === Partie gauche : image + infos article === */}
      <div className="flex items-center gap-4">
        {/* Affiche l’image de l’article si disponible */}
        {article.image && (() => {
            const urlImage =
              article.image && article.image.startsWith("http")
                ? article.image
                : article.image && article.image.startsWith("/uploads/")
                ? `${import.meta.env.VITE_API_URL}${article.image}`
                : article.image && article.image.startsWith("/images/")
                ? article.image
                : `/images/${article.image}`;
            return (
              <div className="group relative">
                <img
                  src={urlImage} // Chemin d’image corrigé
                  alt={article.nom} // Texte alternatif pour accessibilité
                  className="w-20 h-20 object-cover rounded border border-[#ffe992] 
                             transition-transform duration-300 group-hover:scale-150 z-10"
                  style={{ cursor: "pointer" }}
                />
              </div>
            );
          })()}

        {/* Informations textuelles de l’article */}
        <div>
          <h2 className="font-semibold text-lg text-[#ffe992]">
            {article.nom} {/* Nom de l’article */}
          </h2>
          <p className="text-gray-400">
            Quantité : {article.quantite} {/* Nombre d’unités dans le panier */}
          </p>
          <p className="text-gray-300">
            Prix unitaire : {article.prix} € {/* Prix unitaire affiché */}
          </p>
        </div>
      </div>

      {/* === Partie droite : bouton pour retirer l’article === */}
      <button
        className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] 
                   px-4 py-2 rounded-sm transition-all duration-300 
                   hover:bg-[#d6c487] hover:text-black"
        onClick={() => retirerArticle(article.id)} // Supprime l’article du panier à l’aide de son ID
      >
        Retirer
      </button>
    </div>
  );
};

export default ArticlePanier;
