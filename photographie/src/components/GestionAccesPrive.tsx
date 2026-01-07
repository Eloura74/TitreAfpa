import { useState, useEffect } from "react";
import axios from "axios";
import { Evenement } from "../types/evenement";
import { Tarif } from "../types/tarif";
import { API_URL as BASE_API_URL } from "../config/api";
import PrivateAccessForm from "./admin/acces-prive/PrivateAccessForm";
import PrivateAccessList from "./admin/acces-prive/PrivateAccessList";
import { compressImage } from "./admin/acces-prive/PhotoUploader";
import { Check, X, Edit } from "lucide-react";

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

  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
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
      console.error("Erreur création client:", err);
      const resData = err.response?.data;
      let errorMsg = "Erreur lors de la création du client.";

      if (resData?.errors && Array.isArray(resData.errors)) {
        // Cas des erreurs de validation (express-validator)
        errorMsg = resData.errors.map((e: any) => e.msg).join(", ");
      } else if (resData?.error) {
        // Cas d'une erreur unique (ex: email existant)
        errorMsg = resData.error;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
        const formData = new FormData();
        formData.append("image", file);

        const resUpload = await axios.post(
          `${BASE_API_URL}/api/upload-cloudinary`,
          formData
        );
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
        try {
          const compressedFile = await compressImage(file);
          const formData = new FormData();
          formData.append("image", compressedFile);

          const resUpload = await axios.post(
            `${BASE_API_URL}/api/upload-cloudinary`,
            formData
          );
          const imageUrl = resUpload.data.url;

          if (!imageUrl) throw new Error("Erreur upload image");

          const resPhoto = await axios.post(
            `${BASE_API_URL}/api/galerie`,
            {
              src: imageUrl,
              titre: file.name,
              categorie: "EvenementPrive",
              tarifs: tarifsToApply,
              alt: `Photo privée ${form.titre}`,
              description: `Photo privée pour ${form.titre}`,
            },
            {
              withCredentials: true,
            }
          );

          if (resPhoto.data && resPhoto.data._id) {
            uploadedPhotoIds.push(resPhoto.data._id);
          }
        } catch (err) {
          console.error(`Erreur upload fichier ${file.name}`, err);
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
      const { id, _id, photos, ...dataToSend } = form as any;
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

      if (filesToUpload.length > 0 && targetId) {
        setSuccess(
          (prev) =>
            `${prev} Upload de ${filesToUpload.length} photos en cours...`
        );

        const uploadedPhotoIds: string[] = [];
        const tarifsToApply = selectedTariffs
          .map((id) => {
            const t = tarifs.find(
              (tarif) => tarif.id === id || tarif._id === id
            );
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

        for (const file of filesToUpload) {
          try {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append("image", compressedFile);

            const resUpload = await axios.post(
              `${BASE_API_URL}/api/upload-cloudinary`,
              formData
            );
            const imageUrl = resUpload.data.url;

            if (imageUrl) {
              const resPhoto = await axios.post(
                `${BASE_API_URL}/api/galerie`,
                {
                  src: imageUrl,
                  titre: file.name,
                  categorie: "EvenementPrive",
                  tarifs: tarifsToApply,
                  alt: `Photo privée ${form.titre}`,
                  description: `Photo privée pour ${form.titre}`,
                },
                {
                  withCredentials: true,
                }
              );

              if (resPhoto.data && resPhoto.data._id) {
                uploadedPhotoIds.push(resPhoto.data._id);
              }
            }
          } catch (err) {
            console.error(`Erreur upload fichier ${file.name}`, err);
          }
        }

        if (uploadedPhotoIds.length > 0) {
          await axios.post(
            `${API_URL}/${targetId}/photos`,
            { photoIds: uploadedPhotoIds },
            {
              withCredentials: true,
            }
          );
          setSuccess(
            (prev) => `${prev} ${uploadedPhotoIds.length} photos ajoutées !`
          );
        }
      }

      loadEvenements();
      resetForm();
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
      visibilite: "prive",
      clientEmail: evt.clientEmail || "",
    });
    setImagePreview(evt.image || "");
    setEditId(evt.id || null);
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
      setEvenements(evenements.filter((e) => e.id !== id));
      resetForm();
      setSuccess("Accès privé supprimé.");
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message || "Erreur lors de la suppression."
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
        (p: any) => (p._id || p.id) !== photoId
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
                      }
                    );
                    const updatedPhotos = form.photos?.map((p: any) =>
                      (p._id || p.id) === (editingPhoto._id || editingPhoto.id)
                        ? editingPhoto
                        : p
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
