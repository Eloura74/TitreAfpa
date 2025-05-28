// -----------------------------------------------------------------------------
// ModalTirage : Composant modal pour commander un tirage/poster/toile/carte postale
// Permet l'upload d'une image, le choix du format/support, la quantité, et l'ajout au panier
// -----------------------------------------------------------------------------

// === Importations ===
import React, { useRef, useState } from "react"; // React + gestion des états locaux et refs
import { usePanier } from "../../store/panierContext"; // Hook personnalisé pour gérer le panier
import { ArticlePanierType } from "../../types/panier"; // Typage TS pour un article du panier
import { v4 as uuidv4 } from "uuid"; // Librairie pour générer des identifiants uniques

// === Définition d’un format de tirage ===
// Chaque option de format contient : un label, une valeur (clé technique), et un prix
export interface FormatOption {
  label: string;
  value: string;
  prix: number;
}

// === Définition des props attendues par le composant ===
interface ModalTirageProps {
  open: boolean; // Contrôle l'ouverture ou la fermeture du modal
  onClose: () => void; // Fonction à appeler pour fermer la modal
  offre: {
    titre: string; // Titre du tirage (ex : "Poster Photo")
    formats: FormatOption[]; // Liste des formats/supports disponibles
    image: string; // Image par défaut associée à cette offre
  };
}

// === Composant ModalTirage ===
export const ModalTirage: React.FC<ModalTirageProps> = ({ open, onClose, offre }) => {
  // Référence vers l’input fichier (permet d’y accéder directement si besoin)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // État local pour l’image à imprimer (prévisualisation)
  const [image, setImage] = useState<string | null>(null);

  // Format sélectionné (initialisé avec le 1er format de l'offre)
  const [format, setFormat] = useState<string>(offre.formats[0]?.value || "");

  // Quantité souhaitée (défaut : 1)
  const [quantite, setQuantite] = useState<number>(1);

  // Récupère la fonction d’ajout au panier via le contexte
  const { ajouterArticle } = usePanier();

  // Si la modal est fermée, on ne rend rien
  if (!open) return null;

  // === Gère le changement de fichier image par l’utilisateur ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Récupère le 1er fichier sélectionné
    if (file) {
      const reader = new FileReader(); // Utilitaire JS pour lire un fichier
      reader.onload = (ev) => setImage(ev.target?.result as string); // Stocke l’image encodée en base64
      reader.readAsDataURL(file); // Lance la lecture du fichier
    }
  };

  // === Gère la validation du formulaire ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de page
    const formatObj = offre.formats.find(f => f.value === format); // Récupère l'objet complet du format sélectionné
    if (!formatObj) return; // Si le format est invalide, on sort

    // Création de l’article à ajouter dans le panier
    const nouvelArticle: ArticlePanierType = {
      id: uuidv4(), // ID unique généré automatiquement
      nom: `${offre.titre} (${formatObj.label})`, // Exemple : "Poster (30x40)"
      prix: formatObj.prix,
      quantite,
      image: image || offre.image, // Soit l’image uploadée, soit l’image par défaut
    };

    // Ajout de l’article dans le contexte global du panier
    ajouterArticle(nouvelArticle);

    // Fermeture de la modal après ajout
    onClose();
  };

  // === Affichage JSX de la modal ===
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Conteneur de la boîte modale */}
      <div className="bg-[#191923] rounded-xl shadow-xl p-8 w-full max-w-md relative">
        {/* Bouton pour fermer la modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-200 text-2xl"
          aria-label="Fermer"
        >
          ×
        </button>

        {/* Titre de l’offre */}
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">{offre.titre}</h2>

        {/* === Formulaire d’ajout au panier === */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Upload de l’image à imprimer */}
          <label className="block">
            <span className="font-semibold text-white">Votre photo à imprimer</span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full mt-2 text-white"
              required // Empêche l'envoi sans image
            />
          </label>

          {/* Aperçu de l’image sélectionnée */}
          {image && (
            <img
              src={image}
              alt="Aperçu"
              className="w-full h-48 object-contain rounded border border-yellow-300 bg-black mb-2"
            />
          )}

          {/* Sélection du format/support (ex : Poster, Toile, etc.) */}
          <label className="block">
            <span className="font-semibold text-white">Format / Support</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full mt-2 rounded bg-[#232336] text-white px-3 py-2"
            >
              {offre.formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} — {f.prix.toFixed(2)} €
                </option>
              ))}
            </select>
          </label>

          {/* Choix de la quantité */}
          <label className="block">
            <span className="font-semibold text-white">Quantité</span>
            <input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              className="w-24 mt-2 rounded bg-[#232336] text-white px-3 py-2"
            />
          </label>

          {/* Bouton de validation final */}
          <button
            type="submit"
            className="btn-main w-full mt-4"
          >
            Ajouter au panier
          </button>
        </form>
      </div>
    </div>
  );
};
