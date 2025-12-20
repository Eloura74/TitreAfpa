// ==============================
//  Importations des modules et ressources
// ==============================
import React from "react"; // Import de React pour JSX
import ListeArticlesPanier from "../components/panier/ListeArticlesPanier"; // Composant qui affiche la liste des articles dans le panier
import Navbar from "../components/layout/navbar"; // Barre de navigation
import Footer from "../components/layout/Footer"; // Pied de page
import { Link } from "react-router-dom"; // Pour faire des liens entre pages sans recharger
import { usePanier } from "../store/panierContext"; // Hook personnalisé pour gérer l’état du panier global

// ==============================
//  Vue principale du panier
// ==============================
const Panier: React.FC = () => {
  // On récupère les informations du panier via le contexte global
  const { articles, total, viderPanier } = usePanier();

  // ==============================
  //  Affichage principal du composant
  // ==============================
  return (
    // Conteneur principal : hauteur minimale, fond sombre, texte clair, mise en page en colonne
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col mt-18">
      <Navbar /> {/* Barre de navigation en haut */}
      {/* Contenu principal centré, avec marges */}
      <div className="flex-1 container mx-auto p-4">
        {/* Titre principal centré avec style */}
        <h1 className="text-3xl font-bold mb-6 text-center text-[#ffe992]">
          Mon panier
        </h1>

        {/* Liste des articles : on passe la liste d’articles au composant dédié */}
        <ListeArticlesPanier articles={articles} />

        {/* Zone avec total + boutons d’action */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 bg-[#151520] p-6 rounded-lg border border-gray-800">
          {/* Affiche le total à payer */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm uppercase tracking-wider">Total estimé</p>
            <span className="text-3xl font-bold text-[#ffe992]">
              {total.toFixed(2)} €
            </span>
          </div>

          {/* Boutons : vider, valider, revenir à la galerie */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Bouton pour vider le panier */}
            <button
              className="px-6 py-3 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-300"
              onClick={viderPanier}
            >
              Vider le panier
            </button>

            {/* Bouton lien vers la galerie photo pour continuer les achats */}
            <Link to="/galerie">
              <button className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#d6c487] text-[#ffe992] hover:bg-[#d6c487]/10 transition-all duration-300">
                Continuer mes achats
              </button>
            </Link>

            {/* Bouton Valider la commande */}
            <Link to="/checkout">
              <button className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#d6c487] to-[#ffe992] text-black font-bold shadow-lg hover:shadow-[#ffe992]/20 transform hover:scale-[1.02] transition-all duration-300">
                Procéder au paiement
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Footer /> {/* Pied de page */}
    </div>
  );
};

export default Panier;
