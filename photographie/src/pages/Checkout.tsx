// Importations des modules nécessaires
// React : framework React
// useSearchParams : hook React pour la gestion des paramètres de la route
// Navbar : composant de navigation
// Footer : composant de footer
import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

// Fonction principale du composant Checkout
const Checkout: React.FC = () => {
  const [params] = useSearchParams(); // Récupération des paramètres de la route
  const success = params.get("success"); // Vérification si le paiement a réussi
  const canceled = params.get("canceled"); // Vérification si le paiement a été annulé

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        {success && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#ffe992] mb-4">
              Paiement réussi !
            </h1>
            <p className="mb-8">
              Merci pour votre achat. Vous recevrez un email de confirmation.
            </p>
          </div>
        )}
        {canceled && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">
              Paiement annulé
            </h1>
            <p className="mb-8">
              Votre paiement a été annulé. Vous pouvez réessayer à tout moment.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
