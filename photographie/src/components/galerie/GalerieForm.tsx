// Importations des modules nécessaires
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import galerieData from "../../config/galerie.json";
import { API_URL as BASE_API_URL } from "../../config/api";
import { useToast } from "../../components/Toast";
import { ArrowLeft, Upload } from "lucide-react";
import { tariffServiceV2 } from "../../services/tariffServiceV2";
import { TariffConfigV2 } from "../../types/tarifConfigV2";
import TariffSelectorV2 from "../admin/tarifs/TariffSelectorV2";
import { albumService, Album } from "../../services/albumService";

const API_URL = `${BASE_API_URL}/api/galerie`;

// --- TYPE PRINCIPAL DU FORMULAIRE ---
interface FormType {
  src: string;
  alt: string;
  titre: string;
  description: string;
  categorie: string;
  availableTariffIds: string[]; // Updated for new system
  album?: string;
}

// --- FORMULAIRE INITIAL ---
const formInitial: FormType = {
  src: "",
  alt: "",
  titre: "",
  description: "",
  categorie: "",
  availableTariffIds: [],
  album: "",
};

// Interface pour les photos
interface Photo {
  _id?: string;
  src: string;
  alt: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  availableTariffIds?: string[];
  album?: string;
}

export default function GalerieForm() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [form, setForm] = useState<FormType>(formInitial);
  const [tariffConfig, setTariffConfig] = useState<TariffConfigV2>({
    categories: [],
  });
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const [editId, setEditId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPhotos = await fetch(API_URL);
        const dataPhotos = await resPhotos.json();
        setPhotos(dataPhotos);

        const config = await tariffServiceV2.getTariffConfig();
        setTariffConfig(config);

        const albumsData = await albumService.getAlbums();
        setAlbums(albumsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        addToast("Erreur lors du chargement des données", "error");
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "prix" ? parseFloat(value || "0") : value,
    });
  };

  const handleSubmit = async () => {
    if (
      !form.src ||
      !form.titre ||
      !form.alt ||
      !form.description ||
      !form.categorie
    ) {
      addToast("Veuillez remplir tous les champs correctement.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      if (form.availableTariffIds.length === 0) {
        addToast(
          "Veuillez sélectionner au moins un tarif pour cette photo.",
          "warning"
        );
        setIsSubmitting(false);
        return;
      }

      const dataToSend = {
        src: form.src,
        alt: form.alt,
        titre: form.titre,
        description: form.description,
        categorie: form.categorie,
        availableTariffIds: form.availableTariffIds,
        album: form.album,
      };

      try {
        if (editId) {
          const res = await fetch(`${API_URL}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
          });
          if (!res.ok) {
            const err = await res.text();
            addToast("Erreur serveur: " + err, "error");
            setIsSubmitting(false);
            return;
          }
          const updated = await res.json();
          setPhotos(
            photos.map((photo) => (photo._id === editId ? updated : photo))
          );
          setEditId(null);
          addToast("Photo modifiée avec succès !", "success");
        } else {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
          });

          if (!res.ok) {
            const err = await res.text();
            addToast("Erreur lors de la création : " + err, "error");
            setIsSubmitting(false);
            return;
          }

          const photoCreee = await res.json();
          setPhotos((prevPhotos) => [...prevPhotos, photoCreee]);
          addToast("Photo ajoutée avec succès !", "success");
        }
      } catch (err) {
        addToast("Erreur réseau ou serveur: " + err, "error");
        setIsSubmitting(false);
        return;
      }

      setForm(formInitial);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      addToast("Une erreur inattendue est survenue.", "error");
      setIsSubmitting(false);
    }
  };

  const allCategories = [
    ...new Set([
      ...photos.map((p) => p.categorie),
      ...galerieData.map((p) => p.categorie),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?"))
      return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setPhotos((prev) => prev.filter((p) => p._id !== id));
      addToast("Photo supprimée avec succès", "success");

      // Si on supprimait la photo en cours d'édition
      if (editId === id) {
        setEditId(null);
        setForm(formInitial);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (photo: Photo) => {
    setEditId(photo._id || null);
    setForm({
      src: photo.src,
      alt: photo.alt,
      titre: photo.titre,
      description: photo.description,
      categorie: photo.categorie,
      availableTariffIds: photo.availableTariffIds || [],
      album: photo.album || "",
    });
    // Scroll to form top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Formulaire d'ajout/édition */}
      <div className="p-4 md:p-8 text-white bg-[#12121a]/50 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/5 shadow-xl">
        {/* En-tête du formulaire */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-white/5">
          <div>
            <h2 className="text-xl md:text-2xl font-serif italic text-[#ffe992] mb-1">
              {editId ? "Modifier la photo" : "Ajouter une photo"}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">
              {editId ? "Édition en cours" : "Nouvelle entrée"}
            </p>
          </div>
          <button
            onClick={() => navigate("/galerie")}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs md:text-sm font-medium border border-white/5"
          >
            <ArrowLeft size={16} /> Retour à la galerie
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Colonne Gauche : Upload et Infos */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                Image de l'œuvre
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      const signRes = await fetch(
                        `${BASE_API_URL}/api/upload-cloudinary/sign`,
                        { method: "GET", credentials: "include" }
                      );

                      if (!signRes.ok) throw new Error("Erreur signature");

                      const signData = await signRes.json();
                      const {
                        signature,
                        timestamp,
                        cloud_name,
                        api_key,
                        folder,
                      } = signData;

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

                      if (uploadData.secure_url) {
                        setForm((prev) => ({
                          ...prev,
                          src: uploadData.secure_url,
                        }));
                        addToast("Image uploadée avec succès !", "success");
                      } else {
                        addToast("L'upload a échoué", "error");
                      }
                    } catch (err) {
                      addToast("Erreur lors de l'envoi de l'image.", "error");
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                    form.src
                      ? "border-[#ffe992]/50 bg-black/40"
                      : "border-white/10 bg-white/5 hover:border-[#ffe992]/30 hover:bg-white/10"
                  }`}
                >
                  {form.src ? (
                    <img
                      src={form.src}
                      alt="Aperçu"
                      className="w-full h-full object-contain rounded-lg p-2"
                    />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#ffe992] transition-colors">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        Cliquez ou glissez une image ici
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Champs Texte */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                  Titre
                </label>
                <input
                  name="titre"
                  placeholder="Ex: L'Aube Dorée"
                  value={form.titre}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                    Catégorie
                  </label>
                  <input
                    list="categories"
                    name="categorie"
                    placeholder="Ex: Paysage"
                    value={form.categorie}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
                  />
                  <datalist id="categories">
                    {allCategories.map((cat, index) => (
                      <option key={index} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                    Alt Text
                  </label>
                  <input
                    name="alt"
                    placeholder="Description courte pour SEO"
                    value={form.alt}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Description détaillée de l'œuvre..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                Album (Optionnel)
              </label>
              <select
                name="album"
                value={form.album || ""}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
                className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffe992] focus:outline-none focus:ring-1 focus:ring-[#ffe992]/50 transition-all"
              >
                <option value="">Aucun album</option>
                {albums.map((album) => (
                  <option key={album._id} value={album._id}>
                    {album.titre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Colonne Droite : Tarifs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#ffe992] uppercase tracking-wider">
                Tarifs Applicables
              </label>
              <a
                href="/admin/tarifs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all"
              >
                Gérer les tarifs
              </a>
            </div>

            <div className="bg-[#0a0a10] rounded-lg md:rounded-xl border border-white/10 overflow-hidden h-[350px] md:h-[600px] overflow-y-auto custom-scrollbar p-3 md:p-4">
              <TariffSelectorV2
                config={tariffConfig}
                selectedIds={form.availableTariffIds}
                onToggle={(ids: string[], checked: boolean) => {
                  const newSelection = checked
                    ? [...new Set([...form.availableTariffIds, ...ids])]
                    : form.availableTariffIds.filter((id) => !ids.includes(id));
                  setForm({ ...form, availableTariffIds: newSelection });
                }}
              />
            </div>
          </div>
        </div>

        {/* Bouton de validation */}
        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !form.src ||
              !form.titre ||
              !form.alt ||
              !form.description ||
              !form.categorie ||
              form.availableTariffIds.length === 0
            }
            className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 shadow-lg ${
              isSubmitting ||
              !form.src ||
              !form.titre ||
              !form.alt ||
              !form.description ||
              !form.categorie ||
              form.availableTariffIds.length === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-[#ffe992] text-black hover:bg-white hover:shadow-[#ffe992]/20 transform hover:-translate-y-1"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <span className="loading loading-spinner loading-sm"></span>
                Traitement en cours...
              </div>
            ) : editId ? (
              "Enregistrer les modifications"
            ) : (
              "Ajouter à la galerie"
            )}
          </button>

          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm(formInitial);
              }}
              className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Messages d'erreur contextuels */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-red-400/80 font-mono">
          {!form.src && <span>* Image requise</span>}
          {!form.titre && <span>* Titre requis</span>}
          {form.availableTariffIds.length === 0 && (
            <span>* Au moins un tarif requis</span>
          )}
        </div>
      </div>

      {/* Liste des photos existantes */}
      <div className="bg-[#12121a]/50 backdrop-blur-md rounded-xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">
            Liste des photos ({photos.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className={`bg-[#1a1a20] rounded-lg border transition-all group overflow-hidden flex flex-col ${
                editId === photo._id
                  ? "border-[#ffe992] ring-1 ring-[#ffe992]"
                  : "border-white/5 hover:border-[#ffe992]/30"
              }`}
            >
              <div className="aspect-video relative overflow-hidden bg-black/40">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleEdit(photo)}
                      className="flex-1 bg-[#ffe992] text-black text-xs font-bold py-2 rounded hover:bg-white transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(photo._id)}
                      className="flex-1 bg-red-500/80 text-white text-xs font-bold py-2 rounded hover:bg-red-500 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4
                    className="font-bold text-white truncate pr-2"
                    title={photo.titre}
                  >
                    {photo.titre}
                  </h4>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 whitespace-nowrap">
                    {photo.categorie}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">
                  {photo.description}
                </p>
                {photo.album && (
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffe992]"></span>
                    Album:{" "}
                    {albums.find((a) => a._id === photo.album)?.titre ||
                      "Inconnu"}
                  </div>
                )}
              </div>
            </div>
          ))}

          {photos.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              Aucune photo dans la galerie. Utilisez le formulaire ci-dessus
              pour en ajouter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
