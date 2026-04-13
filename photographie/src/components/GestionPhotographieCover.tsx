import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import { Save, Loader2 } from "lucide-react";

interface CoverImage {
  _id?: string;
  image: string;
  titre: string;
  description?: string;
}

export default function GestionPhotographieCover() {
  const [cover, setCover] = useState<CoverImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchCover();
  }, []);

  const fetchCover = async () => {
    try {
      const response = await fetch(`${API_URL}/api/photographie-cover`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCover(data);
          setFormData({
            titre: data.titre || "",
            description: data.description || "",
            image: data.image || "",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
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

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("signature", signature);
      formDataUpload.append("timestamp", timestamp.toString());
      formDataUpload.append("api_key", api_key);
      formDataUpload.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload vers Cloudinary");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url;

      setFormData((prev) => ({ ...prev, image: imageUrl }));

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
      const url = cover?._id
        ? `${API_URL}/api/photographie-cover/${cover._id}`
        : `${API_URL}/api/photographie-cover`;

      const response = await fetch(url, {
        method: cover?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'opération");
      }

      alert(
        cover?._id
          ? "Image de couverture modifiée avec succès !"
          : "Image de couverture ajoutée avec succès !",
      );
      fetchCover();
    } catch (error: unknown) {
      console.error("Erreur:", error);
      const message =
        error instanceof Error ? error.message : "Erreur lors de l'opération";
      alert(message);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
    return image;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-[#ffe992] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#ffe992]/10 border border-[#ffe992]/30 rounded-lg p-4">
        <p className="text-sm text-[#ffe992]">
          <strong>Note :</strong> Cette image sera affichée comme couverture de
          la card "Galerie Photo" sur la page d'accueil et dans la section
          Photographie.
        </p>
      </div>

      <div className="bg-[#1a1a20] rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-[#ffe992] mb-4">
          {cover
            ? "Modifier l'image de couverture"
            : "Ajouter une image de couverture"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Ex: Galerie Photo"
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
              placeholder="Description de la galerie..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image de couverture * (max 10MB)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#ffe992] file:text-black file:cursor-pointer hover:file:bg-[#f4d677]"
                disabled={uploading}
              />
              {formData.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={getImageUrl(formData.image)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !formData.titre || !formData.image}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ffe992] text-black font-bold rounded-lg hover:bg-[#f4d677] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Save size={20} />
                {cover ? "Modifier" : "Ajouter"}
              </>
            )}
          </button>
        </form>
      </div>

      {cover && (
        <div className="bg-[#1a1a20] rounded-xl border border-white/10 overflow-hidden">
          <div className="relative h-64">
            <img
              src={getImageUrl(cover.image)}
              alt={cover.titre}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-[#ffe992] text-black px-3 py-1 rounded-full text-xs font-bold">
              Image actuelle
            </div>
          </div>

          <div className="p-4">
            <h4 className="text-lg font-bold text-[#ffe992] mb-2">
              {cover.titre}
            </h4>
            {cover.description && (
              <p className="text-sm text-gray-400">{cover.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
