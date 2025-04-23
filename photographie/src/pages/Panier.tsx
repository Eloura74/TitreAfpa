import React from "react";
import ListeArticlesPanier from "../components/panier/ListeArticlesPanier";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from "react-router-dom";
import { usePanier } from "../store/panierContext";
import { createCheckoutSession } from "../services/stripeService";

// Vue principale du panier
const Panier: React.FC = () => {
  const { articles, total, viderPanier } = usePanier();

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col mt-18">
      <Navbar />
      <div className="flex-1 container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#ffe992]">
          Mon panier
        </h1>
        <ListeArticlesPanier articles={articles} />
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
          <span className="text-xl font-semibold text-[#ffe992]">
            Total : {total} €
          </span>
          <div className="flex gap-4">
            <button
              className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
              onClick={viderPanier}
            >
              Vider le panier
            </button>
            <button
              className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
              onClick={async () => {
                try {
                  const { url } = await createCheckoutSession(articles);
                  window.location.href = url;
                } catch (e) {
                  alert("Erreur lors de la redirection vers Stripe");
                }
              }}
            >
              Valider le panier
            </button>
            <Link to="/galerie">
              <button className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black">
                Retour à la galerie
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Panier;
