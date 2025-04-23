import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Checkout: React.FC = () => {
  const [params] = useSearchParams();
  const success = params.get("success");
  const canceled = params.get("canceled");

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        {success && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#ffe992] mb-4">Paiement réussi !</h1>
            <p className="mb-8">Merci pour votre achat. Vous recevrez un email de confirmation.</p>
          </div>
        )}
        {canceled && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Paiement annulé</h1>
            <p className="mb-8">Votre paiement a été annulé. Vous pouvez réessayer à tout moment.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
