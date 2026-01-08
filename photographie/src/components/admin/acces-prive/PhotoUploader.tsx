import React, { useState } from "react";
import PhotoStagingModal from "./PhotoStagingModal";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface PhotoUploaderProps {
  handlePhotosUpload?: (photos: any[]) => void; // Updated signature
  isEditing: boolean;
}

// ==========================================
// 🔧 Utilitaire de Compression (Exporté pour réutilisation si besoin)
// ==========================================
export const compressImage = async (file: File): Promise<File> => {
  // Si l'image fait moins de 2MB, on la garde telle quelle
  if (file.size < 2 * 1024 * 1024) return file;

  return new Promise((resolve) => {
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
            const newFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );
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
export default function PhotoUploader({
  handlePhotosUpload,
  isEditing,
}: PhotoUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [tempFiles, setTempFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTempFiles(Array.from(e.target.files));
      setShowModal(true);
    }
    // Reset input value to allow selecting the same files again if needed
    e.target.value = "";
  };

  const handleModalValidate = (stagedPhotos: any[]) => {
    setShowModal(false);
    if (handlePhotosUpload) {
      handlePhotosUpload(stagedPhotos);
    }
  };

  return (
    <div className="bg-[#232336] p-4 rounded border border-white/10 mt-4">
      <h4 className="text-sm font-bold text-[#ffe992] mb-2">
        {isEditing
          ? "Ajouter des photos à la galerie"
          : "Ajouter des photos (Optionnel)"}
      </h4>

      {!isEditing && (
        <p className="text-xs text-gray-400 mb-2">
          Vous pouvez configurer les titres, descriptions et tarifs pour chaque
          photo avant l'upload.
        </p>
      )}

      {/* Input File */}
      <div className="relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="w-full bg-[#181824] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ffe992] file:text-black hover:file:bg-[#d6c487] transition-colors cursor-pointer"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <PhotoStagingModal
          files={tempFiles}
          onClose={() => setShowModal(false)}
          onValidate={handleModalValidate}
        />
      )}
    </div>
  );
}
