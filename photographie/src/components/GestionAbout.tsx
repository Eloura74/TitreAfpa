import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { getAboutData, updateAboutData } from "../services/aboutService";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config/api";

export default function GestionAbout() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<any>({
    image: "",
    jobTitle: "",
    name: "",
    introduction: "",
    parcours: { title: "", content: "" },
    expertise: { title: "", content: "" },
    studio: { title: "", content: "" },
    quote: "",
    tirages: { title: "", content: "" },
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAboutData();
      setFormData({
        image: data.image || "",
        jobTitle: data.jobTitle || "",
        name: data.name || "",
        introduction: data.introduction || "",
        parcours: {
          title: data.parcours?.title || "Mon Parcours",
          content: data.parcours?.content || "",
        },
        expertise: {
          title: data.expertise?.title || "Polyvalence & Expertise",
          content: data.expertise?.content || "",
        },
        studio: {
          title: data.studio?.title || "Studio Mobile",
          content: data.studio?.content || "",
        },
        quote: data.quote || "",
        tirages: {
          title: data.tirages?.title || "Tirages d'Art",
          content: data.tirages?.content || "",
        },
      });
    } catch (error) {
      console.error("Erreur chargement about data:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des données.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string,
  ) => {
    if (section) {
      setFormData((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [e.target.name]: e.target.value,
        },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setUploading(true);
    try {
      const signRes = await fetch(`${API_URL}/api/upload-cloudinary/sign`, {
        method: "GET",
        credentials: "include",
      });

      if (!signRes.ok)
        throw new Error("Erreur lors de la signature de l'upload.");

      const signData = await signRes.json();
      const { signature, timestamp, cloud_name, api_key, folder } = signData;

      const formDataUpload = new FormData();
      formDataUpload.append("file", imageFile);
      formDataUpload.append("signature", signature);
      formDataUpload.append("timestamp", timestamp.toString());
      formDataUpload.append("api_key", api_key);
      formDataUpload.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: "POST", body: formDataUpload },
      );

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.secure_url;

      if (!imageUrl) throw new Error("Erreur upload image");

      // Mettre à jour formData avec la nouvelle URL
      const updatedFormData = { ...formData, image: imageUrl };
      setFormData(updatedFormData);

      // Sauvegarder automatiquement dans la base de données
      await updateAboutData(updatedFormData);

      setImagePreview("");
      setImageFile(null);
      setMessage({
        type: "success",
        text: "Image uploadée et sauvegardée avec succès ! La page À Propos a été mise à jour.",
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Erreur upload:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de l'upload de l'image.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!user.isAdmin) throw new Error("Non autorisé");
      await updateAboutData(formData);
      setMessage({
        type: "success",
        text: "Page À Propos mise à jour avec succès !",
      });
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-[#ffe992]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ffe992]">
          Éditer la page À Propos
        </h2>
        <button
          onClick={fetchData}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          title="Rafraîchir les données"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section Principale */}
        <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h3 className="text-lg font-medium text-[#ffe992] border-b border-white/10 pb-2 mb-4">
            Informations Principales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nom Complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Titre du poste
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Photo de profil
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zone d'upload */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 bg-black/20 hover:bg-black/30 hover:border-[#ffe992]/50 transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-3">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-full border-2 border-[#ffe992]"
                      />
                    ) : formData.image ? (
                      <img
                        src={formData.image}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <ImageIcon size={48} className="text-gray-500" />
                    )}
                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        {imagePreview
                          ? "Nouvelle image sélectionnée"
                          : "Cliquer pour choisir une image"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        JPG, PNG, WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {imageFile && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    className="mt-3 w-full bg-[#ffe992] hover:bg-[#ffe992]/90 text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Uploader l'image
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* URL manuelle (optionnel) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Ou entrer une URL manuellement
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-600 mt-2">
                  L'image actuelle sera utilisée si aucune nouvelle image n'est
                  uploadée.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Introduction (En-tête)
            </label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none resize-none"
            />
          </div>
        </div>

        {/* Sections Dynamiques */}
        <div className="grid grid-cols-1 gap-6">
          {/* Parcours */}
          <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-medium text-[#ffe992] border-b border-white/10 pb-2 mb-4">
              Parcours
            </h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Titre de la section
              </label>
              <input
                type="text"
                name="title"
                value={formData.parcours.title}
                onChange={(e) => handleChange(e, "parcours")}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-3 focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Contenu
              </label>
              <textarea
                name="content"
                value={formData.parcours.content}
                onChange={(e) => handleChange(e, "parcours")}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
          </div>

          {/* Expertise */}
          <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-medium text-[#ffe992] border-b border-white/10 pb-2 mb-4">
              Expertise
            </h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Titre de la section
              </label>
              <input
                type="text"
                name="title"
                value={formData.expertise.title}
                onChange={(e) => handleChange(e, "expertise")}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-3 focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Contenu
              </label>
              <textarea
                name="content"
                value={formData.expertise.content}
                onChange={(e) => handleChange(e, "expertise")}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
          </div>

          {/* Studio */}
          <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-medium text-[#ffe992] border-b border-white/10 pb-2 mb-4">
              Studio
            </h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Titre de la section
              </label>
              <input
                type="text"
                name="title"
                value={formData.studio.title}
                onChange={(e) => handleChange(e, "studio")}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-3 focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Contenu
              </label>
              <textarea
                name="content"
                value={formData.studio.content}
                onChange={(e) => handleChange(e, "studio")}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
          </div>

          {/* Citation */}
          <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-medium text-[#ffe992] border-b border-white/10 pb-2 mb-4">
              Citation
            </h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Contenu de la citation
              </label>
              <textarea
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none italic"
              />
            </div>
          </div>

          {/* Tirages */}
          <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-medium text-[#ffe992] border-b border-white/10 pb-2 mb-4">
              Tirages
            </h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Titre de la section
              </label>
              <input
                type="text"
                name="title"
                value={formData.tirages.title}
                onChange={(e) => handleChange(e, "tirages")}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mb-3 focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Contenu
              </label>
              <textarea
                name="content"
                value={formData.tirages.content}
                onChange={(e) => handleChange(e, "tirages")}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#ffe992] transition-colors outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-bold text-black transition-all
              ${
                saving
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#ffe992] hover:bg-[#ffe992]/90 hover:shadow-lg hover:shadow-yellow-400/20"
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={20} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
