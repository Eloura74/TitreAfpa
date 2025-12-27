// =======================
// 📦 Import des modules
// =======================

import { useState, useEffect } from "react";
import axios from "axios";
import { Evenement } from "../types/evenement";
import { Tarif } from "../types/tarif";
import { API_URL as BASE_API_URL } from "../config/api";

// Import des sous-composants refactorisés
import PrivateAccessForm from "./admin/acces-prive/PrivateAccessForm";
import PrivateAccessList from "./admin/acces-prive/PrivateAccessList";
import { compressImage } from "./admin/acces-prive/PhotoUploader"; // Import de l'utilitaire

const API_URL = `${BASE_API_URL}/api/acces-prive`;

// ==========================================
// 🎯 Composant Gestion Accès Privé (Page Principale)
// ==========================================
// Ce composant sert de conteneur principal. Il gère l'état global,
// les appels API et la coordination entre le formulaire et la liste.
export default function GestionAccesPrive() {

  // === ÉTATS GLOBAUX ===
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
        withCredentials: true,
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
  // 🎯 Handlers Génériques
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

  // ================================
  // 📷 Upload Photos Galerie (Mode Édition)
  // ================================
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
          withCredentials: true,
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
          withCredentials: true,
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
  // ✅ Submit Principal (Création + Upload Initial)
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

      // 2. Upload des photos si présentes (Mode Création)
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
                    withCredentials: true,
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
              withCredentials: true,
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

  // ================================
  // ✏️ Actions Liste (Edit / Delete)
  // ================================
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
        withCredentials: true,
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

  // ================================
  // 🖼️ Actions Photos (Delete Photo)
  // ================================
  const handleDeletePhoto = async (photoId: string) => {
    try {
      await axios.delete(`${BASE_API_URL}/api/galerie/${photoId}`, {
        withCredentials: true,
      });
      // Mettre à jour l'état local
      const updatedPhotos = form.photos?.filter((p: any) => (p._id || p.id) !== photoId);
      setForm(prev => ({ ...prev, photos: updatedPhotos }));
      setSuccess("Photo supprimée.");
    } catch (err) {
      console.error(err);
      setError("Erreur suppression photo.");
    }
  };

  // ================================
  // 🖥️ Rendu Principal
  // ================================
  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-6xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">
        Gestion <span className="text-white">Accès Privé</span>
      </h2>
      <p className="text-gray-400 mb-6 text-sm">
        Créez ici les espaces privés pour vos clients. Ils pourront y accéder via "L'Écrin Privé" avec leur email et mot de passe.
      </p>

      {/* Messages de Feedback */}
      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/30 animate-pulse">{error}</div>}
      {success && <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 border border-green-500/30">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLONNE GAUCHE : Formulaire */}
        <PrivateAccessForm 
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          loading={loading}
          editId={editId}
          handleImageChange={handleImageChange}
          imagePreview={imagePreview}
          showClientForm={showClientForm}
          setShowClientForm={setShowClientForm}
          clientForm={clientForm}
          handleClientChange={handleClientChange}
          handleCreateClient={handleCreateClient}
          tarifs={tarifs}
          selectedTariffs={selectedTariffs}
          setSelectedTariffs={setSelectedTariffs}
          filesToUpload={filesToUpload}
          setFilesToUpload={setFilesToUpload}
          handlePhotosUpload={handlePhotosUpload}
          onEditPhoto={setEditingPhoto}
          onDeletePhoto={handleDeletePhoto}
        />

        {/* COLONNE DROITE : Liste */}
        <PrivateAccessList 
          evenements={evenements}
          loading={loading}
          selectedId={editId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* MODAL ÉDITION PHOTO (Reste ici pour l'instant car simple) */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
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
                    className="w-full bg-[#232336] border border-white/10 rounded px-3 py-1 text-white text-sm focus:border-[#ffe992] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Description</label>
                  <textarea
                    value={editingPhoto.description || ""}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                    className="w-full bg-[#232336] border border-white/10 rounded px-3 py-1 text-white text-sm h-20 resize-none focus:border-[#ffe992] outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
                <button 
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                >
                    Annuler
                </button>
                <button 
                    onClick={async () => {
                        // Logique de sauvegarde de la photo modifiée
                        try {
                            await axios.put(`${BASE_API_URL}/api/galerie/${editingPhoto._id || editingPhoto.id}`, editingPhoto, {
                                withCredentials: true
                            });
                            // Mise à jour locale
                            const updatedPhotos = form.photos?.map((p: any) => 
                                (p._id || p.id) === (editingPhoto._id || editingPhoto.id) ? editingPhoto : p
                            );
                            setForm(prev => ({ ...prev, photos: updatedPhotos }));
                            setEditingPhoto(null);
                            setSuccess("Photo modifiée avec succès.");
                        } catch (err) {
                            console.error(err);
                            setError("Erreur lors de la modification de la photo.");
                        }
                    }}
                    className="px-4 py-2 bg-[#ffe992] text-black font-bold rounded hover:bg-[#d6c487] transition"
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
