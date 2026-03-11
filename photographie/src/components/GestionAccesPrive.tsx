import { useState, useEffect } from "react";
import axios from "axios";
import { Evenement } from "../types/evenement";
import { API_URL as BASE_API_URL } from "../config/api";
import PrivateAccessForm from "./admin/acces-prive/PrivateAccessForm";
import PrivateAccessList from "./admin/acces-prive/PrivateAccessList";
import { Check, X } from "lucide-react";

const API_URL = `${BASE_API_URL}/api/acces-prive`;

export default function GestionAccesPrive() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [form, setForm] = useState<Evenement>({
    id: "",
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    image: "",
    lieu: "",
    photos: [],
    theme: "",
    visibilite: "prive",
    clientEmail: "",
    codeAcces: "",
    typeValidite: "permanent",
    dateExpiration: "",
    typeLimiteTelechargement: "illimite",
    maxTelechargementParPhoto: undefined,
    maxTelechargementTotal: undefined,
    photosOriginales: [],
    statut: "actif",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadEvenements();
    // loadTarifs();
  }, []);

  const loadEvenements = () => {
    setLoading(true);
    axios
      .get(API_URL, { withCredentials: true })
      .then((r) => {
        // L'API retourne maintenant { status, results, data }
        // On extrait le tableau depuis le champ "data"
        if (r.data?.data && Array.isArray(r.data.data)) {
          setEvenements(r.data.data);
        } else {
          setEvenements([]);
        }
      })
      .catch((e) => {
        setError(e?.response?.data?.message || "Erreur lors du chargement.");
        setEvenements([]);
      })
      .finally(() => setLoading(false));
  };

  // const loadTarifs = () => {
  //   axios
  //     .get(`${BASE_API_URL}/api/tarifs`)
  //     .then((res) => {
  //       if (Array.isArray(res.data)) {
  //         setTarifs(res.data.filter((t: any) => t.actif));
  //       }
  //     })
  //     .catch((err) => console.error("Erreur chargement tarifs", err));
  // };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: "",
      titre: "",
      description: "",
      dateDebut: "",
      dateFin: "",
      image: "",
      lieu: "",
      photos: [],
      theme: "",
      visibilite: "prive",
      clientEmail: "",
      codeAcces: "",
      typeValidite: "permanent",
      dateExpiration: "",
      typeLimiteTelechargement: "illimite",
      maxTelechargementParPhoto: undefined,
      maxTelechargementTotal: undefined,
      photosOriginales: [],
      statut: "actif",
    });
    setImagePreview("");
    setEditId(null);
    setError(null);
    setSuccess(null);
  };

  // Fonction helper pour l'upload direct vers Cloudinary
  const uploadToCloudinary = async (file: File) => {
    // 1. Récupérer la signature depuis le backend
    const signRes = await axios.get(
      `${BASE_API_URL}/api/upload-cloudinary/sign`,
      {
        withCredentials: true,
      },
    );
    const { signature, timestamp, cloud_name, api_key, folder } = signRes.data;

    // 2. Préparer le formulaire pour Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    // 3. Envoyer directement à Cloudinary
    const cloudinaryRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      formData,
    );

    return cloudinaryRes.data.secure_url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setLoading(true);
      try {
        const imageUrl = await uploadToCloudinary(file);

        if (imageUrl) {
          setForm((prev) => ({ ...prev, image: imageUrl }));
          setSuccess("Image de couverture uploadée avec succès !");
        }
      } catch (err) {
        console.error("Erreur upload couverture:", err);
        setError("Erreur lors de l'upload de l'image de couverture.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, _id, photos, photosOriginales, ...dataToSend } = form as any;
      let targetId = editId;

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, dataToSend, {
          withCredentials: true,
        });
        setSuccess("Accès privé modifié avec succès.");
      } else {
        const res = await axios.post(API_URL, dataToSend, {
          withCredentials: true,
        });
        targetId = res.data._id || res.data.id;
        setSuccess("Accès privé créé avec succès.");
      }

      loadEvenements();
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.erreur ||
          err?.response?.data?.message ||
          "Erreur lors de l'enregistrement.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evt: Evenement) => {
    const eventId = evt.id || evt._id || "";
    setForm({
      ...evt,
      id: eventId,
      dateDebut: evt.dateDebut ? evt.dateDebut.split("T")[0] : "",
      dateFin: evt.dateFin ? evt.dateFin.split("T")[0] : "",
      image: evt.image || "",
      lieu: evt.lieu || "",
      description: evt.description || "",
      photos: evt.photos || [],
      theme: evt.theme || "",
      visibilite: "prive",
      clientEmail: evt.clientEmail || "",
    });
    setImagePreview(evt.image || "");
    setEditId(eventId);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet accès privé ?"))
      return;

    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setEvenements(evenements.filter((e) => (e.id || e._id) !== id));
      resetForm();
      setSuccess("Accès privé supprimé.");
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message || "Erreur lors de la suppression.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await axios.delete(`${BASE_API_URL}/api/galerie/${photoId}`, {
        withCredentials: true,
      });
      const updatedPhotos = form.photos?.filter(
        (p: any) => (p._id || p.id) !== photoId,
      );
      setForm((prev) => ({ ...prev, photos: updatedPhotos }));
      setSuccess("Photo supprimée.");
    } catch (err) {
      console.error(err);
      setError("Erreur suppression photo.");
    }
  };

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion Accès Privé
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Espaces clients sécurisés
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
        <div className="lg:col-span-5">
          <PrivateAccessForm
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            loading={loading}
            editId={editId}
            handleImageChange={handleImageChange}
            imagePreview={imagePreview}
            onRefresh={loadEvenements}
          />
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="lg:col-span-7">
          <PrivateAccessList
            evenements={evenements}
            loading={loading}
            selectedId={editId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* MODAL ÉDITION PHOTO */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-[#181824] p-6 rounded-xl max-w-2xl w-full border border-[#ffe992]/20 shadow-2xl">
            <h3 className="text-lg font-bold text-[#ffe992] mb-6 flex items-center gap-2">
              <Edit size={18} /> Modifier la photo
            </h3>

            <div className="flex gap-6 mb-6">
              <img
                src={editingPhoto.src}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg border border-white/10 shadow-lg"
              />
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Titre
                  </label>
                  <input
                    value={editingPhoto.titre || ""}
                    onChange={(e) =>
                      setEditingPhoto({
                        ...editingPhoto,
                        titre: e.target.value,
                      })
                    }
                    className="w-full bg-[#232336] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[#ffe992] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={editingPhoto.description || ""}
                    onChange={(e) =>
                      setEditingPhoto({
                        ...editingPhoto,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#232336] border border-white/10 rounded-lg px-4 py-2 text-white text-sm h-24 resize-none focus:border-[#ffe992] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.put(
                      `${BASE_API_URL}/api/galerie/${
                        editingPhoto._id || editingPhoto.id
                      }`,
                      editingPhoto,
                      {
                        withCredentials: true,
                      },
                    );
                    const updatedPhotos = form.photos?.map((p: any) =>
                      (p._id || p.id) === (editingPhoto._id || editingPhoto.id)
                        ? editingPhoto
                        : p,
                    );
                    setForm((prev) => ({ ...prev, photos: updatedPhotos }));
                    setEditingPhoto(null);
                    setSuccess("Photo modifiée avec succès.");
                  } catch (err) {
                    console.error(err);
                    setError("Erreur lors de la modification de la photo.");
                  }
                }}
                className="px-6 py-2 bg-[#ffe992] text-black font-bold rounded-lg hover:bg-white transition-colors text-sm uppercase tracking-wider shadow-lg shadow-[#ffe992]/10"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
