// ==========================================================================
// 📦 IMPORTATIONS ESSENTIELLES
// ==========================================================================
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { usePanier } from "../store/panierContext";
import { useUser } from "../context/UserContext";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "../components/paiement/PayPalButton";
import { useToast } from "../components/Toast";

// ==========================================================================
// 💳 COMPOSANT PRINCIPAL : PAGE DE PAIEMENT (CHECKOUT)
// ==========================================================================
const Checkout: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { articles, total, viderPanier } = usePanier();
  const { user } = useUser();
  const { addToast } = useToast();
  
  const success = params.get("success");
  const canceled = params.get("canceled");

  // État pour le formulaire de livraison
  const [shippingInfo, setShippingInfo] = useState({
    nom: "",
    prenom: "",
    email: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "France",
  });

  // Pré-remplissage avec les données utilisateur
  useEffect(() => {
    if (user) {
      setShippingInfo((prev) => ({
        ...prev,
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "", // On suppose que l'email est dispo dans user context (à vérifier)
        adresse: user.adresse?.rue || "",
        ville: user.adresse?.ville || "",
        codePostal: user.adresse?.codePostal || "",
        pays: user.adresse?.pays || "France",
      }));
    }
  }, [user]);

  // Gestion des succès/échecs après redirection paiement
  useEffect(() => {
    if (success) {
      viderPanier();
      addToast("Paiement réussi ! Merci pour votre commande.", "success");
    } else if (canceled) {
      addToast("Paiement annulé.", "error");
    }
  }, [success, canceled, viderPanier, addToast]);

  // Si retour de paiement, on affiche juste le message (ou on redirige vers historique)
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-green-500/10 p-8 rounded-full mb-6">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-[#ffe992] mb-4">Commande confirmée !</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            Merci pour votre achat. Un email de confirmation vous a été envoyé.
            Votre commande sera traitée dans les plus brefs délais.
          </p>
          <button onClick={() => navigate("/mon-compte")} className="btn btn-outline border-[#ffe992] text-[#ffe992] hover:bg-[#ffe992] hover:text-black">
            Voir ma commande
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Si panier vide et pas de succès, redirection galerie
  if (articles.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-xl text-gray-400 mb-4">Votre panier est vide.</p>
          <button onClick={() => navigate("/galerie")} className="btn btn-primary">
            Retourner à la galerie
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  /*
  const handleStripePayment = async () => {
    try {
      // On pourrait valider l'adresse ici avant de lancer le paiement
      const { url } = await createCheckoutSession(articles);
      window.location.href = url;
    } catch (e) {
      console.error(e);
      addToast("Erreur lors de l'initialisation de Stripe", "error");
    }
  };
  */

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col mt-16">
      <Navbar />
      
      <div className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-[#ffe992] mb-8 flex items-center gap-3">
          <span className="bg-[#ffe992] text-black rounded-full w-8 h-8 flex items-center justify-center text-lg">3</span>
          Finalisation de la commande
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : Formulaire Livraison */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#151520] p-8 rounded-lg border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <span className="text-2xl">📍</span> Adresse de livraison
              </h2>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control space-y-2">
                  <label className="label text-xs font-bold uppercase text-[#d6c487] tracking-wider ml-1">Prénom</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all placeholder-gray-600"
                    value={shippingInfo.prenom}
                    onChange={(e) => setShippingInfo({...shippingInfo, prenom: e.target.value})}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="form-control space-y-2">
                  <label className="label text-xs font-bold uppercase text-[#d6c487] tracking-wider ml-1">Nom</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all placeholder-gray-600"
                    value={shippingInfo.nom}
                    onChange={(e) => setShippingInfo({...shippingInfo, nom: e.target.value})}
                    placeholder="Votre nom"
                  />
                </div>
                
                <div className="form-control md:col-span-2 space-y-2">
                  <label className="label text-xs font-bold uppercase text-[#d6c487] tracking-wider ml-1">Adresse</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all placeholder-gray-600"
                    value={shippingInfo.adresse}
                    onChange={(e) => setShippingInfo({...shippingInfo, adresse: e.target.value})}
                    placeholder="N° et nom de rue"
                  />
                </div>

                <div className="form-control space-y-2">
                  <label className="label text-xs font-bold uppercase text-[#d6c487] tracking-wider ml-1">Code Postal</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all placeholder-gray-600"
                    value={shippingInfo.codePostal}
                    onChange={(e) => setShippingInfo({...shippingInfo, codePostal: e.target.value})}
                    placeholder="Ex: 75001"
                  />
                </div>
                <div className="form-control space-y-2">
                  <label className="label text-xs font-bold uppercase text-[#d6c487] tracking-wider ml-1">Ville</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all placeholder-gray-600"
                    value={shippingInfo.ville}
                    onChange={(e) => setShippingInfo({...shippingInfo, ville: e.target.value})}
                    placeholder="Votre ville"
                  />
                </div>
              </form>
            </div>

            {/* Section Paiement */}
            {/* Section Paiement */}
            <div className="bg-[#151520] p-8 rounded-lg border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                <span className="text-2xl">💳</span> Paiement sécurisé
              </h2>
              
              <div className="space-y-6">
                {/* Option Stripe - DÉSACTIVÉ TEMPORAIREMENT
                <button 
                  onClick={handleStripePayment}
                  className="w-full bg-[#635bff] hover:bg-[#544de6] text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
                >
                  <span>Payer par Carte Bancaire (Stripe)</span>
                </button>

                <div className="divider text-gray-600 font-medium text-sm">OU</div>
                */}

                {/* Message informatif */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-4">
                  <p className="text-blue-200 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Choisissez PayPal pour un paiement sécurisé (Compte ou Carte Bancaire)
                  </p>
                </div>

                {/* Option PayPal */}
                {/* Option PayPal */}
                <div className="w-full relative z-0 bg-black/40 p-6 rounded-xl border border-[#ffe992] shadow-[0_0_15px_rgba(255,233,146,0.15)] hover:shadow-[0_0_25px_rgba(255,233,146,0.25)] transition-all duration-300 group">
                  <div className="absolute -top-3 left-4 bg-[#ffe992] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Recommandé
                  </div>
                  <PayPalScriptProvider
                    options={{
                      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                      currency: "EUR",
                    }}
                  >
                    <div className="paypal-button-container relative z-10 max-w-md mx-auto">
                      <PayPalButton articles={articles} total={total} />
                    </div>
                  </PayPalScriptProvider>
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  Vos données de paiement sont chiffrées et sécurisées.
                </p>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-[#151520] p-8 rounded-lg border border-gray-800 sticky top-24 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6 border-b border-gray-800 pb-4">Récapitulatif de la commande</h2>
              
              <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {articles.map((article) => (
                  <div key={article.id} className="flex gap-4 items-start pb-4 border-b border-gray-800/50 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-900 rounded-md overflow-hidden shrink-0 border border-gray-700">
                      <img src={article.image} alt={article.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-100 leading-tight mb-1">{article.nom}</p>
                      <p className="text-xs text-gray-400">Quantité: <span className="text-white">{article.quantite}</span></p>
                    </div>
                    <div className="text-sm font-bold text-[#ffe992] whitespace-nowrap">
                      {(article.prix * article.quantite).toFixed(2)}€
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Livraison</span>
                  <span className="text-green-400">Offerte</span>
                </div>
                <div className="flex justify-between items-end pt-4 mt-2 border-t border-gray-700">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-[#ffe992]">{total.toFixed(2)}€</span>
                </div>
              </div>
              
              {/* Badges de confiance */}
              <div className="mt-8 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* On pourrait ajouter des icones de cartes ici si on avait les assets */}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
