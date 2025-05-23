// -----------------------------------------------------------------------------
// ModalTirage : Composant modal pour commander un tirage/poster/toile/carte postale
// Permet l'upload d'une image, le choix du format/support, la quantité, et l'ajout au panier
// -----------------------------------------------------------------------------
import React, { useRef, useState } from "react";
import { usePanier } from "../../store/panierContext";
import { ArticlePanierType } from "../../types/panier";
import { v4 as uuidv4 } from "uuid"; // Pour générer un id unique

// Définition du type pour les formats disponibles
export interface FormatOption {
  label: string;
  value: string;
  prix: number;
}

// Props du composant ModalTirage
interface ModalTirageProps {
  open: boolean;
  onClose: () => void;
  offre: {
    titre: string;
    formats: FormatOption[];
    image: string;
  };
}

// Composant principal
export const ModalTirage: React.FC<ModalTirageProps> = ({ open, onClose, offre }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [format, setFormat] = useState<string>(offre.formats[0]?.value || "");
  const [quantite, setQuantite] = useState<number>(1);

  // Récupération du hook panier
  const { ajouterArticle } = usePanier();

  // Si le modal n'est pas ouvert, ne rien afficher
  if (!open) return null;

  // Gestion de l'upload d'image (aperçu inclus)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Soumission du formulaire : ajout réel au panier
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Recherche du format sélectionné pour récupérer le prix
    const formatObj = offre.formats.find(f => f.value === format);
    if (!formatObj) return;
    // Création de l'article à ajouter au panier
    const nouvelArticle: ArticlePanierType = {
      id: uuidv4(), // Génère un id unique pour l'article
      nom: `${offre.titre} (${formatObj.label})`,
      prix: formatObj.prix,
      quantite,
      image: image || offre.image, // Preview utilisateur ou image de l'offre par défaut
    };
    // Ajout au panier via le contexte
    ajouterArticle(nouvelArticle);
    // Feedback utilisateur (optionnel)
    // alert(`Ajouté au panier : ${nouvelArticle.nom}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#191923] rounded-xl shadow-xl p-8 w-full max-w-md relative">
        {/* Bouton de fermeture accessible */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-200 text-2xl"
          aria-label="Fermer"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">{offre.titre}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Upload image */}
          <label className="block">
            <span className="font-semibold text-white">Votre photo à imprimer</span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full mt-2 text-white"
              required
            />
          </label>
          {/* Aperçu de l'image sélectionnée */}
          {image && (
            <img
              src={image}
              alt="Aperçu"
              className="w-full h-48 object-contain rounded border border-yellow-300 bg-black mb-2"
            />
          )}
          {/* Sélection du format/support */}
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
          {/* Sélection de la quantité */}
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
          {/* Bouton de validation */}
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
