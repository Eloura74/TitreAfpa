import React, { useState, useEffect } from "react";
import { Evenement } from "../../../types/evenement";
import UploadPhotosOriginales from "./UploadPhotosOriginales";
import PhotoOriginalesManager from "./PhotoOriginalesManager";
import TariffSelectorForReportage from "./TariffSelectorForReportage";
import { tariffServiceV2 } from "../../../services/tariffServiceV2";
import { TariffConfigV2 } from "../../../types/tarifConfigV2";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface PrivateAccessFormProps {
  // État du formulaire principal
  form: Evenement;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  loading: boolean;
  editId: string | null;

  // Gestion de l'image de couverture
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  imagePreview: string;

  // Gestion des tarifs
  handleTariffIdsChange?: (ids: string[]) => void;

  // Rafraîchissement après upload R2
  onRefresh?: () => void;
}

// ==========================================
// 📝 Composant PrivateAccessForm
// ==========================================
// Orchestre les différents sous-composants pour créer ou modifier un accès privé.
export default function PrivateAccessForm({
  form,
  handleChange,
  handleSubmit,
  resetForm,
  loading,
  editId,
  handleImageChange,
  handleRemoveImage,
  imagePreview,
  handleTariffIdsChange,
  onRefresh,
}: PrivateAccessFormProps) {
  const [tariffConfig, setTariffConfig] = useState<TariffConfigV2 | null>(null);

  useEffect(() => {
    const loadTariffs = async () => {
      const config = await tariffServiceV2.getTariffConfig();
      setTariffConfig(config);
    };
    loadTariffs();
  }, []);

  const handleTariffToggle = (ids: string[]) => {
    if (handleTariffIdsChange) {
      handleTariffIdsChange(ids);
    }
  };
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">
        {editId ? "Modifier l'accès" : "Créer un nouvel accès privé"}
      </h3>

      <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
        {/* Titre */}
        <input
          name="titre"
          placeholder="Nom de l'événement / Client"
          value={form.titre}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:border-[#ffe992] outline-none transition-colors"
          required
        />

        {/* Image de Couverture */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400">Image de couverture</label>

          {/* Prévisualisation avec boutons d'action */}
          {imagePreview && (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Prévisualisation"
                className="w-full h-32 object-cover rounded border border-white/10"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors">
                  Modifier
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Input file si pas d'image */}
          {!imagePreview && (
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#ffe992] file:text-black hover:file:bg-[#d6c487] transition-colors"
            />
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Date de début</label>
            <input
              name="dateDebut"
              type="date"
              value={form.dateDebut}
              onChange={handleChange}
              className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white focus:border-[#ffe992] outline-none transition-colors"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Date de fin</label>
            <input
              name="dateFin"
              type="date"
              value={form.dateFin}
              onChange={handleChange}
              className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white focus:border-[#ffe992] outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Message pour le client (Description)"
          value={form.description}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white resize-none h-24 focus:border-[#ffe992] outline-none transition-colors placeholder-gray-500"
          required
        />

        {/* Code d'accès unique */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">
            Code d'accès unique {!form.isPublic && "*"}
            {form.isPublic && (
              <span className="text-gray-500 ml-2">
                (optionnel pour reportage public)
              </span>
            )}
          </label>
          <input
            name="codeAcces"
            placeholder={
              form.isPublic
                ? "Optionnel - Laissez vide pour reportage public uniquement"
                : "Ex: SHOOTING-2024-ABC123"
            }
            value={form.codeAcces || ""}
            onChange={handleChange}
            className={`w-full bg-[#232336] border rounded px-4 py-2 text-white uppercase focus:border-[#ffe992] outline-none transition-colors placeholder-gray-500 ${
              form.isPublic
                ? "border-white/10 opacity-60"
                : "border-[#ffe992]/30"
            }`}
            required={!form.isPublic}
          />
          <p className="text-xs text-gray-500 mt-1">
            {form.isPublic
              ? "Pour un reportage public, le code d'accès est optionnel. Laissez vide si vous voulez uniquement un accès public."
              : "Le client utilisera ce code pour accéder à ses photos"}
          </p>
        </div>

        {/* Visibilité : Public ou Privé */}
        <div className="bg-[#232336] p-4 rounded border border-white/10 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic || false}
              onChange={handleChange}
              className="w-5 h-5 accent-[#ffe992] cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-white font-semibold text-sm block">
                Reportage Public
              </span>
              <span className="text-xs text-gray-400">
                Si coché, ce reportage sera visible sur la page /reportages sans
                code d'accès
              </span>
            </div>
          </label>

          {/* Permissions : Téléchargement */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="allowDownload"
              checked={form.allowDownload !== false}
              onChange={handleChange}
              className="w-5 h-5 accent-[#ffe992] cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-white font-semibold text-sm block">
                Autoriser le téléchargement
              </span>
              <span className="text-xs text-gray-400">
                Les clients pourront télécharger les photos originales haute
                résolution
              </span>
            </div>
          </label>

          {/* Permissions : Impression */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="allowPrint"
              checked={form.allowPrint !== false}
              onChange={handleChange}
              className="w-5 h-5 accent-[#ffe992] cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-white font-semibold text-sm block">
                Autoriser l'impression
              </span>
              <span className="text-xs text-gray-400">
                Les clients pourront commander des tirages et impressions
              </span>
            </div>
          </label>

          {/* Sélection des formats si impression autorisée (public ou privé) */}
          {form.allowPrint !== false && tariffConfig && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="text-sm font-bold text-[#ffe992] block mb-3">
                Formats disponibles pour la commande
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Sélectionnez les formats que les clients pourront commander
                {form.isPublic
                  ? " depuis la page publique du reportage"
                  : " depuis l'écrin privé"}
              </p>
              <TariffSelectorForReportage
                config={tariffConfig}
                selectedIds={form.availableTariffIds || []}
                onToggle={handleTariffToggle}
              />
            </div>
          )}
        </div>

        {/* Type de validité */}
        <div className="bg-[#232336] p-4 rounded border border-white/10 space-y-3">
          <label className="text-sm font-bold text-[#ffe992] block">
            Validité de l'accès
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="typeValidite"
                value="permanent"
                checked={form.typeValidite === "permanent"}
                onChange={handleChange}
                className="accent-[#ffe992]"
              />
              <span className="text-white text-sm">Permanent</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="typeValidite"
                value="temporaire"
                checked={form.typeValidite === "temporaire"}
                onChange={handleChange}
                className="accent-[#ffe992]"
              />
              <span className="text-white text-sm">Temporaire</span>
            </label>
          </div>

          {form.typeValidite === "temporaire" && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Date d'expiration</label>
              <input
                name="dateExpiration"
                type="date"
                value={form.dateExpiration || ""}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 text-white focus:border-[#ffe992] outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Limites de téléchargement */}
        <div className="bg-[#232336] p-4 rounded border border-white/10 space-y-3">
          <label className="text-sm font-bold text-[#ffe992] block">
            Limites de téléchargement
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="typeLimiteTelechargement"
                value="illimite"
                checked={form.typeLimiteTelechargement === "illimite"}
                onChange={handleChange}
                className="accent-[#ffe992]"
              />
              <span className="text-white text-sm">Illimité</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="typeLimiteTelechargement"
                value="par_photo"
                checked={form.typeLimiteTelechargement === "par_photo"}
                onChange={handleChange}
                className="accent-[#ffe992]"
              />
              <span className="text-white text-sm">Limite par photo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="typeLimiteTelechargement"
                value="total"
                checked={form.typeLimiteTelechargement === "total"}
                onChange={handleChange}
                className="accent-[#ffe992]"
              />
              <span className="text-white text-sm">Limite totale</span>
            </label>
          </div>

          {form.typeLimiteTelechargement === "par_photo" && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400">
                Nombre max de téléchargements par photo
              </label>
              <input
                name="maxTelechargementParPhoto"
                type="number"
                min="1"
                value={form.maxTelechargementParPhoto || ""}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 text-white focus:border-[#ffe992] outline-none transition-colors"
                placeholder="Ex: 3"
              />
            </div>
          )}

          {form.typeLimiteTelechargement === "total" && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400">
                Nombre max de téléchargements total
              </label>
              <input
                name="maxTelechargementTotal"
                type="number"
                min="1"
                value={form.maxTelechargementTotal || ""}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 text-white focus:border-[#ffe992] outline-none transition-colors"
                placeholder="Ex: 50"
              />
            </div>
          )}
        </div>

        {/* Upload Photos Originales R2 (uniquement en mode édition) */}
        {editId && (
          <UploadPhotosOriginales
            accesId={editId}
            codeAcces={form.codeAcces || editId}
            onUploadComplete={() => {
              if (onRefresh) onRefresh();
            }}
          />
        )}

        {/* Gestion des Photos Originales (suppression et commentaires) */}
        {editId &&
          form.photosOriginales &&
          form.photosOriginales.length > 0 && (
            <div className="mt-6">
              <PhotoOriginalesManager
                accesId={editId}
                photos={form.photosOriginales}
                onPhotosUpdate={() => {
                  if (onRefresh) onRefresh();
                }}
              />
            </div>
          )}

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-4 sticky bottom-0 bg-[#181824] py-2 z-10 border-t border-white/5">
          <button
            type="submit"
            className="flex-1 bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(255,233,146,0.2)]"
            disabled={loading}
          >
            {loading
              ? "Traitement en cours..."
              : editId
                ? "Enregistrer les modifications"
                : "Créer l'accès privé"}
          </button>
          {editId && (
            <button
              type="button"
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
              onClick={resetForm}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
