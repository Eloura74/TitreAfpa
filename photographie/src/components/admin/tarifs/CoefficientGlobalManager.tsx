import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config/api";
import { Calculator, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const COEFFICIENT_BASE = 1.75;

interface RecalculStats {
  tarifsUpdated: number;
  photosUpdated: number;
  totalPricesChanged: number;
}

export default function CoefficientGlobalManager() {
  const [coefficient, setCoefficient] = useState<string>(
    COEFFICIENT_BASE.toString(),
  );
  const [currentCoefficient, setCurrentCoefficient] =
    useState<number>(COEFFICIENT_BASE);
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    stats?: RecalculStats;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const loadCurrentCoefficient = async () => {
      try {
        setLoadingConfig(true);
        const response = await axios.get(`${API_URL}/api/tarifs/config`, {
          withCredentials: true,
        });

        if (response.data && response.data.globalCoefficient) {
          const currentCoef = response.data.globalCoefficient;
          setCurrentCoefficient(currentCoef);
          setCoefficient(currentCoef.toString());
        }
      } catch (error) {
        console.error("Erreur lors du chargement du coefficient:", error);
      } finally {
        setLoadingConfig(false);
      }
    };

    loadCurrentCoefficient();
  }, []);

  const handleCoefficientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCoefficient(value);
      setResult(null);
    }
  };

  const calculateRatio = (): number => {
    const newCoef = parseFloat(coefficient);
    return newCoef / currentCoefficient;
  };

  const handleRecalculate = async () => {
    const newCoef = parseFloat(coefficient);

    if (isNaN(newCoef) || newCoef <= 0) {
      setResult({
        success: false,
        message: "Veuillez entrer un coefficient valide (supérieur à 0)",
      });
      return;
    }

    if (newCoef === currentCoefficient) {
      setResult({
        success: false,
        message: `Le coefficient est déjà à ${currentCoefficient}. Aucun changement nécessaire.`,
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmRecalculate = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setResult(null);

    try {
      const newCoef = parseFloat(coefficient);
      const ratio = calculateRatio();

      const response = await axios.post(
        `${API_URL}/api/tarifs/recalculate-global`,
        {
          newCoefficient: newCoef,
          baseCoefficient: currentCoefficient,
          ratio: ratio,
        },
        {
          withCredentials: true,
        },
      );

      setResult({
        success: true,
        message: "Recalcul effectué avec succès ! Rechargement de la page...",
        stats: response.data.stats,
      });
      setCurrentCoefficient(newCoef);
      setCoefficient(newCoef.toString());

      // Recharger la page après 2 secondes pour afficher les nouveaux prix
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors du recalcul:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setResult({
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Erreur lors du recalcul des tarifs",
      });
    } finally {
      setLoading(false);
    }
  };

  const ratio = calculateRatio();
  const isChanged = parseFloat(coefficient) !== currentCoefficient;

  if (loadingConfig) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 size={24} className="text-[#ffe992] animate-spin" />
          <p className="text-gray-400">Chargement du coefficient actuel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <Calculator size={24} className="text-[#ffe992]" />
        <h2 className="text-2xl font-bold text-white">
          Coefficient Global de Tarification
        </h2>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
        <p className="text-gray-300 text-sm mb-2">
          <span className="font-bold text-[#ffe992]">Coefficient actuel :</span>{" "}
          {currentCoefficient}
        </p>
        <p className="text-gray-400 text-xs">
          Tous vos tarifs actuels ont été calculés avec un coefficient de{" "}
          {currentCoefficient}. Modifier ce coefficient recalculera{" "}
          <span className="font-bold text-white">
            TOUS les prix des tarifs ET des œuvres
          </span>{" "}
          proportionnellement.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nouveau Coefficient
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={coefficient}
            onChange={handleCoefficientChange}
            disabled={loading}
            className="w-full bg-black/20 border border-gray-700 rounded-lg p-3 text-white text-lg font-mono focus:border-[#ffe992] focus:outline-none transition-colors disabled:opacity-50"
            placeholder="1.75"
          />
        </div>

        {isChanged && !isNaN(ratio) && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm font-medium mb-2">
              Aperçu du changement
            </p>
            <div className="space-y-1 text-xs text-blue-200">
              <p>
                Ratio de multiplication :{" "}
                <span className="font-mono font-bold">×{ratio.toFixed(4)}</span>
              </p>
              <p className="text-gray-400">
                Exemple : Un tarif de 100€ deviendra{" "}
                <span className="font-bold text-white">
                  {(100 * ratio).toFixed(2)}€
                </span>
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleRecalculate}
          disabled={loading || !isChanged}
          className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            loading || !isChanged
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-[#ffe992] text-black hover:bg-[#d6c487] shadow-lg shadow-[#ffe992]/20"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Recalcul en cours...
            </>
          ) : (
            <>
              <Calculator size={20} />
              Recalculer tous les tarifs
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`mt-6 rounded-lg p-4 border ${
            result.success
              ? "bg-green-900/20 border-green-500/30"
              : "bg-red-900/20 border-red-500/30"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
            ) : (
              <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium mb-1 ${
                  result.success ? "text-green-300" : "text-red-300"
                }`}
              >
                {result.message}
              </p>
              {result.stats && (
                <div className="mt-3 grid grid-cols-3 gap-4 bg-black/20 rounded p-3">
                  <div>
                    <p className="text-xs text-gray-400">Tarifs mis à jour</p>
                    <p className="text-lg font-bold text-white">
                      {result.stats.tarifsUpdated}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Œuvres mises à jour</p>
                    <p className="text-lg font-bold text-white">
                      {result.stats.photosUpdated}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Prix modifiés</p>
                    <p className="text-lg font-bold text-white">
                      {result.stats.totalPricesChanged}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle
                size={24}
                className="text-yellow-400 flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Confirmer le recalcul global
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Cette action va modifier{" "}
                  <span className="font-bold">TOUS les prix</span> de :
                </p>
                <ul className="text-gray-400 text-sm space-y-1 mb-4">
                  <li>✓ Tous les tarifs configurés</li>
                  <li>✓ Toutes les œuvres du site</li>
                </ul>
                <p className="text-yellow-300 text-sm font-medium">
                  Ratio appliqué : ×{ratio.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmRecalculate}
                className="flex-1 py-2 bg-[#ffe992] hover:bg-[#d6c487] text-black font-bold rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
