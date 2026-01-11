import { useState, useEffect } from "react";
import axios from "axios";
import { Service } from "../types/service";
import { API_URL as BASE_API_URL } from "../config/api";
import {
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  Upload,
} from "lucide-react";

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
        // Étape 1: Obtenir la signature du backend
        const signRes = await fetch(
          `${BASE_API_URL}/api/upload-cloudinary/sign`,
          { method: "GET", credentials: "include" }
        );

        if (!signRes.ok)
          throw new Error("Erreur lors de la signature de l'upload.");

        const signData = await signRes.json();
        const { signature, timestamp, cloud_name, api_key, folder } = signData;

        // Étape 2: Upload direct vers Cloudinary avec la signature
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());
        formData.append("api_key", api_key);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          newImages.push(uploadData.secure_url);
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
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion des Prestations
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Offres et services
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20 flex items-center gap-3">
          <X size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 text-green-400 p-4 rounded-lg mb-6 border border-green-500/20 flex items-center gap-3">
          <Check size={20} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE : Formulaire */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 p-6">
            <h3 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider mb-6 flex items-center gap-2">
              {editId ? <Edit size={16} /> : <Plus size={16} />}
              {editId ? "Modifier le service" : "Ajouter un service"}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Informations
                </label>
                <input
                  name="titre"
                  placeholder="Nom du service (ex: Mariage Complet)"
                  value={form.titre}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Catégorie
                </label>
                <div className="relative">
                  <input
                    list="categories-list"
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
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
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Description détaillée..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm resize-none h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Prix (à partir de)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    name="prix"
                    type="number"
                    placeholder="Prix"
                    value={form.prix}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Images
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full py-6 border-2 border-dashed border-white/10 rounded-lg bg-white/5 hover:bg-white/10 hover:border-[#ffe992]/30 transition-all flex flex-col items-center justify-center gap-2">
                    <Upload
                      size={20}
                      className="text-gray-500 group-hover:text-[#ffe992]"
                    />
                    <span className="text-xs text-gray-400 group-hover:text-white">
                      Ajouter des images
                    </span>
                  </div>
                </div>
              </div>

              {/* Prévisualisation des images */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2 bg-[#1a1a20] p-2 rounded-lg border border-white/5">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 bg-[#ffe992] text-black font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-white transition-colors shadow-lg shadow-[#ffe992]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Traitement..." : editId ? "Enregistrer" : "Créer"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="px-4 py-3 bg-white/5 text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                    onClick={resetForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="lg:col-span-7">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 overflow-hidden flex flex-col h-[800px]">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Liste des services ({services.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {services.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                  <ImageIcon size={32} className="opacity-20" />
                  <p>Aucun service trouvé.</p>
                </div>
              ) : (
                services.map((service) => (
                  <div
                    key={service._id || service.id}
                    className="bg-[#1a1a20] p-4 rounded-lg border border-white/5 hover:border-[#ffe992]/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ffe992] to-[#c9b36f] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-lg group-hover:text-[#ffe992] transition-colors">
                        {service.titre}
                      </h4>
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                        {service.categorie}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-3 line-clamp-2 font-light">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                      <span className="text-[#ffe992] font-bold text-lg">
                        {service.prix > 0 ? `${service.prix} €` : "Sur devis"}
                      </span>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-[#ffe992] hover:text-black text-gray-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit size={12} /> Modifier
                        </button>
                        <button
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                          onClick={() =>
                            handleDelete(service._id || service.id || "")
                          }
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
