// --- Importation des hooks et outils nécessaires ---
import { useState } from "react"; // Hook React pour gérer l'état local
import axios from "axios"; // Librairie HTTP pour faire des appels API

/**
 * Formulaire d’ajout d’œuvre graphique unique (interface admin)
 * Permet d’envoyer une œuvre graphique (titre, description, prix, image)
 * vers l’API : POST /api/oeuvres-graphique
 */
export default function GalerieGraphiqueForm() {
  // --- États des champs du formulaire ---
  const [titre, setTitre] = useState(""); // Titre de l’œuvre
  const [image, setImage] = useState<File | null>(null); // Image sélectionnée
  const [prix, setPrix] = useState(""); // Prix de l’œuvre
  const [description, setDescription] = useState(""); // Description de l’œuvre
  // --- États de contrôle ---
  const [message, setMessage] = useState<string | null>(null); // Message de succès ou d'erreur
  const [loading, setLoading] = useState(false); // Indique si un envoi est en cours

  // Fonction asynchrone pour uploader l’image sélectionnée vers le backend
  async function handleUploadImage(file: File): Promise<string | null> {
    const formData = new FormData(); // Création d’un objet FormData pour envoi multipart
    formData.append("image", file); // Ajout de l’image dans le champ `image`

    try {
      const res = await axios.post(
        // Envoi de la requête POST vers l’endpoint d’upload
        `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/upload`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data", // Nécessaire pour l’envoi de fichier
            Authorization: `Bearer ${localStorage.getItem("token")}` // Ajout du token d'authentification
          },
        }
      );
      return res.data.imagePath; // Retourne le chemin de l’image généré par le backend
    } catch (err) {
      console.error("Erreur upload image:", err); // Log détaillé de l'erreur
      setMessage("Erreur lors de l’upload de l’image."); // Affiche un message d’erreur
      return null;
    }
  }

  // Fonction de gestion de la soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Empêche le rechargement automatique de la page
    setMessage(null); // Réinitialise les messages
    setLoading(true); // Active l’état de chargement

    let imagePath = ""; // Variable temporaire pour stocker le chemin de l’image

    // Si une image a été sélectionnée, on tente de l’uploader
    if (image) {
      // Upload de l’image vers le backend
      const uploaded = await handleUploadImage(image);
      // Si l’upload échoue, on arrête la fonction
      if (!uploaded) {
        setLoading(false); // Arrêt si l’upload échoue
        return;
      }
      imagePath = uploaded; // Stocke le chemin de l’image uploadée
    }

    // Envoi final de toutes les données du formulaire vers le backend
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique`,
        {
          titre,
          image: imagePath,
          prix: Number(prix), // Conversion en nombre
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` // Ajout du token d'authentification
          }
        }
      );

      // Réinitialisation complète du formulaire après succès
      setMessage("Œuvre ajoutée avec succès !");
      setTitre("");
      setImage(null);
      setPrix("");
      setDescription("");
    } catch (err) {
      console.error("Erreur ajout œuvre:", err); // Log détaillé de l'erreur
      setMessage("Erreur lors de l'ajout de l'œuvre."); // Message en cas d'échec
    } finally {
      setLoading(false); // Fin du chargement dans tous les cas
    }
  }

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
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
      />

      {/* Aperçu de l’image sélectionnée */}
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Aperçu"
          className="w-64 h-auto mt-2 rounded border border-gray-600"
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
        className="bg-yellow-400 text-black font-bold px-6 py-2 rounded hover:bg-yellow-300 transition"
      >
        {loading ? "Ajout en cours..." : "Ajouter l’œuvre"}
      </button>

      {/* Affichage du message d’erreur ou succès */}
      {message && (
        <div className="text-center text-sm mt-2 text-yellow-400">
          {message}
        </div>
      )}
    </form>
  );
}
