import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import galerieData from "../../config/galerie.json";

interface Photo {
  _id?: string;
  src: string;
  alt: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
}

export default function GalerieForm() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [form, setForm] = useState<Photo>({
    src: "",
    alt: "",
    titre: "",
    description: "",
    prix: 0,
    categorie: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const API_URL = "http://localhost:5000/api/galerie";
  const navigate = useNavigate(); // <== Pour rediriger

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error("Erreur chargement:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "prix" ? parseFloat(value || "0") : value,
    });
  };

  const handleSubmit = async () => {
    if (
      !form.src ||
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
        const res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setPhotos(
          photos.map((photo) => (photo._id === editId ? updated : photo))
        );
        setEditId(null);
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const newPhoto = await res.json();
        setPhotos([...photos, newPhoto]);
      }

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

  const handleEdit = (photo: Photo) => {
    setForm(photo);
    setEditId(photo._id || null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setPhotos(photos.filter((photo) => photo._id !== id));
  };

  const allCategories = [
    ...new Set([
      ...photos.map((p) => p.categorie),
      ...galerieData.map((p: Photo) => p.categorie),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-8 max-w-4xl mx-auto text-white bg-[#1a1a20] rounded-md shadow-md">
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
            src={`http://localhost:5000${form.src}`}
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
          className={`px-4 py-2 rounded font-bold transition w-full ${
            !form.src ||
            !form.titre ||
            !form.alt ||
            !form.description ||
            !form.categorie ||
            form.prix <= 0
              ? "bg-[#aa9f69] text-gray-700 cursor-not-allowed"
              : "bg-[#ffe992] text-black hover:bg-yellow-300"
          }`}
          disabled={
            !form.src ||
            !form.titre ||
            !form.alt ||
            !form.description ||
            !form.categorie ||
            form.prix <= 0
          }
        >
          {editId ? "Modifier" : "Ajouter"}
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
                src={`http://localhost:5000${photo.src}`}
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
