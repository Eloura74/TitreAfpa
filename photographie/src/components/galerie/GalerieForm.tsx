// Importations des modules nécessaires
// useEffect et useState : hooks React pour la gestion du cycle de vie et de l'état
// useNavigate : hook React Router pour la navigation programmatique
// galerieData : données locales de la galerie (JSON)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import galerieData from "../../config/galerie.json";

// Interface pour les photos (structure des objets photo)
interface Photo {
  _id?: string; // ID optionnel (défini par MongoDB)
  src: string; // URL ou chemin de l'image
  alt: string; // Texte alternatif pour l'accessibilité
  titre: string; // Titre de la photo
  description: string; // Description détaillée
  prix: number; // Prix de la photo
  categorie: string; // Catégorie de la photo
}

export default function GalerieForm() {
  // État pour la liste des photos (tableau d'objets Photo)
  const [photos, setPhotos] = useState<Photo[]>([]);
  // État pour le formulaire (photo en cours de création ou d'édition)
  const [form, setForm] = useState<Photo>({
    src: "",
    alt: "",
    titre: "",
    description: "",
    prix: 0,
    categorie: "",
  });

  // État pour savoir si on édite une photo (sinon null)
  const [editId, setEditId] = useState<string | null>(null);
  // URL de l'API backend pour la galerie
  const API_URL = "http://localhost:5001/api/galerie";
  // Hook pour rediriger l'utilisateur après une action
  const navigate = useNavigate();

  // Chargement initial des photos depuis le backend à l'affichage du composant
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error("Erreur chargement:", err));
  }, []);

  // Gestion des changements dans le formulaire (tous les champs)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "prix" ? parseFloat(value || "0") : value, // Conversion en nombre pour le prix
    });
  };

  // Soumission du formulaire : ajout ou modification d'une photo
  const handleSubmit = async () => {
    // Vérification des champs obligatoires
    if (
      !form.src ||
      !form.src.startsWith("/uploads/") ||
      !form.titre ||
      !form.alt ||
      !form.description ||
      !form.categorie ||
      form.prix <= 0
    ) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }

    try {
      if (editId) {
        // Si editId existe, on modifie une photo existante (PUT)
        const res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setPhotos(
          photos.map((photo) => (photo._id === editId ? updated : photo))
        );
        setEditId(null); // On sort du mode édition
      } else {
        // Sinon, on ajoute une nouvelle photo (POST)
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const newPhoto = await res.json();
        setPhotos([...photos, newPhoto]);
      }

      // Réinitialisation du formulaire après succès
      setForm({
        src: "",
        alt: "",
        titre: "",
        description: "",
        prix: 0,
        categorie: "",
      });

      alert("Photo enregistrée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Une erreur est survenue.");
    }
  };

  // Préparation du formulaire pour l'édition d'une photo existante
  const handleEdit = (photo: Photo) => {
    setForm(photo);
    setEditId(photo._id || null);
  };

  // Suppression d'une photo par son ID
  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setPhotos(photos.filter((photo) => photo._id !== id));
  };

  // Génération de la liste des catégories uniques (issues des photos et des données locales)
  const allCategories = [
    ...new Set([
      ...photos.map((p) => p.categorie),
      ...galerieData.map((p: Photo) => p.categorie),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  // Rendu du formulaire et de la liste des photos
  return (
    <div className="p-8 max-w-4xl mx-auto text-white bg-[#1a1a20] rounded-md shadow-md">
      {/* En-tête du formulaire */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ffe992]">
          Gestion de la Galerie
        </h2>
        <button
          onClick={() => navigate("/galerie")}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ⬅ Retour à la galerie
        </button>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
              const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formData,
              });

              const data = await res.json();
              setForm((prev) => ({ ...prev, src: data.imagePath }));
            } catch (err) {
              alert("Erreur lors de l'envoi de l'image.");
              console.error(err);
            }
          }}
          className="input"
        />

        {form.src && (
          <img
            src={
              form.src.startsWith("http")
                ? form.src
                : form.src.startsWith("/")
                ? `http://localhost:5001${form.src}`
                : `http://localhost:5001/uploads/${form.src}`
            }
            alt="Aperçu"
            className="w-64 h-auto mt-2 rounded border border-gray-600"
          />
        )}

        <input
          name="alt"
          placeholder="Texte alternatif"
          value={form.alt}
          onChange={handleChange}
          className="input"
        />
        <input
          name="titre"
          placeholder="Titre"
          value={form.titre}
          onChange={handleChange}
          className="input"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="input"
        />
        <input
          type="number"
          name="prix"
          placeholder="Prix"
          value={form.prix || ""}
          onChange={handleChange}
          className="input"
        />
        <input
          list="categories"
          name="categorie"
          placeholder="Catégorie"
          value={form.categorie}
          onChange={handleChange}
          className="input"
        />

        <datalist id="categories">
          {allCategories.map((cat, index) => (
            <option key={index} value={cat} />
          ))}
        </datalist>

        <button
          onClick={handleSubmit}
          disabled={!form.src || !form.src.startsWith("/uploads/") || !form.titre || !form.alt || !form.description || !form.categorie || form.prix <= 0}
          className={`px-4 py-2 rounded font-bold transition w-full ${
            !form.src || !form.src.startsWith("/uploads/") || !form.titre || !form.alt || !form.description || !form.categorie || form.prix <= 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          }`}
        >
          {editId ? "Modifier" : "Valider"}
        </button>
      </div>

      {/* Liste avec miniatures */}
      <div className="space-y-4">
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="p-4 border border-gray-700 rounded flex justify-between items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  photo.src.startsWith("http")
                    ? photo.src
                    : photo.src.startsWith("/")
                    ? `http://localhost:5001${photo.src}`
                    : `http://localhost:5001/uploads/${photo.src}`
                }
                alt={photo.alt}
                className="w-16 h-16 object-cover rounded shadow"
              />
              <div>
                <strong>{photo.titre}</strong> — <em>{photo.categorie}</em>
              </div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(photo)}
                className="text-blue-300 hover:text-blue-500"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(photo._id!)}
                className="text-red-400 hover:text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
