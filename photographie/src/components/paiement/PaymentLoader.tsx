/**
 * 🔄 LOADER DE PAIEMENT AVEC PROGRESS BAR
 * 
 * Empêche les doubles paiements en bloquant l'interface pendant le traitement
 * Affiche une progress bar réaliste et rassurante pour l'utilisateur
 * 
 * Étapes :
 * 1. Création de la commande (30%)
 * 2. Vérification PayPal (60%)
 * 3. Finalisation (100%)
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentLoaderProps {
  /** Étape actuelle du paiement */
  stage: 'creating' | 'verifying' | 'finalizing' | 'complete';
  /** Message personnalisé optionnel */
  message?: string;
}

const PaymentLoader: React.FC<PaymentLoaderProps> = ({ stage, message }) => {
  const [progress, setProgress] = useState(0);

  // Mapping des étapes → pourcentages
  const stageProgress = {
    creating: 30,
    verifying: 60,
    finalizing: 90,
    complete: 100,
  };

  // Animation progressive de la barre
  useEffect(() => {
    const targetProgress = stageProgress[stage];
    const increment = (targetProgress - progress) / 20; // 20 étapes d'animation

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        return Math.min(prev + increment, targetProgress);
      });
    }, 50); // Update toutes les 50ms

    return () => clearInterval(interval);
  }, [stage]);

  // Messages par étape
  const stageMessages = {
    creating: "📦 Création de votre commande...",
    verifying: "🔒 Vérification du paiement avec PayPal...",
    finalizing: "✅ Finalisation de la transaction...",
    complete: "🎉 Paiement réussi !",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a1a24] border-2 border-[#ffe992]/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Icon animé */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#ffe992] border-t-transparent rounded-full"
          />
        </div>

        {/* Message principal */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {message || stageMessages[stage]}
        </h3>

        <p className="text-gray-400 text-sm text-center mb-6">
          Ne fermez pas cette fenêtre ni n'appuyez sur le bouton retour.
        </p>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-[#2a2a34] rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ffe992] to-[#ffd700] rounded-full"
          />
        </div>

        {/* Pourcentage */}
        <p className="text-[#ffe992] text-center font-bold text-lg">
          {Math.round(progress)}%
        </p>

        {/* Liste des étapes */}
        <div className="mt-6 space-y-2">
          {Object.entries(stageProgress).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  progress >= value
                    ? 'bg-[#ffe992] text-black'
                    : 'bg-[#2a2a34] text-gray-500'
                }`}
              >
                {progress >= value && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${
                  progress >= value ? 'text-white font-medium' : 'text-gray-500'
                }`}
              >
                {stageMessages[key as keyof typeof stageMessages]}
              </span>
            </div>
          ))}
        </div>

        {/* Warning sécurité */}
        <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            🔒 Transaction sécurisée via PayPal
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentLoader;
