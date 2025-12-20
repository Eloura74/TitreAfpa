// ==============================
//  Importations des modules et ressources
// ==============================
import React from "react"; // Import de React pour JSX
import ListeArticlesPanier from "../components/panier/ListeArticlesPanier"; // Composant qui affiche la liste des articles dans le panier
import Navbar from "../components/layout/navbar"; // Barre de navigation
import Footer from "../components/layout/Footer"; // Pied de page
import { Link } from "react-router-dom"; // Pour faire des liens entre pages sans recharger
import { usePanier } from "../store/panierContext"; // Hook personnalisé pour gérer l’état du panier global
import { createCheckoutSession } from "../services/stripeService"; // Fonction pour démarrer le paiement via Stripe
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "../components/paiement/PayPalButton";

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
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
          {/* Affiche le total à payer */}
          <span className="text-xl font-semibold text-[#ffe992]">
            Total : {total} €
          </span>

          {/* Boutons : vider, valider, revenir à la galerie */}
          <div className="flex gap-4">
            {/* Bouton pour vider le panier */}
            <button
              className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
              onClick={viderPanier} // Appelle la fonction qui vide tous les articles
            >
              Vider le panier
            </button>

            {/* Bouton pour valider le panier, démarre la session Stripe */}
            {/* Bouton pour valider le panier (Stripe) - DÉSACTIVÉ TEMPORAIREMENT
            <button
              className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
              onClick={async () => {
                try {
                  // Appel à l’API pour créer une session de paiement
                  const { url } = await createCheckoutSession(articles);
                  // Redirection vers la page de paiement Stripe
                  window.location.href = url;
                } catch (e) {
                  // Affiche une alerte si erreur de redirection
                  alert("Erreur lors de la redirection vers Stripe");
                }
              }}
            >
              Valider le panier
            </button>
            */}

            {/* Bouton lien vers la galerie photo pour continuer les achats */}
            <Link to="/galerie">
              <button className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black">
                Retour à la galerie
              </button>
            </Link>
          </div>
        </div>

        {/* Section PayPal */}
        <div className="mt-8 flex flex-col items-end">
          <h2 className="text-xl font-semibold text-[#ffe992] mb-4">
            Payer avec PayPal
          </h2>
          <div className="w-full md:w-1/3">
            <PayPalScriptProvider
              options={{
                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                currency: "EUR",
              }}
            >
              <PayPalButton articles={articles} total={total} />
            </PayPalScriptProvider>
          </div>
        </div>
      </div>
      <Footer /> {/* Pied de page */}
    </div>
  );
};

export default Panier;
