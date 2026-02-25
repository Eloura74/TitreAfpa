import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config/api";

interface ImportStats {
  categories: number;
  totalFormats: number;
  tarifsImportes: number;
  params: {
    tauxURSSAF: number;
    coefficientGlobal: number;
  };
}

interface ImportResponse {
  success: boolean;
  message: string;
  stats: ImportStats;
  errors?: string[];
}

const ImportTarifsJSON: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!file.name.endsWith(".json")) {
      setError("Format de fichier invalide. Utilisez un fichier .json");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux. Taille maximum : 5 MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(20);
    setError(null);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const jsonData = JSON.parse(text);

      setProgress(40);

      const catalogueData = jsonData["CATALOGUE COMPLET"];
      if (!catalogueData || !Array.isArray(catalogueData)) {
        throw new Error("Format JSON invalide. La clé 'CATALOGUE COMPLET' est requise.");
      }

      const tauxURSSAF = catalogueData.find((item) => item.Paramètres === "Taux URSSAF")?.[
        "Unnamed: 1"
      ] || 0.233;
      const coefficientGlobal = catalogueData.find(
        (item) => item.Paramètres === "Coefficient global"
      )?.["Unnamed: 1"] || 2.5;

      setProgress(60);

      const tarifs = catalogueData
        .filter(
          (item) =>
            item.Paramètres &&
            item.Paramètres !== "Taux URSSAF" &&
            item.Paramètres !== "Coefficient global" &&
            item.Paramètres !== "Gamme / Finition" &&
            item["Unnamed: 1"] &&
            item["Unnamed: 4"]
        )
        .map((item) => ({
          gamme: item.Paramètres,
          format: item["Unnamed: 1"],
          coutFournisseur: parseFloat(item["Unnamed: 2"]) || 0,
          coefficient: parseFloat(item["Unnamed: 3"]) || coefficientGlobal,
          prixSite: parseFloat(item["Unnamed: 4"]),
          netApresURSSAF: parseFloat(item["Unnamed: 5"]) || 0,
          margeNette: parseFloat(item["Unnamed: 6"]) || 0,
        }));

      if (tarifs.length === 0) {
        throw new Error("Aucun tarif trouvé dans le fichier JSON");
      }

      setProgress(80);

      const response = await axios.post<ImportResponse>(
        `${API_URL}/api/tarifs/import-json`,
        {
          tarifs,
          params: { tauxURSSAF, coefficientGlobal },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setProgress(100);
      setResult(response.data);
      setSelectedFile(null);
    } catch (err) {
      console.error("Erreur lors de l'import:", err);

      if (err instanceof SyntaxError) {
        setError("Fichier JSON invalide. Vérifiez la syntaxe du fichier.");
      } else if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setError(`Erreurs :\n${err.response.data.errors.join("\n")}`);
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'import du fichier.");
      }
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-4">
        📊 Importer les tarifs depuis JSON
      </h2>

      <p className="text-gray-400 mb-6">
        Uploadez votre fichier JSON pour mettre à jour automatiquement tous les tarifs.
        Les tarifs existants seront remplacés.
      </p>

      {!result && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-600"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">📁</div>
            <div>
              <p className="text-white font-medium mb-2">
                Glissez votre fichier JSON ici
              </p>
              <p className="text-gray-400 text-sm mb-4">ou</p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block transition-colors">
                Parcourir les fichiers
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-gray-500 text-sm">
              Format accepté : .json • Taille max : 5 MB
            </p>
          </div>
        </div>
      )}

      {selectedFile && !result && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Traitement en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleUpload}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                🚀 Importer les tarifs
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">❌</div>
            <div className="flex-1">
              <p className="text-red-400 font-medium mb-1">Erreur</p>
              <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      {result && result.success && (
        <div className="mt-6 bg-green-900/20 border border-green-500 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <p className="text-green-400 font-bold text-lg mb-1">
                Import réussi !
              </p>
              <p className="text-green-300 text-sm">{result.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-800/50 rounded-lg p-4">
            <div>
              <p className="text-gray-400 text-sm">Catégories</p>
              <p className="text-white font-bold text-2xl">
                {result.stats.categories}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total formats</p>
              <p className="text-white font-bold text-2xl">
                {result.stats.totalFormats}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tarifs importés</p>
              <p className="text-white font-bold text-2xl">
                {result.stats.tarifsImportes}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Coefficient</p>
              <p className="text-white font-bold text-2xl">
                {result.stats.params.coefficientGlobal}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Importer un autre fichier
          </button>
        </div>
      )}

      <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm font-medium mb-2">
          📋 Format JSON attendu :
        </p>
        <pre className="text-gray-500 text-xs bg-black/30 p-3 rounded overflow-x-auto">
{`{
  "CATALOGUE COMPLET": [
    { "Paramètres": "Taux URSSAF", "Unnamed: 1": 0.233 },
    { "Paramètres": "Coefficient global", "Unnamed: 1": 2.5 },
    { "Paramètres": "Lambda", "Unnamed: 1": "50×75", "Unnamed: 2": 21.08, ... }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default ImportTarifsJSON;
