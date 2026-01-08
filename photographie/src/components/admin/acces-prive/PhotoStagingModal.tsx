import React, { useState, useEffect } from "react";
import { Tarif } from "../../../types/tarif";
import { X, Check, Copy, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StagedPhoto {
  id: string; // unique temp id
  file: File;
  preview: string;
  title: string;
  description: string;
  selectedTariffs: string[];
}

interface PhotoStagingModalProps {
  files: File[];
  tarifs: Tarif[];
  onClose: () => void;
  onValidate: (photos: StagedPhoto[]) => void;
}

export default function PhotoStagingModal({
  files,
  tarifs,
  onClose,
  onValidate,
}: PhotoStagingModalProps) {
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    // Initialize staged photos from files
    const newPhotos = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.split(".")[0], // Default title from filename
      description: "",
      selectedTariffs: [], // No tariffs selected by default
    }));
    setStagedPhotos(newPhotos);

    // Cleanup object URLs on unmount
    return () => {
      newPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [files]);

  const updatePhoto = (index: number, updates: Partial<StagedPhoto>) => {
    setStagedPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const applyToAll = (sourceIndex: number) => {
    const source = stagedPhotos[sourceIndex];
    setStagedPhotos((prev) =>
      prev.map((p, i) =>
        i === sourceIndex
          ? p
          : {
              ...p,
              description: source.description,
              selectedTariffs: [...source.selectedTariffs],
              // We don't copy title to avoid duplicates, maybe just prefix?
              // For now let's keep titles unique/original
            }
      )
    );
  };

  const currentPhoto = stagedPhotos[activePhotoIndex];

  if (!currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#181824] w-full max-w-6xl h-[90vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#12121a]">
          <div>
            <h2 className="text-2xl font-serif italic text-[#ffe992]">
              Préparation des photos
            </h2>
            <p className="text-sm text-gray-400">
              Configurez les titres, descriptions et tarifs avant l'upload (
              {activePhotoIndex + 1}/{stagedPhotos.length})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Thumbnail List */}
          <div className="w-64 bg-[#12121a] border-r border-white/5 overflow-y-auto p-4 space-y-3 hidden md:block">
            {stagedPhotos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setActivePhotoIndex(idx)}
                className={`w-full text-left p-2 rounded-lg border transition-all ${
                  activePhotoIndex === idx
                    ? "border-[#ffe992] bg-[#ffe992]/5"
                    : "border-transparent hover:bg-white/5"
                }`}
              >
                <div className="aspect-square rounded-md overflow-hidden mb-2 bg-black">
                  <img
                    src={photo.preview}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate text-xs font-medium text-gray-300">
                  {photo.title}
                </div>
              </button>
            ))}
          </div>

          {/* Center: Main Preview & Form */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Image Preview */}
            <div className="flex-1 bg-black/50 p-6 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={currentPhoto.preview}
                  alt={currentPhoto.title}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              </div>

              {/* Navigation Overlay (Mobile/Tablet) */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 md:hidden">
                <button
                  disabled={activePhotoIndex === 0}
                  onClick={() => setActivePhotoIndex((prev) => prev - 1)}
                  className="px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  disabled={activePhotoIndex === stagedPhotos.length - 1}
                  onClick={() => setActivePhotoIndex((prev) => prev + 1)}
                  className="px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>

            {/* Right: Configuration Form */}
            <div className="w-full lg:w-96 bg-[#181824] border-l border-white/5 flex flex-col overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Actions Bar */}
                <div className="flex justify-end">
                  <button
                    onClick={() => applyToAll(activePhotoIndex)}
                    className="text-xs flex items-center gap-2 text-[#ffe992] hover:text-[#ffe992]/80 transition-colors"
                    title="Appliquer la description et les tarifs à toutes les photos"
                  >
                    <Copy size={14} /> Appliquer à tous
                  </button>
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Titre de la photo
                  </label>
                  <input
                    type="text"
                    value={currentPhoto.title}
                    onChange={(e) =>
                      updatePhoto(activePhotoIndex, { title: e.target.value })
                    }
                    className="w-full bg-[#232336] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[#ffe992] outline-none transition-all"
                    placeholder="Titre..."
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={currentPhoto.description}
                    onChange={(e) =>
                      updatePhoto(activePhotoIndex, {
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#232336] border border-white/10 rounded-lg px-4 py-2 text-white text-sm h-32 resize-none focus:border-[#ffe992] outline-none transition-all"
                    placeholder="Description optionnelle..."
                  />
                </div>

                {/* Tariffs Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Tarifs applicables</span>
                    <span className="text-xs font-normal text-gray-400">
                      {currentPhoto.selectedTariffs.length} sélectionné(s)
                    </span>
                  </label>
                  <div className="bg-[#232336] rounded-lg border border-white/10 max-h-60 overflow-y-auto p-2 space-y-1">
                    {tarifs.map((tarif) => {
                      const isSelected = currentPhoto.selectedTariffs.includes(
                        tarif.id || tarif._id || ""
                      );
                      return (
                        <label
                          key={tarif.id || tarif._id}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                            isSelected ? "bg-[#ffe992]/10" : "hover:bg-white/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const tid = tarif.id || tarif._id || "";
                              let newSelection;
                              if (e.target.checked) {
                                newSelection = [
                                  ...currentPhoto.selectedTariffs,
                                  tid,
                                ];
                              } else {
                                newSelection =
                                  currentPhoto.selectedTariffs.filter(
                                    (id) => id !== tid
                                  );
                              }
                              updatePhoto(activePhotoIndex, {
                                selectedTariffs: newSelection,
                              });
                            }}
                            className="rounded border-gray-600 bg-black/50 text-[#ffe992] focus:ring-[#ffe992]"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-gray-200">
                              {tarif.nom}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tarif.format} - {tarif.prix}€
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#12121a] flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {stagedPhotos.length} photo(s) prête(s) à être uploadée(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-wider"
            >
              Annuler
            </button>
            <button
              onClick={() => onValidate(stagedPhotos)}
              className="px-6 py-2 bg-[#ffe992] text-black font-bold rounded-lg hover:bg-white transition-colors text-sm uppercase tracking-wider shadow-lg shadow-[#ffe992]/10 flex items-center gap-2"
            >
              <Check size={18} /> Valider et Uploader
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
