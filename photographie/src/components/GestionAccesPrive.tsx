// =======================
// 📦 Import des modules
// =======================

import { useState, useEffect } from "react";
import axios from "axios";
import { Evenement } from "../types/evenement";
import { Tarif } from "../types/tarif";
import { API_URL as BASE_API_URL } from "../config/api";

const API_URL = `${BASE_API_URL}/api/acces-prive`;

// ==========================================
// 🎯 Composant Gestion Accès Privé
// ==========================================
export default function GestionAccesPrive() {
  // === UTILITAIRE DE COMPRESSION ===
  const compressImage = async (file: File): Promise<File> => {
    // Si l'image fait moins de 2MB, on la garde telle quelle
    if (file.size < 2 * 1024 * 1024) return file;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback
          return;
        }

        // On limite la résolution max (ex: 4096px) pour éviter les images géantes
        const MAX_DIM = 4096;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compression JPEG à 80%
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              console.log(`Compression: ${file.size} -> ${newFile.size}`);
              resolve(newFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = (err) => {
        console.error("Erreur compression", err);
        resolve(file);
      };
    });
  };

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

  // Gestion de l'édition d'une photo spécifique
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

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
          setEvenements(r.data);
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
    setFilesToUpload([]);
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
        try {
          const compressedFile = await compressImage(file);
          const formData = new FormData();
          formData.append("image", compressedFile);
          
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
        } catch (err) {
          console.error(`Erreur upload fichier ${file.name}`, err);
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
  // ================================
  // ✅ Submit (Création + Upload)
  // ================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, _id, photos, ...dataToSend } = form as any;
      let targetId = editId;

      // 1. Création ou Modification de l'accès
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSuccess("Accès privé modifié avec succès.");
      } else {
        const res = await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        targetId = res.data._id || res.data.id;
        setSuccess("Accès privé créé avec succès.");
      }

      // 2. Upload des photos si présentes
      console.log("Files to upload:", filesToUpload.length);
      console.log("Target ID:", targetId);

      if (filesToUpload.length > 0 && targetId) {
        setSuccess(prev => `${prev} Upload de ${filesToUpload.length} photos en cours...`);
        
        const uploadedPhotoIds: string[] = [];
        const tarifsToApply = selectedTariffs.map(id => {
            const t = tarifs.find(tarif => tarif.id === id || tarif._id === id);
            return t ? {
              id: t.id || t._id,
              format: t.format,
              support: t.support,
              prix: t.prix
            } : null;
          }).filter(Boolean);

        for (const file of filesToUpload) {
            try {
              const compressedFile = await compressImage(file);
              const formData = new FormData();
              formData.append("image", compressedFile);
              
              const resUpload = await axios.post(`${BASE_API_URL}/api/upload-cloudinary`, formData);
              const imageUrl = resUpload.data.url;

              if (imageUrl) {
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
            } catch (err) {
              console.error(`Erreur upload fichier ${file.name}`, err);
            }
        }

        if (uploadedPhotoIds.length > 0) {
            await axios.post(`${API_URL}/${targetId}/photos`, { photoIds: uploadedPhotoIds }, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setSuccess(prev => `${prev} ${uploadedPhotoIds.length} photos ajoutées !`);
        }
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

            <div className="bg-[#232336] p-4 rounded border border-white/10 mt-4">
              <h4 className="text-sm font-bold text-[#ffe992] mb-2">Ajouter des photos (Optionnel)</h4>
              <p className="text-xs text-gray-400 mb-2">Vous pouvez sélectionner plusieurs photos ou un dossier complet dès maintenant.</p>
              
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Tarifs par défaut pour ces photos :</p>
                <div className="max-h-24 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
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
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setFilesToUpload(Array.from(e.target.files));
                  }
                }}
                className="w-full bg-[#181824] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm"
              />
              {filesToUpload.length > 0 && (
                <p className="text-xs text-green-400 mt-1">{filesToUpload.length} fichier(s) sélectionné(s)</p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Traitement en cours..." : (editId ? "Enregistrer les modifications" : "Créer l'accès privé")}
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
          {/* GESTION DES PHOTOS */}
          {editId && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Photos de la galerie privée</h3>
              
              {/* UPLOAD */}
              <div className="mb-6 bg-[#232336] p-4 rounded border border-white/10">
                <h4 className="text-sm font-bold text-[#ffe992] mb-2">Ajouter des photos</h4>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Tarifs par défaut pour les nouvelles photos :</p>
                  <div className="max-h-24 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
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
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotosUpload}
                  className="w-full bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white text-sm"
                />
              </div>

              {/* LISTE DES PHOTOS */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#ffe992]">Photos existantes ({form.photos?.length || 0})</h4>
                
                {form.photos && form.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {form.photos.map((photo: any) => (
                      <div key={photo._id || photo.id} className="bg-[#232336] p-2 rounded border border-white/10 group relative">
                        <img 
                          src={photo.src} 
                          alt={photo.alt} 
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        <p className="text-xs text-white font-bold truncate">{photo.titre}</p>
                        <p className="text-[10px] text-gray-400 truncate mb-2">{photo.description || "Aucune description"}</p>
                        
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPhoto(photo)}
                            className="flex-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs py-1 rounded transition"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm("Supprimer cette photo ?")) return;
                              try {
                                await axios.delete(`${BASE_API_URL}/api/galerie/${photo._id || photo.id}`, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                });
                                // Mettre à jour l'état local
                                const updatedPhotos = form.photos.filter((p: any) => (p._id || p.id) !== (photo._id || photo.id));
                                setForm(prev => ({ ...prev, photos: updatedPhotos }));
                                setSuccess("Photo supprimée.");
                              } catch (err) {
                                console.error(err);
                                setError("Erreur suppression photo.");
                              }
                            }}
                            className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-2 rounded transition"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))}
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
      {/* MODAL ÉDITION PHOTO */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181824] p-6 rounded-lg max-w-2xl w-full border border-[#ffe992]/20 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#ffe992] mb-4">Modifier la photo</h3>
            
            <div className="flex gap-4 mb-4">
              <img src={editingPhoto.src} alt="Preview" className="w-32 h-32 object-cover rounded border border-white/10" />
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Titre</label>
                  <input
                    value={editingPhoto.titre || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, titre: e.target.value })}
                    className="w-full bg-[#232336] border border-white/10 rounded px-3 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Description</label>
                  <textarea
                    value={editingPhoto.description || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                    className="w-full bg-[#232336] border border-white/10 rounded px-3 py-1 text-white text-sm h-20 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-bold text-white mb-2">Tarifs disponibles pour cette photo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-[#232336] p-3 rounded border border-white/10">
                {tarifs.map(t => {
                  const isSelected = editingPhoto.tarifs?.some((pt: any) => (pt.id === t.id || pt._id === t._id || pt.id === t._id));
                  return (
                    <label key={t.id || t._id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:bg-white/5 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => {
                          let newTarifs = editingPhoto.tarifs || [];
                          if (e.target.checked) {
                            // Ajouter le tarif complet
                            newTarifs = [...newTarifs, t];
                          } else {
                            // Retirer le tarif
                            newTarifs = newTarifs.filter((pt: any) => (pt.id !== t.id && pt._id !== t._id && pt.id !== t._id));
                          }
                          setEditingPhoto({ ...editingPhoto, tarifs: newTarifs });
                        }}
                        className="rounded border-gray-600 bg-black/50"
                      />
                      <span>{t.nom} ({t.format} - {t.prix}€)</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.put(`${BASE_API_URL}/api/galerie/${editingPhoto._id || editingPhoto.id}`, editingPhoto, {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
                    
                    // Mise à jour locale
                    const updatedPhotos = form.photos.map((p: any) => 
                      (p._id === editingPhoto._id || p.id === editingPhoto.id) ? editingPhoto : p
                    );
                    setForm(prev => ({ ...prev, photos: updatedPhotos }));
                    setEditingPhoto(null);
                    setSuccess("Photo mise à jour avec succès !");
                  } catch (err) {
                    console.error(err);
                    setError("Erreur lors de la mise à jour de la photo.");
                  }
                }}
                className="px-4 py-2 rounded bg-[#ffe992] text-black font-bold hover:bg-[#d6c487] transition"
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
