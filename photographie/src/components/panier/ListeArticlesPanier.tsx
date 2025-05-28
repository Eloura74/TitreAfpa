// === Importations des modules nécessaires ===
import React from "react"; // Import du cœur de React (JSX, composants)
import ArticlePanier from "./ArticlePanier"; // Composant enfant qui affiche un article individuel
import { ArticlePanierType } from "../../types/panier"; // Type TypeScript pour définir la forme d’un article

// === Interface pour définir les props attendues par ce composant ===
interface Props {
  articles: ArticlePanierType[]; // Tableau d’articles à afficher
}

// === Composant fonctionnel qui affiche la liste des articles dans le panier ===
const ListeArticlesPanier: React.FC<Props> = ({ articles }) => {
  // Vérifie si le panier est vide
  if (articles.length === 0) {
    return (
      // Message affiché si aucun article n’est présent
      <p className="text-gray-500">Votre panier est vide.</p>
    );
  }

  return (
    // Si des articles sont présents, on les affiche avec une marge entre chaque (space-y)
    <div className="space-y-4">
      {articles.map((article) => (
        // Pour chaque article, on appelle le composant ArticlePanier
        // `key` est une clé unique pour aider React à optimiser le rendu
        <ArticlePanier key={article.id} article={article} />
      ))}
    </div>
  );
};

// === Export du composant pour pouvoir l’utiliser ailleurs dans l’application ===
export default ListeArticlesPanier;
