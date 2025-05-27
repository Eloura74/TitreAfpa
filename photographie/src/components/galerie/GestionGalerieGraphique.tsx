import { useEffect, useState } from "react";
import axios from "axios";

interface OeuvreGraphique {
  _id?: string;
  titre: string;
  image: string;
  prix: number;
  description?: string;
}

export default function GestionGalerieGraphique() {
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]);
  const [form, setForm] = useState<OeuvreGraphique>({
    titre: "",
    image: "",
    prix: 0,
    description: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les œuvres graphiques au montage
  useEffect(() => {
    fetchOeuvres();
  }, []);

  async function fetchOeuvres() {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/oeuvres-graphique`);
      setOeuvres(data);
    } catch (err) {
      setMessage("Erreur lors du chargement des œuvres.");
    }
  }

  // Gestion upload d’image
  async function handleUploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.imagePath;
    } catch {
      setMessage("Erreur lors de l’upload de l’image.");
      return null;
    }
  }

  // Soumission du formulaire (ajout ou modif)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    let imagePath = form.image;
    // Correction : forcer l’upload d’image pour chaque ajout
    if (!editId && !imageFile) {
      setMessage("Merci de sélectionner une image à importer.");
      setLoading(false);
      return;
    }
    if (form.titre.trim() === "") {
      setMessage("Le titre est requis.");
      setLoading(false);
      return;
    }
    if (form.prix <= 0) {
      setMessage("Le prix doit être supérieur à 0.");
      setLoading(false);
      return;
    }
    if (imageFile) {
      const uploaded = await handleUploadImage(imageFile);
      if (!uploaded) {
        setLoading(false);
        return;
      }
      imagePath = uploaded;
    }
    try {
      if (editId) {
        // Modification
        const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/${editId}`,
          { ...form, image: imagePath }
        );
        setOeuvres((prev) => prev.map((o) => (o._id === editId ? data : o)));
        setMessage("Œuvre modifiée !");
        setEditId(null);
      } else {
        // Ajout
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/oeuvres-graphique`, {
          ...form,
          image: imagePath,
        });
        setOeuvres((prev) => [...prev, data]);
        setMessage("Œuvre ajoutée !");
      }
      setForm({ titre: "", image: "", prix: 0, description: "" });
      setImageFile(null);
    } catch {
      setMessage("Erreur lors de l’enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  // Préparation du formulaire pour modification
  function handleEdit(oeuvre: OeuvreGraphique) {
    setForm({
      titre: oeuvre.titre,
      image: oeuvre.image,
      prix: oeuvre.prix,
      description: oeuvre.description || "",
    });
    setEditId(oeuvre._id || null);
    setImageFile(null);
    setMessage(null);
  }

  // Suppression d’une œuvre
  async function handleDelete(id?: string) {
    if (!id) return;
    if (!window.confirm("Supprimer cette œuvre ?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/${id}`);
      setOeuvres((prev) => prev.filter((o) => o._id !== id));
      setMessage("Œuvre supprimée !");
    } catch {
      setMessage("Erreur lors de la suppression.");
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-white bg-[#1a1a20] rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Gestion de la Galerie Graphique</h2>
      <form className="grid grid-cols-1 gap-4 mb-6" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
          className="mb-2"
        />
        {/* Aperçu image locale avant upload */}
        {imageFile && (
          <div className="mb-2 flex justify-center">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Aperçu"
              className="h-32 rounded shadow"
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
        <input
          type="text"
          placeholder="Titre"
          value={form.titre}
          onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
          className="input"
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input"
        />
        <input
          type="number"
          placeholder="Prix (€)"
          value={form.prix}
          onChange={(e) => setForm((f) => ({ ...f, prix: Number(e.target.value) }))}
          className="input"
          required
        />
        {form.prix <= 0 && <div className="text-red-400 text-xs">Le prix doit être supérieur à 0.</div>}
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded w-full transition"
          disabled={
            loading ||
            form.titre.trim() === "" ||
            (!editId && !imageFile) ||
            form.prix <= 0
          }
        >
          {editId ? "Modifier l’œuvre" : "Ajouter l’œuvre"}
        </button>
        {!editId && !imageFile && <div className="text-red-400 text-xs">Sélectionne une image à importer.</div>}
        {message && <div className="text-center text-sm mt-2 text-yellow-400">{message}</div>}
      </form>
      {/* Liste des œuvres graphiques */}
      <div className="space-y-4">
        {oeuvres.length === 0 && <div className="text-gray-400">Aucune œuvre graphique pour le moment.</div>}
        {oeuvres.map((oeuvre) => (
          <div key={oeuvre._id} className="flex items-center bg-gray-800 rounded shadow p-4">
            <img src={oeuvre.image} alt={oeuvre.titre} className="w-16 h-16 object-cover rounded mr-4" />
            <div className="flex-1">
              <span className="font-bold text-lg text-yellow-300">{oeuvre.titre}</span>
              {oeuvre.description && <span className="block text-gray-400 ml-2">{oeuvre.description}</span>}
              <span className="block text-yellow-400 font-semibold">{oeuvre.prix} €</span>
            </div>
            <button
              onClick={() => handleEdit(oeuvre)}
              className="text-blue-400 hover:underline mr-4"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDelete(oeuvre._id)}
              className="text-red-400 hover:underline"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
