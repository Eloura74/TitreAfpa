// =======================
// 📦 Import des modules
// =======================

// Hooks React pour gérer les états et effets
import { useState, useEffect } from "react";
// Librairie Axios pour faire des requêtes HTTP
import axios from "axios";

// ============================
// 🧩 Définition du type Evenement
// ============================
// On importe le type Evenement depuis le dossier types
import { Evenement } from "../types/evenement";
import { Tarif } from "../types/tarif"; // Assurez-vous que ce type existe

// URL de base de l’API, récupérée depuis les variables d’environnement Vite
import { API_URL as BASE_API_URL } from "../config/api";
const API_URL = `${BASE_API_URL}/api/evenements`;

// ==========================================
// 🎯 Composant principal de gestion des événements
// ==========================================
export default function GestionEvenements() {
  // === ÉTATS ===

  // Liste des événements à afficher
  const [evenements, setEvenements] = useState<Evenement[]>([]);

  // Formulaire actuel (correspond au type Evenement)
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

  // Prévisualisation de l'image uploadée
  const [imagePreview, setImagePreview] = useState<string>("");

  // ID de l’événement qu’on édite actuellement (null = on ajoute)
  const [editId, setEditId] = useState<string | null>(null);

  // Affichage du chargement (utile pendant les appels API)
  const [loading, setLoading] = useState(false);

  // Message d’erreur à afficher si une requête échoue
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ================================
  // 🔁 Chargement initial des événements et tarifs
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
        if (Array.isArray(r.data))
          setEvenements(r.data); // Vérifie qu'on a bien un tableau
        else setEvenements([]);
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
  // 🎯 Mise à jour du formulaire lors d’une saisie
  // ================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  // Réinitialise le formulaire (tous les champs)
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

  // ================================
  // 👤 Création d'un client
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
  // 📷 Gestion de l'upload et de la prévisualisation de l'image
  // ================================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ================================
  // 🖼️ Gestion de l'upload multiple de photos pour la galerie
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
      // Préparation des tarifs sélectionnés
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
        // 1. Upload Cloudinary
        const formData = new FormData();
        formData.append("image", file);
        
        const resUpload = await axios.post(`${BASE_API_URL}/api/upload-cloudinary`, formData);
        const imageUrl = resUpload.data.url;

        if (!imageUrl) throw new Error("Erreur upload image");

        // 2. Créer la photo avec les tarifs
        const resPhoto = await axios.post(`${BASE_API_URL}/api/galerie`, {
          src: imageUrl,
          titre: file.name,
          categorie: "Evenement",
          tarifs: tarifsToApply,
          alt: `Photo événement ${form.titre}`,
          description: `Photo de l'événement ${form.titre}`
        }, {
          withCredentials: true,
        });

        if (resPhoto.data && resPhoto.data._id) {
          uploadedPhotoIds.push(resPhoto.data._id);
        }
      }

      // 3. Lier les photos à l'événement
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
  // ✅ Envoi du formulaire (ajout ou modification)
  // ================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { id, _id, photos, ...dataToSend } = form as any;

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, dataToSend, {
          withCredentials: true,
        });
        setSuccess("Événement modifié avec succès.");
      } else {
        await axios.post(API_URL, dataToSend, {
          withCredentials: true,
        });
        setSuccess("Événement créé avec succès.");
      }

      loadEvenements();
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(err?.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // ✏️ Remplit le formulaire avec un événement existant
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
      visibilite: evt.visibilite || "public",
      clientEmail: "", 
    });
    setImagePreview(evt.image || "");
    setEditId(evt.id || null);
    setError(null);
    setSuccess(null);
  };

  // ================================
  // 🗑️ Supprime un événement
  // ================================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true,
      });

      setEvenements(evenements.filter((e) => e.id !== id));
      resetForm();
      setSuccess("Événement supprimé.");
    } catch (e) {
      const err = e as any;
      setError(err?.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 🖥️ Affichage de l’interface
  // ================================
  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-6xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">
        Gestion <span className="text-white">des Événements</span>
      </h2>

      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 border border-red-500/30">{error}</div>}
      {success && <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4 border border-green-500/30">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLONNE GAUCHE : Formulaire */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">{editId ? "Modifier l'événement" : "Ajouter un événement"}</h3>
          <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
            {/* Champ image de couverture */}
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
            
            <input
              name="titre"
              placeholder="Titre de l'événement"
              value={form.titre}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
              required
            />

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

            <input
              name="lieu"
              placeholder="Lieu (ex: Paris, Lyon...)"
              value={form.lieu}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
            />
            
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white resize-none h-24"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                name="visibilite"
                value={form.visibilite}
                onChange={handleChange}
                className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
              >
                <option value="public">Public</option>
                <option value="prive">Privé</option>
              </select>

              {form.visibilite === "prive" && (
                <div className="flex gap-2">
                  <input
                    name="clientEmail"
                    placeholder="Email du client"
                    value={form.clientEmail}
                    onChange={handleChange}
                    className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white w-full"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowClientForm(!showClientForm)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded"
                    title="Créer un compte client"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Formulaire de création client (Modal ou inline) */}
            {showClientForm && form.visibilite === "prive" && (
              <div className="bg-[#232336] p-4 rounded border border-blue-500/30 mt-2">
                <h4 className="text-blue-400 font-bold mb-3 text-sm">Nouveau Client</h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input name="nom" placeholder="Nom" value={clientForm.nom} onChange={handleClientChange} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                  <input name="prenom" placeholder="Prénom" value={clientForm.prenom} onChange={handleClientChange} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input name="email" placeholder="Email" value={clientForm.email} onChange={handleClientChange} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                  <input name="motdepasse" type="password" placeholder="Mot de passe" value={clientForm.motdepasse} onChange={handleClientChange} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                </div>
                <button type="button" onClick={handleCreateClient} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-1 rounded">Créer le compte</button>
              </div>
            )}

            {/* Boutons Ajouter/Modifier + Annuler */}
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition"
                disabled={loading}
              >
                {editId ? "Enregistrer les modifications" : "Créer l'événement"}
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

          {/* GESTION DES PHOTOS (Seulement en mode édition) */}
          {editId && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Photos de l'événement</h3>
              
              {/* Sélection des tarifs */}
              <div className="mb-6 bg-[#232336] p-4 rounded border border-white/10">
                <h4 className="text-sm font-bold text-[#ffe992] mb-2">1. Configurer les tarifs pour les nouvelles photos</h4>
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
                <p className="text-xs text-gray-400">Sélectionnez plusieurs photos. Les tarifs cochés ci-dessus seront appliqués.</p>
                
                {/* Grille des photos existantes */}
                {form.photos && form.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-4 max-h-60 overflow-y-auto p-2 bg-black/20 rounded">
                    <p className="col-span-3 text-center text-gray-500 text-sm py-4">
                      {form.photos.length} photos associées.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">Aucun photo dans cet événement.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="border-l border-white/10 pl-8">
          <h3 className="text-xl font-semibold text-white mb-4">Liste des événements</h3>
          {loading && !editId ? (
            <div className="text-center text-gray-400">Chargement...</div>
          ) : evenements.length === 0 ? (
            <div className="text-center text-gray-500">Aucun événement trouvé.</div>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {evenements.map((event) => (
                <div
                  key={event.id || event._id || Math.random()}
                  className="bg-[#232336] p-4 rounded border border-white/5 hover:border-[#ffe992]/30 transition group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[#ffe992]">{event.titre}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${event.visibilite === 'prive' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {event.visibilite === 'prive' ? 'Privé' : 'Public'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{event.lieu} • {new Date(event.dateDebut).toLocaleDateString()}</p>
                  
                  <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black text-xs px-3 py-1.5 rounded transition"
                      onClick={() => handleEdit(event)}
                    >
                      Modifier / Photos
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
