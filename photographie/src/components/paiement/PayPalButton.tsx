import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "../Toast";

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

const PayPalButton: React.FC<PayPalButtonProps> = ({ articles, total: _total }) => {
  const { addToast } = useToast();

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 45, tagline: false }}
      createOrder={async () => {
        try {
          const response = await fetch("/api/paypal/create-order", {
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
            return orderData.id;
          } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
              ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
              : JSON.stringify(orderData);

            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      }}
      onApprove={async (data, actions) => {
        try {
          const response = await fetch(
            `/api/paypal/capture-order/${data.orderID}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
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
              `${errorDetail.description} (${orderData.debug_id})`
            );
          } else {
            // (3) Successful transaction -> Show confirmation or thank you message
            // Or go to a success page
            window.location.href = "/checkout?success=true";
          }
        } catch (error) {
          console.error(error);
          addToast("La transaction a échoué. Veuillez réessayer.", "error");
        }
      }}
    />
  );
};

export default PayPalButton;
