import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, X } from "lucide-react";
import { API_URL } from "../config/api";
import { useToast } from "./Toast";

interface Paiement {
  _id: string;
  transactionId: string;
  montant: number;
  date: string;
  dateReception?: string;
  retractationExclue?: boolean;
  retractation?: {
    demandee: boolean;
    statut: string;
    dateDemande?: string;
  };
}

interface RetractationButtonProps {
  paiement: Paiement;
  onRetractationSuccess?: () => void;
}

interface EligibiliteResponse {
  eligible: boolean;
  raison?: string;
  joursRestants?: number;
  dateLimite?: string;
  statut?: string;
}

export default function RetractationButton({
  paiement,
  onRetractationSuccess,
}: RetractationButtonProps) {
  const [eligibilite, setEligibilite] = useState<EligibiliteResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const verifierEligibilite = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/retractation/${paiement._id}/eligibilite`,
      );
      const data = await response.json();
      setEligibilite(data);
    } catch (error) {
      console.error("Erreur vérification éligibilité:", error);
    } finally {
      setLoading(false);
    }
  }, [paiement._id]);

  useEffect(() => {
    verifierEligibilite();
  }, [verifierEligibilite]);

  const handleDemandeRetractation = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(
        `${API_URL}/api/retractation/${paiement._id}/demander`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motif }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la demande");
      }

      addToast("Demande de rétractation enregistrée avec succès", "success");
      setShowModal(false);
      onRetractationSuccess?.();
      verifierEligibilite();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Erreur lors de la demande",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Vérification...
      </div>
    );
  }

  if (!eligibilite?.eligible) {
    if (paiement.retractation?.demandee) {
      const statutLabels: Record<string, { text: string; color: string }> = {
        en_cours: { text: "En cours d'examen", color: "text-blue-400" },
        acceptee: { text: "Acceptée", color: "text-green-400" },
        refusee: { text: "Refusée", color: "text-red-400" },
      };

      const statut = statutLabels[paiement.retractation.statut] || {
        text: "Demandée",
        color: "text-gray-400",
      };

      return (
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle size={16} className={statut.color} />
          <span className={statut.color}>Rétractation : {statut.text}</span>
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg transition-all text-sm font-medium"
      >
        <Clock size={16} />
        <span>Exercer mon droit de rétractation</span>
        {eligibilite.joursRestants !== undefined && (
          <span className="ml-1 text-xs opacity-75">
            ({eligibilite.joursRestants}j restants)
          </span>
        )}
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#151520] border border-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Demande de rétractation
                  </h3>
                  <p className="text-sm text-gray-400">
                    Commande #{paiement.transactionId}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-200 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Conformément à la loi française, vous disposez de 14 jours à
                    compter de la réception pour exercer votre droit de
                    rétractation. Il vous reste{" "}
                    <strong>
                      {eligibilite.joursRestants} jour
                      {eligibilite.joursRestants! > 1 ? "s" : ""}
                    </strong>
                    .
                  </span>
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motif de rétractation (optionnel)
                  </label>
                  <textarea
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Expliquez brièvement la raison de votre rétractation..."
                    className="w-full bg-[#0a0a10] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992] outline-none transition-all resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-gray-700 text-white rounded-lg transition-all font-medium"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDemandeRetractation}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Envoi..." : "Confirmer la demande"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Vous recevrez une confirmation par email une fois votre demande
                traitée.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
