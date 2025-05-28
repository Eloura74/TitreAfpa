// ==========================================================================
// 📦 IMPORTATIONS ESSENTIELLES
// ==========================================================================
import React from "react"; // Import du framework React pour composants fonctionnels
import { useSearchParams } from "react-router-dom"; // Hook React Router pour lire les paramètres d'URL

// Import des composants de layout (navigation et pied de page)
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

// ==========================================================================
// 💳 COMPOSANT PRINCIPAL : PAGE DE RETOUR DE PAIEMENT
// ==========================================================================
const Checkout: React.FC = () => {
  // ------------------------------------------------------------------------
  // 🔍 PARAMÈTRES DE L’URL (issus de Stripe ou autre système de paiement)
  // ------------------------------------------------------------------------
  const [params] = useSearchParams(); // Récupère les paramètres de l’URL
  const success = params.get("success"); // Extrait ?success=true si paiement OK
  const canceled = params.get("canceled"); // Extrait ?canceled=true si paiement annulé

  // ------------------------------------------------------------------------
  // 🎨 AFFICHAGE JSX DE LA PAGE
  // ------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      {/* Barre de navigation en haut */}
      <Navbar />

      {/* Contenu principal centré verticalement */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* ✅ Si succès = affichage du message de réussite */}
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

        {/* ❌ Si canceled = affichage du message d'annulation */}
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

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

// --------------------------------------------------------------------------
// Export du composant pour utilisation dans le routeur
// --------------------------------------------------------------------------
export default Checkout;
