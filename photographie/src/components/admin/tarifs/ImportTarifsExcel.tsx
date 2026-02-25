import React, { useState } from "react";
import axios from "axios";
// @ts-expect-error - xlsx types will be resolved at build time
import * as XLSX from "xlsx";
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

const ImportTarifsExcel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Gestion du drag & drop
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

  // Validation et sélection du fichier
  const handleFileSelection = (file: File) => {
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError("Format de fichier invalide. Utilisez .xlsx ou .xls");
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

  // Gestion du changement de fichier via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Parser Excel côté frontend et envoyer JSON au backend
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(20);
    setError(null);
    setResult(null);

    try {
      // Lire le fichier Excel dans le navigateur
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      setProgress(40);

      // Extraire les données (à partir de la ligne 7)
      const data = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: 6,
      }) as unknown[][];

      // Extraire les paramètres (lignes 2 et 3)
      const paramsSheet = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: 1,
      }) as unknown[][];
      const tauxURSSAF = paramsSheet[0]
        ? parseFloat(String(paramsSheet[0][1]))
        : 23.3;
      const coefficientGlobal = paramsSheet[1]
        ? parseFloat(String(paramsSheet[1][1]))
        : 2.5;

      setProgress(60);

      // Parser les tarifs
      const tarifs: Array<{
        gamme: string;
        format: string;
        coutFournisseur: number;
        coefficient: number;
        prixSite: number;
        netApresURSSAF: number;
        margeNette: number;
      }> = [];
      const errors: string[] = [];

      data.forEach((row, index) => {
        if (!row[0] || row[0] === "Gamme / Finition") return;

        const gamme = String(row[0]).trim();
        const format = String(row[1]).trim();
        const coutFournisseur = parseFloat(String(row[2]));
        const coefficient = parseFloat(String(row[3]));
        const prixSite = parseFloat(String(row[4]));
        const netApresURSSAF = parseFloat(String(row[5]));
        const margeNette = parseFloat(String(row[6]));

        if (!gamme || !format) {
          errors.push(`Ligne ${index + 7}: Gamme ou Format manquant`);
          return;
        }

        if (isNaN(prixSite) || prixSite <= 0) {
          errors.push(
            `Ligne ${index + 7}: Prix invalide pour ${gamme} ${format}`,
          );
          return;
        }

        tarifs.push({
          gamme,
          format,
          coutFournisseur: coutFournisseur || 0,
          coefficient: coefficient || coefficientGlobal,
          prixSite,
          netApresURSSAF: netApresURSSAF || 0,
          margeNette: margeNette || 0,
        });
      });

      if (errors.length > 0) {
        setError(`Erreurs dans le fichier Excel :\n${errors.join("\n")}`);
        setUploading(false);
        return;
      }

      setProgress(80);

      // Envoyer les données JSON au backend
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
        },
      );

      setProgress(100);
      setResult(response.data);
      setSelectedFile(null);
    } catch (err) {
      console.error("Erreur lors de l'import:", err);

      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setError(
          `Erreurs dans le fichier Excel :\n${err.response.data.errors.join("\n")}`,
        );
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Erreur lors de l'import du fichier. Vérifiez votre connexion.",
        );
      }
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  // Réinitialiser
  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-4">
        📊 Importer les tarifs depuis Excel
      </h2>

      <p className="text-gray-400 mb-6">
        Uploadez votre fichier Excel pour mettre à jour automatiquement tous les
        tarifs dans la base de données. Les tarifs existants seront remplacés
        par les nouveaux.
      </p>

      {/* Zone de drag & drop */}
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
                Glissez votre fichier Excel ici
              </p>
              <p className="text-gray-400 text-sm mb-4">ou</p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block transition-colors">
                Parcourir les fichiers
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-gray-500 text-sm">
              Formats acceptés : .xlsx, .xls • Taille max : 5 MB
            </p>
          </div>
        </div>
      )}

      {/* Fichier sélectionné */}
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

          {/* Barre de progression */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Upload en cours...</span>
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

          {/* Boutons d'action */}
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

      {/* Erreur */}
      {error && (
        <div className="mt-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">❌</div>
            <div className="flex-1">
              <p className="text-red-400 font-medium mb-1">Erreur</p>
              <p className="text-red-300 text-sm whitespace-pre-line">
                {error}
              </p>
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

      {/* Résultat de l'import */}
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
              <p className="text-gray-400 text-sm">Coefficient global</p>
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

      {/* Instructions */}
      <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm font-medium mb-2">
          📋 Format du fichier Excel attendu :
        </p>
        <ul className="text-gray-500 text-sm space-y-1 list-disc list-inside">
          <li>Ligne 2 : Taux URSSAF (colonne B)</li>
          <li>Ligne 3 : Coefficient global (colonne B)</li>
          <li>
            À partir de la ligne 7 : Tarifs (Gamme, Format, Coût, Coefficient,
            Prix, Net, Marge)
          </li>
          <li>
            Les tarifs existants avec la même Gamme + Format seront remplacés
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImportTarifsExcel;
