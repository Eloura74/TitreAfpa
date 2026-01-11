// =======================
// 📦 Import des modules
// =======================

import { useState, useEffect } from "react";
import axios from "axios";
import { Evenement } from "../types/evenement";
import { Tarif } from "../types/tarif";
import { API_URL as BASE_API_URL } from "../config/api";
import {
  Calendar,
  MapPin,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Upload,
} from "lucide-react";

const API_URL = `${BASE_API_URL}/api/evenements`;

export default function GestionEvenements() {
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
    visibilite: "public",
    clientEmail: "",
  });

  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [selectedTariffs, setSelectedTariffs] = useState<string[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motdepasse: "",
    telephone: "",
    adresse: { rue: "", ville: "", codePostal: "", pays: "France" },
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null); // Fichier image à uploader
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadEvenements();
    loadTarifs();
  }, []);

  const loadEvenements = () => {
    setLoading(true);
    axios
      .get(API_URL, { withCredentials: true })
      .then((r) => {
        if (Array.isArray(r.data)) setEvenements(r.data);
        else setEvenements([]);
      })
      .catch((e) => {
        setError(e?.response?.data?.message || "Erreur lors du chargement.");
        setEvenements([]);
      })
      .finally(() => setLoading(false));
  };

  const loadTarifs = () => {
    axios
      .get(`${BASE_API_URL}/api/tarifs`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTarifs(res.data.filter((t: any) => t.actif));
        }
      })
      .catch((err) => console.error("Erreur chargement tarifs", err));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
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
      visibilite: "public",
      clientEmail: "",
    });
    setImagePreview("");
    setEditId(null);
    setSelectedTariffs([]);
    setError(null);
    setSuccess(null);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${BASE_API_URL}/api/auth/register`, clientForm);
      setSuccess(
        `Client ${clientForm.prenom} ${clientForm.nom} créé avec succès !`
      );
      setForm((prev) => ({ ...prev, clientEmail: clientForm.email }));
      setShowClientForm(false);
      setClientForm({
        nom: "",
        prenom: "",
        email: "",
        motdepasse: "",
        telephone: "",
        adresse: { rue: "", ville: "", codePostal: "", pays: "France" },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Erreur lors de la création du client."
      );
    } finally {
      setLoading(false);
    }
  };

  // Gère le changement d'image : stocke le fichier pour un upload ultérieur via Cloudinary
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file); // Stocke le fichier pour l'upload
      // Affichage d'une preview locale uniquement
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editId || !e.target.files) return;

    if (selectedTariffs.length === 0) {
      alert("Veuillez sélectionner au moins un tarif à appliquer aux photos.");
      return;
    }

    setLoading(true);
    const files = Array.from(e.target.files);
    const uploadedPhotoIds: string[] = [];

    try {
      const tarifsToApply = selectedTariffs
        .map((id) => {
          const t = tarifs.find((tarif) => tarif.id === id || tarif._id === id);
          return t
            ? {
                id: t.id || t._id,
                format: t.format,
                support: t.support,
                prix: t.prix,
              }
            : null;
        })
        .filter(Boolean);

      for (const file of files) {
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
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());
        formData.append("api_key", api_key);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();
        const imageUrl = uploadData.secure_url;

        if (!imageUrl) throw new Error("Erreur upload image");

        const resPhoto = await axios.post(
          `${BASE_API_URL}/api/galerie`,
          {
            src: imageUrl,
            titre: file.name,
            categorie: "Evenement",
            tarifs: tarifsToApply,
            alt: `Photo événement ${form.titre}`,
            description: `Photo de l'événement ${form.titre}`,
          },
          {
            withCredentials: true,
          }
        );

        if (resPhoto.data && resPhoto.data._id) {
          uploadedPhotoIds.push(resPhoto.data._id);
        }
      }

      if (uploadedPhotoIds.length > 0) {
        await axios.post(
          `${API_URL}/${editId}/photos`,
          { photoIds: uploadedPhotoIds },
          {
            withCredentials: true,
          }
        );

        loadEvenements();
        setSuccess(`${uploadedPhotoIds.length} photos ajoutées avec succès !`);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'upload des photos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, _id, photos, image: _, ...dataToSend } = form as any;

      // 1. Si un nouveau fichier image a été sélectionné, l'uploader sur Cloudinary (méthode signée)
      let imageUrl = form.image; // Garde l'ancienne URL si pas de nouveau fichier
      if (imageFile) {
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
        formData.append("file", imageFile);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp.toString());
        formData.append("api_key", api_key);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
        if (!imageUrl)
          throw new Error(
            "Erreur lors de l'upload de l'image vers Cloudinary."
          );
      }

      // 2. Inclure l'URL Cloudinary dans les données
      const finalData = { ...dataToSend, image: imageUrl };

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, finalData, {
          withCredentials: true,
        });
        setSuccess("Événement modifié avec succès.");
      } else {
        await axios.post(API_URL, finalData, { withCredentials: true });
        setSuccess("Événement créé avec succès.");
      }

      loadEvenements();
      resetForm();
      setImageFile(null); // Reset du fichier après succès
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.erreur ||
          err?.response?.data?.message ||
          "Erreur lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evt: Evenement) => {
    setForm({
      ...evt,
      id: evt.id || "",
      dateDebut: evt.dateDebut ? evt.dateDebut.split("T")[0] : "",
      dateFin: evt.dateFin ? evt.dateFin.split("T")[0] : "",
      image: evt.image || "",
      lieu: evt.lieu || "",
      description: evt.description || "",
      photos: evt.photos || [],
      theme: evt.theme || "",
      visibilite: evt.visibilite || "public",
      clientEmail: "",
    });
    setImagePreview(evt.image || "");
    setEditId(evt.id || null);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?"))
      return;

    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setEvenements(evenements.filter((e) => e.id !== id));
      resetForm();
      setSuccess("Événement supprimé.");
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message || "Erreur lors de la suppression."
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
            Gestion des Événements
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Planifier et organiser
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
              {editId ? "Modifier l'événement" : "Ajouter un événement"}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Image de couverture
                </label>
                <div className="relative group cursor-pointer">
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`w-full h-40 rounded-lg border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                      imagePreview
                        ? "border-[#ffe992]/50 bg-black/40"
                        : "border-white/10 bg-white/5 hover:border-[#ffe992]/30 hover:bg-white/10"
                    }`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <>
                        <ImageIcon
                          className="text-gray-500 group-hover:text-[#ffe992] transition-colors"
                          size={24}
                        />
                        <span className="text-xs text-gray-500 group-hover:text-white transition-colors">
                          Choisir une image
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Informations
                </label>
                <input
                  name="titre"
                  placeholder="Titre de l'événement"
                  value={form.titre}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3 text-gray-500"
                    size={16}
                  />
                  <input
                    name="dateDebut"
                    type="date"
                    value={form.dateDebut}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3 text-gray-500"
                    size={16}
                  />
                  <input
                    name="dateFin"
                    type="date"
                    value={form.dateFin}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-gray-500"
                  size={16}
                />
                <input
                  name="lieu"
                  placeholder="Lieu (ex: Paris, Lyon...)"
                  value={form.lieu}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                />
              </div>

              <textarea
                name="description"
                placeholder="Description de l'événement..."
                value={form.description}
                onChange={handleChange}
                className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm resize-none h-24"
                required
              />

              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Visibilité
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    name="visibilite"
                    value={form.visibilite}
                    onChange={handleChange}
                    className="bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:outline-none text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="prive">Privé</option>
                  </select>

                  {form.visibilite === "prive" && (
                    <button
                      type="button"
                      onClick={() => setShowClientForm(!showClientForm)}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg px-4 py-2 text-sm transition-colors"
                    >
                      {showClientForm ? "Masquer Client" : "+ Nouveau Client"}
                    </button>
                  )}
                </div>

                {form.visibilite === "prive" && (
                  <input
                    name="clientEmail"
                    placeholder="Email du client associé"
                    value={form.clientEmail}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                  />
                )}
              </div>

              {/* Formulaire Client Inline */}
              {showClientForm && form.visibilite === "prive" && (
                <div className="bg-blue-900/10 p-4 rounded-lg border border-blue-500/20 space-y-3">
                  <h4 className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                    Nouveau Client
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="nom"
                      placeholder="Nom"
                      value={clientForm.nom}
                      onChange={handleClientChange}
                      className="bg-[#0a0a10] border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                    <input
                      name="prenom"
                      placeholder="Prénom"
                      value={clientForm.prenom}
                      onChange={handleClientChange}
                      className="bg-[#0a0a10] border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="email"
                      placeholder="Email"
                      value={clientForm.email}
                      onChange={handleClientChange}
                      className="bg-[#0a0a10] border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                    <input
                      name="motdepasse"
                      type="password"
                      placeholder="Mot de passe"
                      value={clientForm.motdepasse}
                      onChange={handleClientChange}
                      className="bg-[#0a0a10] border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                  >
                    Créer le compte
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#ffe992] text-black font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-white transition-colors shadow-lg shadow-[#ffe992]/10"
                  disabled={loading}
                >
                  {editId ? "Enregistrer" : "Créer"}
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

          {/* GESTION DES PHOTOS (Mode édition) */}
          {editId && (
            <div className="bg-[#0a0a10] rounded-xl border border-white/10 p-6">
              <h3 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider mb-4 flex items-center gap-2">
                <ImageIcon size={16} /> Photos de l'événement
              </h3>

              <div className="space-y-4">
                <div className="bg-[#1a1a20] p-4 rounded-lg border border-white/5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    1. Tarifs applicables
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {tarifs.map((t) => (
                      <label
                        key={t.id || t._id}
                        className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTariffs.includes(
                            t.id || t._id || ""
                          )}
                          onChange={(e) => {
                            const id = t.id || t._id || "";
                            if (e.target.checked)
                              setSelectedTariffs([...selectedTariffs, id]);
                            else
                              setSelectedTariffs(
                                selectedTariffs.filter((tid) => tid !== id)
                              );
                          }}
                          className="rounded border-gray-600 bg-black/50 text-[#ffe992] focus:ring-[#ffe992]"
                        />
                        <span>
                          {t.nom}{" "}
                          <span className="text-gray-500">({t.prix}€)</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    2. Ajouter des photos
                  </h4>
                  <div className="relative group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotosUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full py-8 border-2 border-dashed border-white/10 rounded-lg bg-white/5 hover:bg-white/10 hover:border-[#ffe992]/30 transition-all flex flex-col items-center justify-center gap-2">
                      <Upload
                        size={24}
                        className="text-gray-500 group-hover:text-[#ffe992]"
                      />
                      <span className="text-xs text-gray-400 group-hover:text-white">
                        Glisser des photos ici
                      </span>
                    </div>
                  </div>
                </div>

                {form.photos && form.photos.length > 0 && (
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-sm text-[#ffe992] font-bold">
                      {form.photos.length} photos
                    </p>
                    <p className="text-xs text-gray-500">
                      associées à cet événement
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="lg:col-span-7">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 overflow-hidden flex flex-col h-[800px]">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Liste des événements
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {loading && !editId ? (
                <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                  <span className="loading loading-spinner loading-sm"></span>{" "}
                  Chargement...
                </div>
              ) : evenements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                  <Calendar size={32} className="opacity-20" />
                  <p>Aucun événement trouvé.</p>
                </div>
              ) : (
                evenements.map((event) => (
                  <div
                    key={event.id || event._id || Math.random()}
                    className="bg-[#1a1a20] p-5 rounded-lg border border-white/5 hover:border-[#ffe992]/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ffe992] to-[#c9b36f] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-[#ffe992] transition-colors">
                          {event.titre}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <MapPin size={12} /> {event.lieu}
                          <span>•</span>
                          <Calendar size={12} />{" "}
                          {new Date(event.dateDebut).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                          event.visibilite === "prive"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}
                      >
                        {event.visibilite === "prive" ? "Privé" : "Public"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-light">
                      {event.description}
                    </p>

                    <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                      <button
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-[#ffe992] hover:text-black text-gray-300 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded transition-all"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit size={12} /> Modifier
                      </button>
                      <button
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-300 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded transition-all"
                        onClick={() => event.id && handleDelete(event.id)}
                      >
                        <Trash2 size={12} /> Supprimer
                      </button>
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
