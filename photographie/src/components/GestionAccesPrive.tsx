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
      // Exclure les champs techniques avant l'envoi
      const { id, _id, photos, photosOriginales, ...dataToSend } = form;
      // Éviter les warnings ESLint sur les variables inutilisées
      void id;
      void _id;
      void photos;
      void photosOriginales;

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, dataToSend, {
          withCredentials: true,
        });
        setSuccess("Accès privé modifié avec succès.");
      } else {
        await axios.post(API_URL, dataToSend, {
          withCredentials: true,
        });
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
    </div>
  );
}
