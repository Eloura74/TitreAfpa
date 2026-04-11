import React, { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "../Toast";
import PaymentLoader from "./PaymentLoader";
import { API_URL } from "../../config/api";

interface PayPalButtonProps {
  articles: Array<{
    id: string;
    nom: string;
    prix: number;
    quantite: number;
    format?: string;
    support?: string;
  }>;
  total: number;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  articles,
  total: _total,
}) => {
  const { addToast } = useToast();

  // 🔒 État pour gérer le loader et empêcher les doubles clics
  const [paymentStage, setPaymentStage] = useState<
    "creating" | "verifying" | "finalizing" | "complete" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <>
      {/* 🔄 Loader de paiement affiché pendant le traitement */}
      {paymentStage && <PaymentLoader stage={paymentStage} />}

      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 45,
          tagline: false,
        }}
        // 🔒 Désactive le bouton pendant le traitement
        disabled={isProcessing}
        createOrder={async () => {
          try {
            // 🔒 Empêche les doubles clics
            if (isProcessing) {
              throw new Error("Paiement déjà en cours");
            }

            setIsProcessing(true);
            setPaymentStage("creating");

            const response = await fetch(`${API_URL}/api/paypal/create-order`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                articles: articles,
              }),
            });

            const orderData = await response.json();

            if (orderData.id) {
              setPaymentStage("verifying"); // Passe à l'étape suivante
              return orderData.id;
            } else {
              const errorDetail = orderData?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

              throw new Error(errorMessage);
            }
          } catch (error) {
            setIsProcessing(false);
            setPaymentStage(null);
            addToast("Erreur lors de la création de la commande", "error");
            throw error;
          }
        }}
        onApprove={async (data, actions) => {
          try {
            setPaymentStage("finalizing"); // Étape de finalisation

            const response = await fetch(
              `${API_URL}/api/paypal/capture-order/${data.orderID}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            const orderData = await response.json();
            // Three cases to handle:
            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            //   (2) Other non-recoverable errors -> Show a failure message
            //   (3) Successful transaction -> Show confirmation or thank you message

            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
              // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
              // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
              return actions.restart();
            } else if (errorDetail) {
              // (2) Other non-recoverable errors -> Show a failure message
              throw new Error(
                `${errorDetail.description} (${orderData.debug_id})`,
              );
            } else {
              // (3) Successful transaction -> Show confirmation or thank you message
              setPaymentStage("complete");

              // Petit délai pour montrer le succès
              setTimeout(() => {
                window.location.href = "/checkout?success=true";
              }, 1000);
            }
          } catch (error) {
            setIsProcessing(false);
            setPaymentStage(null);
            addToast("La transaction a échoué. Veuillez réessayer.", "error");
          }
        }}
        onCancel={() => {
          // Réinitialise si l'utilisateur annule
          setIsProcessing(false);
          setPaymentStage(null);
          addToast("Paiement annulé", "info");
        }}
        onError={() => {
          setIsProcessing(false);
          setPaymentStage(null);
          addToast("Erreur lors du paiement PayPal", "error");
        }}
      />
    </>
  );
};

export default PayPalButton;
