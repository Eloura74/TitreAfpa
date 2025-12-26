import React from "react";
import { Tarif } from "../../../types/tarif";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface PhotoUploaderProps {
  tarifs: Tarif[];
  selectedTariffs: string[];
  setSelectedTariffs: (ids: string[]) => void;
  filesToUpload: File[];
  setFilesToUpload: (files: File[]) => void;
  handlePhotosUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Optionnel si on upload direct
  isEditing: boolean; // Pour savoir si on affiche l'upload direct ou juste la sélection
}

// ==========================================
// 🔧 Utilitaire de Compression (Exporté pour réutilisation si besoin)
// ==========================================
export const compressImage = async (file: File): Promise<File> => {
  // Si l'image fait moins de 2MB, on la garde telle quelle
  if (file.size < 2 * 1024 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // Fallback
        return;
      }

      // On limite la résolution max (ex: 4096px) pour éviter les images géantes
      const MAX_DIM = 4096;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compression JPEG à 80%
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            console.log(`Compression: ${file.size} -> ${newFile.size}`);
            resolve(newFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.8
      );
    };
    img.onerror = (err) => {
      console.error("Erreur compression", err);
      resolve(file);
    };
  });
};

// ==========================================
// 📷 Composant PhotoUploader
// ==========================================
// Ce composant gère la sélection de fichiers (drag & drop possible via input)
// et la sélection des tarifs à appliquer par défaut à ces photos.
export default function PhotoUploader({
  tarifs,
  selectedTariffs,
  setSelectedTariffs,
  filesToUpload,
  setFilesToUpload,
  handlePhotosUpload,
  isEditing,
}: PhotoUploaderProps) {
  return (
    <div className="bg-[#232336] p-4 rounded border border-white/10 mt-4">
      <h4 className="text-sm font-bold text-[#ffe992] mb-2">
        {isEditing ? "Ajouter des photos à la galerie" : "Ajouter des photos (Optionnel)"}
      </h4>
      
      {!isEditing && (
        <p className="text-xs text-gray-400 mb-2">
          Vous pouvez sélectionner plusieurs photos ou un dossier complet dès maintenant.
        </p>
      )}

      {/* Sélection des Tarifs */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-1">
          Tarifs par défaut pour ces photos :
        </p>
        <div className="max-h-24 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 bg-black/20 p-2 rounded">
          {tarifs.map((t) => (
            <label
              key={t.id || t._id}
              className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedTariffs.includes(t.id || t._id || "")}
                onChange={(e) => {
                  const id = t.id || t._id || "";
                  if (e.target.checked) setSelectedTariffs([...selectedTariffs, id]);
                  else setSelectedTariffs(selectedTariffs.filter((tid) => tid !== id));
                }}
                className="rounded border-gray-600 bg-black/50 text-[#ffe992] focus:ring-[#ffe992]"
              />
              <span>
                {t.nom} ({t.format} - {t.prix}€)
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Input File */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            if (isEditing && handlePhotosUpload) {
              // Si on est en mode édition, on upload direct via le handler parent
              handlePhotosUpload(e);
            } else {
              // Sinon on stocke juste les fichiers pour l'envoi global
              setFilesToUpload(Array.from(e.target.files));
            }
          }
        }}
        className="w-full bg-[#181824] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ffe992] file:text-black hover:file:bg-[#d6c487] transition-colors"
      />
      
      {/* Feedback fichiers sélectionnés (Mode Création uniquement) */}
      {!isEditing && filesToUpload.length > 0 && (
        <p className="text-xs text-green-400 mt-2 font-medium animate-pulse">
          {filesToUpload.length} fichier(s) prêt(s) à être envoyé(s)
        </p>
      )}
    </div>
  );
}
