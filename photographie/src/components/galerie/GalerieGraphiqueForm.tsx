// --- Importation des hooks et outils nécessaires ---
import { useState, useRef, useEffect } from "react"; // Hook React pour gérer l'état local et gérer les URLs temporaires
import axios from "axios"; // Librairie HTTP pour faire des appels API
import { useToast } from "../Toast";
import { API_URL } from "../../config/api";

/**
 * Formulaire d’ajout d’œuvre graphique unique (interface admin)
 * ➤ Permet d’envoyer une œuvre graphique (titre, description, prix, image)
 * vers l’API : POST /api/oeuvres-graphique
 */
export default function GalerieGraphiqueForm() {
  // --- États des champs du formulaire ---
  const [titre, setTitre] = useState(""); // Titre de l’œuvre
  const [image, setImage] = useState<File | null>(null); // Image (fichier) sélectionnée
  const [imagePreview, setImagePreview] = useState<string | null>(null); // URL temporaire pour la prévisualisation
  const imagePreviewUrl = useRef<string | null>(null); // Pour nettoyer l'URL temporaire
  const [prix, setPrix] = useState(""); // Prix de l’œuvre
  const [description, setDescription] = useState(""); // Description de l’œuvre

  // --- États de contrôle ---
  const [loading, setLoading] = useState(false); // Indique si un envoi est en cours
  const { addToast } = useToast();

  /**
   * Gestion du changement de fichier pour générer la preview locale
   */
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      // Nettoyage de l'ancienne URL temporaire si besoin
      if (imagePreviewUrl.current) {
        URL.revokeObjectURL(imagePreviewUrl.current);
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      imagePreviewUrl.current = url;
    } else {
      setImagePreview(null);
      if (imagePreviewUrl.current) {
        URL.revokeObjectURL(imagePreviewUrl.current);
        imagePreviewUrl.current = null;
      }
    }
  }

  /**
   * Fonction asynchrone pour uploader l’image sélectionnée vers le backend
   * @param file - fichier image sélectionné
   * @returns - chemin de l’image uploadée ou null en cas d’erreur
   */
  async function handleUploadImage(file: File): Promise<string | null> {
    const formData = new FormData(); // Création d’un objet FormData pour envoi multipart
    formData.append("image", file); // Ajout de l’image dans le champ `image`

    try {
      const res = await axios.post(
        // Envoi de la requête POST vers l’endpoint d’upload
        `/api/upload-cloudinary`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, // Nécessaire pour l’envoi de fichier
        }
      );
      return res.data.url; // Retourne l'URL sécurisée de Cloudinary
    } catch {
      addToast("Erreur lors de l’upload de l’image.", "error"); // Affiche un message d’erreur
      return null;
    }
  }

  /**
   * Fonction de gestion de la soumission du formulaire
   * @param e - événement de soumission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Empêche le rechargement automatique de la page
    setLoading(true); // Active l’état de chargement

    let imagePath = ""; // Variable temporaire pour stocker le chemin de l’image
    // Si une image a été sélectionnée, on tente de l’uploader
    if (image) {
      const uploaded = await handleUploadImage(image);
      if (!uploaded) {
        setLoading(false); // Arrêt si l’upload échoue
        return;
      }
      imagePath = uploaded; // Stocke le chemin de l’image uploadée
    }
    // Envoi final de toutes les données du formulaire vers le backend
    try {
      await axios.post(`${API_URL}/api/oeuvres-graphique`, {
        titre,
        image: imagePath,
        prix: Number(prix), // Conversion en nombre
        description,
      });

      // Réinitialisation complète du formulaire après succès
      addToast("Œuvre ajoutée avec succès !", "success");
      setTitre("");
      setImage(null);
      setPrix("");
      setImagePreview(null);
      if (imagePreviewUrl.current) {
        URL.revokeObjectURL(imagePreviewUrl.current);
        imagePreviewUrl.current = null;
      }
      setDescription("");
    } catch {
      addToast("Erreur lors de l’ajout de l’œuvre.", "error"); // Message en cas d’échec
    } finally {
      setLoading(false); // Fin du chargement dans tous les cas
    }
  }

  /**
   * Bonnes pratiques :
   * - Nettoyage de l'URL temporaire lors du démontage du composant
   */
  useEffect(() => {
    return () => {
      if (imagePreviewUrl.current) {
        URL.revokeObjectURL(imagePreviewUrl.current);
      }
    };
  }, []);

  // --- Rendu JSX du formulaire ---
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-yellow-400 mb-2">
        Ajouter une œuvre graphique unique
      </h2>

      {/* Input pour sélectionner une image à uploader */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
      />

      {/* Aperçu de l’image sélectionnée (preview locale) */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Aperçu de l’œuvre sélectionnée"
          className="w-64 h-auto mt-2 rounded border-2 border-yellow-400 shadow-lg"
        />
      )}

      {/* Input texte pour le titre */}
      <input
        type="text"
        placeholder="Titre"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
        required
      />

      {/* Zone de texte pour la description */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
      />

      {/* Input numérique pour le prix */}
      <input
        type="number"
        placeholder="Prix (€)"
        value={prix}
        onChange={(e) => setPrix(e.target.value)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
        required
      />

      {/* Bouton de soumission du formulaire */}
      <button
        type="submit"
        disabled={loading}
        className="bg-yellow-400 text-black font-bold px-6 py-2 rounded hover:bg-yellow-300 transition flex items-center gap-2 justify-center"
      >
        {loading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Ajout en cours...
          </>
        ) : (
          "Ajouter l’œuvre"
        )}
      </button>
    </form>
  );
}
