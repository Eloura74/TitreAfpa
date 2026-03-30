import { useState, useEffect, useMemo } from "react";
import { API_URL } from "../config/api";
import {
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShowcaseImage {
  _id: string;
  image: string;
  titre: string;
  description?: string;
  ordre: number;
}

export default function GestionGraphismeShowcase() {
  const [showcases, setShowcases] = useState<ShowcaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    ordre: 1,
    image: "",
  });

  useEffect(() => {
    fetchShowcases();
  }, []);

  const fetchShowcases = async () => {
    try {
      const response = await fetch(`${API_URL}/api/graphisme-showcase`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setShowcases(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, ordre: number) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setUploading(true);

    try {
      const signResponse = await fetch(
        `${API_URL}/api/upload-cloudinary/sign`,
        {
          credentials: "include",
        },
      );

      if (!signResponse.ok) {
        throw new Error("Erreur lors de la récupération de la signature");
      }

      const signData = await signResponse.json();
      const { signature, timestamp, cloud_name, api_key, folder } = signData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", api_key);
      formData.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload vers Cloudinary");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url;

      setFormData((prev) => ({ ...prev, image: imageUrl, ordre }));

      alert("Image uploadée avec succès !");
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || !formData.image) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/api/graphisme-showcase/${editingId}`
        : `${API_URL}/api/graphisme-showcase`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'opération");
      }

      const result = await response.json();
      const successMessage =
        result.message ||
        (editingId
          ? "Image modifiée avec succès !"
          : "Image ajoutée avec succès !");

      alert(successMessage);
      resetForm();
      fetchShowcases();
    } catch (error: unknown) {
      console.error("Erreur:", error);
      const message =
        error instanceof Error ? error.message : "Erreur lors de l'opération";
      alert(message);
    }
  };

  const handleEdit = (showcase: ShowcaseImage) => {
    setEditingId(showcase._id);
    setFormData({
      titre: showcase.titre,
      description: showcase.description || "",
      ordre: showcase.ordre,
      image: showcase.image,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      const response = await fetch(`${API_URL}/api/graphisme-showcase/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      alert("Image supprimée avec succès !");
      fetchShowcases();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({ titre: "", description: "", ordre: 1, image: "" });
    setEditingId(null);
  };

  const getImageUrl = (image: string) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
    return image;
  };

  const availableOrdre = useMemo(() => {
    return showcases.length < 2
      ? [1, 2].filter((n) => !showcases.some((s) => s.ordre === n))
      : [];
  }, [showcases]);

  useEffect(() => {
    if (!editingId && availableOrdre.length > 0) {
      const currentOrdreIsAvailable = availableOrdre.includes(formData.ordre);
      if (!currentOrdreIsAvailable) {
        setFormData((prev) => ({ ...prev, ordre: availableOrdre[0] }));
      }
    }
  }, [showcases, editingId, availableOrdre, formData.ordre]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-[#ffe992] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#ffe992]/10 border border-[#ffe992]/30 rounded-lg p-4">
        <p className="text-sm text-[#ffe992]">
          <strong>Note :</strong> Vous pouvez gérer maximum 2 images de
          présentation du graphisme. Ces images seront affichées sur la page
          "Découvrir le Graphisme".
        </p>
      </div>

      {showcases.length < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a20] rounded-xl border border-white/10 p-6"
        >
          <h3 className="text-xl font-bold text-[#ffe992] mb-4">
            {editingId ? "Modifier l'image" : "Ajouter une nouvelle image"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position *
              </label>
              <select
                value={formData.ordre}
                onChange={(e) =>
                  setFormData({ ...formData, ordre: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-[#ffe992] focus:outline-none"
                disabled={editingId !== null}
              >
                {editingId ? (
                  <option value={formData.ordre}>
                    Position {formData.ordre}
                  </option>
                ) : (
                  [1, 2].map((n) => {
                    const isOccupied = showcases.some((s) => s.ordre === n);
                    return (
                      <option key={n} value={n}>
                        Position {n}{" "}
                        {isOccupied
                          ? "(Occupée - sera remplacée)"
                          : "(Disponible)"}
                      </option>
                    );
                  })
                )}
              </select>
              {showcases.length > 0 && !editingId && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 Si vous sélectionnez une position occupée, l'image
                  existante sera remplacée
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-[#ffe992] focus:outline-none"
                placeholder="Ex: La créativité visuelle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-[#ffe992] focus:outline-none resize-none"
                rows={3}
                placeholder="Description de l'image..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image * (max 10MB)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, formData.ordre);
                  }}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffe992] file:text-black file:cursor-pointer hover:file:bg-[#f4d677]"
                  disabled={uploading}
                />
                {formData.image && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={getImageUrl(formData.image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || !formData.titre || !formData.image}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ffe992] text-black font-bold rounded-lg hover:bg-[#f4d677] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {editingId ? "Modifier" : "Ajouter"}
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#ffe992]">
          Images actuelles ({showcases.length}/2)
        </h3>

        {showcases.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a20] rounded-xl border border-white/10">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Aucune image de présentation pour le moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {showcases.map((showcase) => (
                <motion.div
                  key={showcase._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1a1a20] rounded-xl border border-white/10 overflow-hidden hover:border-[#ffe992]/50 transition-all"
                >
                  <div className="relative h-48">
                    <img
                      src={getImageUrl(showcase.image)}
                      alt={showcase.titre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#ffe992] text-black px-3 py-1 rounded-full text-xs font-bold">
                      Position {showcase.ordre}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-lg font-bold text-[#ffe992] mb-2">
                      {showcase.titre}
                    </h4>
                    {showcase.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {showcase.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(showcase)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                      >
                        <Edit2 size={16} />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(showcase._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
