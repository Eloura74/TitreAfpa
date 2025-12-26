// =======================
// 📦 Import des modules
// =======================

import { useState, useEffect } from "react";
import axios from "axios";
import { Evenement } from "../types/evenement";
import { Tarif } from "../types/tarif";
import { API_URL as BASE_API_URL } from "../config/api";

const API_URL = `${BASE_API_URL}/api/evenements`;

// ==========================================
// 🎯 Composant Gestion Accès Privé
// ==========================================
export default function GestionAccesPrive() {
  // === ÉTATS ===
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  
  // Formulaire (visibilité forcée à 'prive')
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
    visibilite: "prive", // Toujours privé
    clientEmail: "",
  });

  // Gestion des tarifs
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [selectedTariffs, setSelectedTariffs] = useState<string[]>([]);

  // Gestion de la création client
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motdepasse: "",
    telephone: "",
    adresse: { rue: "", ville: "", codePostal: "", pays: "France" }
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ================================
  // 🔁 Chargement initial
  // ================================
  useEffect(() => {
    loadEvenements();
    loadTarifs();
  }, []);

  const loadEvenements = () => {
    setLoading(true);
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((r) => {
        if (Array.isArray(r.data)) {
          // Filtrer uniquement les événements privés
          setEvenements(r.data.filter((e: Evenement) => e.visibilite === "prive"));
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

  const loadTarifs = () => {
    axios.get(`${BASE_API_URL}/api/tarifs`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setTarifs(res.data.filter((t: any) => t.actif));
        }
      })
      .catch(err => console.error("Erreur chargement tarifs", err));
  };

  // ================================
  // 🎯 Handlers
  // ================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      visibilite: "prive",
      clientEmail: "",
    });
    setImagePreview("");
    setEditId(null);
    setSelectedTariffs([]);
    setError(null);
    setSuccess(null);
    setShowClientForm(false);
  };

  // ================================
  // 👤 Création Client
  // ================================
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${BASE_API_URL}/api/auth/register`, clientForm);
      setSuccess(`Client ${clientForm.prenom} ${clientForm.nom} créé avec succès !`);
      setForm(prev => ({ ...prev, clientEmail: clientForm.email }));
      setShowClientForm(false);
      setClientForm({ nom: "", prenom: "", email: "", motdepasse: "", telephone: "", adresse: { rue: "", ville: "", codePostal: "", pays: "France" } });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la création du client.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 📷 Upload Image (Couverture)
  // ================================
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Prévisualisation locale immédiate
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload vers Cloudinary
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        
        const resUpload = await axios.post(`${BASE_API_URL}/api/upload-cloudinary`, formData);
        const imageUrl = resUpload.data.url;
        
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
      const tarifsToApply = selectedTariffs.map(id => {
        const t = tarifs.find(tarif => tarif.id === id || tarif._id === id);
        return t ? {
          id: t.id || t._id,
          format: t.format,
          support: t.support,
          prix: t.prix
        } : null;
      }).filter(Boolean);

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        
        const resUpload = await axios.post(`${BASE_API_URL}/api/upload-cloudinary`, formData);
        const imageUrl = resUpload.data.url;

        if (!imageUrl) throw new Error("Erreur upload image");

        const resPhoto = await axios.post(`${BASE_API_URL}/api/galerie`, {
          src: imageUrl,
          titre: file.name,
          categorie: "EvenementPrive",
          tarifs: tarifsToApply,
          alt: `Photo privée ${form.titre}`,
          description: `Photo privée pour ${form.titre}`
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (resPhoto.data && resPhoto.data._id) {
          uploadedPhotoIds.push(resPhoto.data._id);
        }
      }

      if (uploadedPhotoIds.length > 0) {
        await axios.post(`${API_URL}/${editId}/photos`, { photoIds: uploadedPhotoIds }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
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

  // ================================
  // ✅ Submit
  // ================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, _id, photos, ...dataToSend } = form as any;
      // Force visibilité privée
      dataToSend.visibilite = "prive";

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSuccess("Accès privé modifié avec succès.");
      } else {
        await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSuccess("Accès privé créé avec succès.");
      }

      loadEvenements();
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(err?.response?.data?.erreur || err?.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evt: Evenement) => {
    setForm({
      ...evt,
      id: evt.id || "",
      dateDebut: evt.dateDebut ? evt.dateDebut.split('T')[0] : "",
      dateFin: evt.dateFin ? evt.dateFin.split('T')[0] : "",
      image: evt.image || "",
      lieu: evt.lieu || "",
      description: evt.description || "",
      photos: evt.photos || [],
      theme: evt.theme || "",
      visibilite: "prive",
      clientEmail: evt.clientEmail || "", 
    });
    setImagePreview(evt.image || "");
    setEditId(evt.id || null);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet accès privé ?")) return;
    
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEvenements(evenements.filter((e) => e.id !== id));
      resetForm();
      setSuccess("Accès privé supprimé.");
    } catch (e) {
      const err = e as any;
      setError(err?.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-6xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">
        Gestion <span className="text-white">Accès Privé</span>
      </h2>
      <p className="text-gray-400 mb-6 text-sm">
        Créez ici les espaces privés pour vos clients. Ils pourront y accéder via "L'Écrin Privé" avec leur email et mot de passe.
      </p>

      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/30">{error}</div>}
      {success && <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 border border-green-500/30">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLONNE GAUCHE : Formulaire */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">{editId ? "Modifier l'accès" : "Créer un nouvel accès privé"}</h3>
          <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
            
            <input
              name="titre"
              placeholder="Nom de l'événement / Client"
              value={form.titre}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
              required
            />

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Image de couverture</label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm"
              />
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Prévisualisation"
                className="w-full h-32 object-cover rounded border border-white/10"
              />
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Date de début</label>
                <input
                  name="dateDebut"
                  type="date"
                  value={form.dateDebut}
                  onChange={handleChange}
                  className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Date de fin</label>
                <input
                  name="dateFin"
                  type="date"
                  value={form.dateFin}
                  onChange={handleChange}
                  className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
                  required
                />
              </div>
            </div>
            
            <textarea
              name="description"
              placeholder="Message pour le client (Description)"
              value={form.description}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white resize-none h-24"
              required
            />

            {/* Section Client */}
            <div className="bg-[#232336] p-4 rounded border border-white/10">
              <label className="text-sm font-bold text-[#ffe992] mb-2 block">Client associé</label>
              <div className="flex gap-2 mb-2">
                <input
                  name="clientEmail"
                  placeholder="Email du client existant"
                  value={form.clientEmail}
                  onChange={handleChange}
                  className="bg-black/20 border border-white/10 rounded px-4 py-2 text-white w-full"
                />
                <button 
                  type="button"
                  onClick={() => setShowClientForm(!showClientForm)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded whitespace-nowrap"
                >
                  {showClientForm ? "Masquer" : "Nouveau Client"}
                </button>
              </div>

              {/* Formulaire Création Client */}
              {showClientForm && (
                <div className="bg-black/20 p-3 rounded border border-blue-500/30 mt-2">
                  <h4 className="text-blue-400 font-bold mb-3 text-sm">Créer un compte client</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input name="nom" placeholder="Nom" value={clientForm.nom} onChange={handleClientChange} className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm" />
                    <input name="prenom" placeholder="Prénom" value={clientForm.prenom} onChange={handleClientChange} className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input name="email" placeholder="Email" value={clientForm.email} onChange={handleClientChange} className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm" />
                    <input name="motdepasse" type="password" placeholder="Mot de passe" value={clientForm.motdepasse} onChange={handleClientChange} className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm" />
                  </div>
                  <button type="button" onClick={handleCreateClient} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-1 rounded">Créer le compte</button>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition"
                disabled={loading}
              >
                {editId ? "Enregistrer les modifications" : "Créer l'accès privé"}
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

          {/* GESTION DES PHOTOS */}
          {editId && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Photos de la galerie privée</h3>
              
              <div className="mb-6 bg-[#232336] p-4 rounded border border-white/10">
                <h4 className="text-sm font-bold text-[#ffe992] mb-2">1. Tarifs applicables</h4>
                <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tarifs.map(t => (
                    <label key={t.id || t._id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:bg-white/5 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedTariffs.includes(t.id || t._id || "")}
                        onChange={(e) => {
                          const id = t.id || t._id || "";
                          if (e.target.checked) setSelectedTariffs([...selectedTariffs, id]);
                          else setSelectedTariffs(selectedTariffs.filter(tid => tid !== id));
                        }}
                        className="rounded border-gray-600 bg-black/50"
                      />
                      <span>{t.nom} ({t.format} - {t.prix}€)</span>
                    </label>
                  ))}
                </div>
                {tarifs.length === 0 && <p className="text-xs text-gray-500">Aucun tarif disponible.</p>}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#ffe992]">2. Ajouter des photos</h4>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotosUpload}
                  className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm"
                />
                <p className="text-xs text-gray-400">Sélectionnez plusieurs photos. Les tarifs cochés seront appliqués.</p>
                
                {form.photos && form.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-4 max-h-60 overflow-y-auto p-2 bg-black/20 rounded">
                    <p className="col-span-3 text-center text-gray-500 text-sm py-4">
                      {form.photos.length} photos dans cette galerie.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">Aucune photo pour le moment.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="border-l border-white/10 pl-8">
          <h3 className="text-xl font-semibold text-white mb-4">Accès Privés Existants</h3>
          {loading && !editId ? (
            <div className="text-center text-gray-400">Chargement...</div>
          ) : evenements.length === 0 ? (
            <div className="text-center text-gray-500">Aucun accès privé trouvé.</div>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {evenements.map((event) => (
                <div
                  key={event.id || event._id}
                  className="bg-[#232336] p-4 rounded border border-white/5 hover:border-[#ffe992]/30 transition group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[#ffe992]">{event.titre}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Privé
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{event.clientEmail || "Aucun client assigné"}</p>
                  <p className="text-xs text-gray-500 mb-2">{new Date(event.dateDebut).toLocaleDateString()}</p>
                  
                  <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs px-3 py-1.5 rounded transition"
                      onClick={() => handleEdit(event)}
                    >
                      Gérer
                    </button>
                    <button
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition"
                      onClick={() => event.id && handleDelete(event.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
