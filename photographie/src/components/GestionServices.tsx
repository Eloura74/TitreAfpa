import { useState, useEffect } from "react";
import axios from "axios";
import { Service } from "../types/service";
import { API_URL as BASE_API_URL } from "../config/api";

const API_URL = `${BASE_API_URL}/api/services`;

export default function GestionServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<Service>({
    titre: "",
    description: "",
    prix: 0,
    images: [],
    categorie: "Autre",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    setLoading(true);
    axios
      .get(API_URL)
      .then((r) => {
        if (Array.isArray(r.data)) setServices(r.data);
        else setServices([]);
      })
      .catch((e) => {
        setError("Erreur lors du chargement des services.");
        console.error(e);
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);

        const res = await axios.post(
          `${BASE_API_URL}/api/upload-cloudinary`,
          formData
        );
        if (res.data.url) {
          newImages.push(res.data.url);
        }
      }

      setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      setImagePreview((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'upload des images.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
    setImagePreview(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setSuccess("Service modifié avec succès.");
      } else {
        await axios.post(API_URL, form);
        setSuccess("Service créé avec succès.");
      }
      loadServices();
      resetForm();
    } catch (e) {
      setError("Erreur lors de l'enregistrement.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setForm(service);
    setImagePreview(service.images);
    setEditId(service._id || service.id || null);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?"))
      return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setServices(services.filter((s) => (s._id || s.id) !== id));
      setSuccess("Service supprimé.");
    } catch (e) {
      setError("Erreur lors de la suppression.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      titre: "",
      description: "",
      prix: 0,
      images: [],
      categorie: "Autre",
    });
    setImagePreview([]);
    setEditId(null);
  };

  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-6xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">
        Gestion <span className="text-white">des Prestations</span>
      </h2>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/30">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 border border-green-500/30">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            {editId ? "Modifier le service" : "Ajouter un service"}
          </h3>
          <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
            <input
              name="titre"
              placeholder="Nom du service (ex: Mariage Complet)"
              value={form.titre}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
              required
            />

            <div className="space-y-1">
              <label className="text-xs text-gray-400">
                Catégorie (ex: Mariage, Studio...)
              </label>
              <input
                list="categories-list"
                name="categorie"
                value={form.categorie}
                onChange={handleChange}
                className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
                placeholder="Sélectionnez ou écrivez une catégorie"
              />
              <datalist id="categories-list">
                <option value="Mariage" />
                <option value="Shooting" />
                <option value="Studio" />
                <option value="Evenement" />
                <option value="Autre" />
              </datalist>
            </div>

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white resize-none h-32"
              required
            />

            <div className="space-y-1">
              <label className="text-xs text-gray-400">
                Prix (à partir de)
              </label>
              <input
                name="prix"
                type="number"
                placeholder="Prix"
                value={form.prix}
                onChange={handleChange}
                className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">
                Images d'illustration
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm"
              />
            </div>

            {/* Prévisualisation des images */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagePreview.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition"
                disabled={loading}
              >
                {editId ? "Enregistrer" : "Créer le service"}
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

        {/* Liste */}
        <div className="border-l border-white/10 pl-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Liste des services
          </h3>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {services.map((service) => (
              <div
                key={service._id || service.id}
                className="bg-[#232336] p-4 rounded border border-white/5 hover:border-[#ffe992]/30 transition group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#ffe992]">{service.titre}</h4>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                    {service.categorie}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {service.description}
                </p>
                <p className="text-sm text-white font-bold">
                  {service.prix > 0 ? `${service.prix} €` : "Sur devis"}
                </p>

                <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs px-3 py-1.5 rounded transition"
                    onClick={() => handleEdit(service)}
                  >
                    Modifier
                  </button>
                  <button
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition"
                    onClick={() =>
                      handleDelete(service._id || service.id || "")
                    }
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
