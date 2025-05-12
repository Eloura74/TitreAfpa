import { useState } from "react";
import axios from "axios";

/**
 * Formulaire d’ajout d’œuvre graphique unique (admin)
 * Permet d’envoyer une œuvre vers /api/oeuvres-graphique
 */
export default function GalerieGraphiqueForm() {
  const [titre, setTitre] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Gestion de l’upload d’image
  async function handleUploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post("/api/oeuvres-graphique/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.imagePath;
    } catch (err) {
      setMessage("Erreur lors de l’upload de l’image.");
      return null;
    }
  }

  // Soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    let imagePath = "";
    if (image) {
      const uploaded = await handleUploadImage(image);
      if (!uploaded) {
        setLoading(false);
        return;
      }
      imagePath = uploaded;
    }
    try {
      await axios.post("/api/oeuvres-graphique", {
        titre,
        image: imagePath,
        prix: Number(prix),
        description,
      });
      setMessage("Œuvre ajoutée avec succès !");
      setTitre("");
      setImage(null);
      setPrix("");
      setDescription("");
    } catch (err) {
      setMessage("Erreur lors de l’ajout de l’œuvre.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-yellow-400 mb-2">Ajouter une œuvre graphique unique</h2>
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] || null)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Titre"
        value={titre}
        onChange={e => setTitre(e.target.value)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
      />
      <input
        type="number"
        placeholder="Prix (€)"
        value={prix}
        onChange={e => setPrix(e.target.value)}
        className="block w-full bg-gray-800 text-white rounded px-3 py-2"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-yellow-400 text-black font-bold px-6 py-2 rounded hover:bg-yellow-300 transition"
      >
        {loading ? "Ajout en cours..." : "Ajouter l’œuvre"}
      </button>
      {message && <div className="text-center text-sm mt-2 text-yellow-400">{message}</div>}
    </form>
  );
}
