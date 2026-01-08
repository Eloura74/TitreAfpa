import React from "react";
import { Evenement } from "../../../types/evenement";
import { Tarif } from "../../../types/tarif";
import ClientCreationForm from "./ClientCreationForm";
import PhotoUploader from "./PhotoUploader";
import PhotoGallery from "./PhotoGallery";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface PrivateAccessFormProps {
  // État du formulaire principal
  form: Evenement;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  loading: boolean;
  editId: string | null;

  // Gestion de l'image de couverture
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string;

  // Gestion Client
  showClientForm: boolean;
  setShowClientForm: (show: boolean) => void;
  clientForm: any; // On pourrait typer plus strictement
  handleClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateClient: (e: React.FormEvent) => void;

  // Gestion Photos & Tarifs
  tarifs: Tarif[];
  // filesToUpload: File[]; // REMOVED
  // setFilesToUpload: (files: File[]) => void; // REMOVED
  handlePhotosUpload: (photos: any[]) => void;

  // Gestion Galerie existante
  onEditPhoto: (photo: any) => void;
  onDeletePhoto: (photoId: string) => void;
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
  imagePreview,
  showClientForm,
  setShowClientForm,
  clientForm,
  handleClientChange,
  handleCreateClient,
  tarifs,
  // filesToUpload,
  // setFilesToUpload,
  handlePhotosUpload,
  onEditPhoto,
  onDeletePhoto,
}: PrivateAccessFormProps) {
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
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Image de couverture</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#ffe992] file:text-black hover:file:bg-[#d6c487] transition-colors"
          />
        </div>

        {/* Prévisualisation Couverture */}
        {imagePreview && (
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Prévisualisation"
              className="w-full h-32 object-cover rounded border border-white/10"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />
          </div>
        )}

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

        {/* Section Client */}
        <div className="bg-[#232336] p-4 rounded border border-white/10">
          <label className="text-sm font-bold text-[#ffe992] mb-2 block">
            Client associé
          </label>
          <div className="flex gap-2 mb-2">
            <input
              name="clientEmail"
              placeholder="Email du client existant"
              value={form.clientEmail}
              onChange={handleChange}
              className="bg-black/20 border border-white/10 rounded px-4 py-2 text-white w-full focus:border-blue-500 outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {/* Sous-composant Création Client */}
          <ClientCreationForm
            showClientForm={showClientForm}
            setShowClientForm={setShowClientForm}
            clientForm={clientForm}
            handleClientChange={handleClientChange}
            handleCreateClient={handleCreateClient}
          />
        </div>

        {/* Sous-composant Upload Photos */}
        <PhotoUploader
          tarifs={tarifs}
          handlePhotosUpload={handlePhotosUpload}
          isEditing={!!editId}
        />

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

      {/* Galerie Photos (Mode Édition uniquement) */}
      {editId && (
        <PhotoGallery
          photos={form.photos || []}
          onEdit={onEditPhoto}
          onDelete={onDeletePhoto}
        />
      )}
    </div>
  );
}
