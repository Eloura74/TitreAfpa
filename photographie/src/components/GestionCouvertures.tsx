import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config/api";
import { Save, Loader2, Image as ImageIcon } from "lucide-react";

interface CoverImage {
  _id?: string;
  image: string;
  titre: string;
  description?: string;
  type:
    | "photographie"
    | "graphisme-galerie"
    | "graphisme-decouvrir"
    | "services"
    | "prestations"
    | "reportages"
    | "formations"
    | "background-site";
}

export default function GestionCouvertures() {
  const [covers, setCovers] = useState<{
    photographie: CoverImage | null;
    graphismeGalerie: CoverImage | null;
    graphismeDecouvrir: CoverImage | null;
    services: CoverImage | null;
    prestations: CoverImage | null;
    reportages: CoverImage | null;
    formations: CoverImage | null;
    backgroundSite: CoverImage | null;
  }>({
    photographie: null,
    graphismeGalerie: null,
    graphismeDecouvrir: null,
    services: null,
    prestations: null,
    reportages: null,
    formations: null,
    backgroundSite: null,
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "photographie"
    | "graphisme-galerie"
    | "graphisme-decouvrir"
    | "services"
    | "prestations"
    | "reportages"
    | "formations"
    | "background-site"
  >("photographie");

  const [formData, setFormData] = useState({
    image: "",
  });

  const fetchAllCovers = useCallback(async () => {
    try {
      const [
        photoRes,
        graphGalerieRes,
        graphDecouvrirRes,
        servicesRes,
        prestationsRes,
        reportagesRes,
        formationsRes,
        backgroundRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/covers/photographie`, { credentials: "include" }),
        fetch(`${API_URL}/api/covers/graphisme-galerie`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/covers/graphisme-decouvrir`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/covers/services`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/covers/prestations`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/covers/reportages`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/covers/formations`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/covers/background-site`, {
          credentials: "include",
        }),
      ]);

      const photoData =
        photoRes.ok || photoRes.status === 404
          ? photoRes.ok
            ? await photoRes.json()
            : null
          : null;
      const graphGalerieData =
        graphGalerieRes.ok || graphGalerieRes.status === 404
          ? graphGalerieRes.ok
            ? await graphGalerieRes.json()
            : null
          : null;
      const graphDecouvrirData =
        graphDecouvrirRes.ok || graphDecouvrirRes.status === 404
          ? graphDecouvrirRes.ok
            ? await graphDecouvrirRes.json()
            : null
          : null;
      const servicesData =
        servicesRes.ok || servicesRes.status === 404
          ? servicesRes.ok
            ? await servicesRes.json()
            : null
          : null;
      const prestationsData =
        prestationsRes.ok || prestationsRes.status === 404
          ? prestationsRes.ok
            ? await prestationsRes.json()
            : null
          : null;
      const reportagesData =
        reportagesRes.ok || reportagesRes.status === 404
          ? reportagesRes.ok
            ? await reportagesRes.json()
            : null
          : null;
      const formationsData =
        formationsRes.ok || formationsRes.status === 404
          ? formationsRes.ok
            ? await formationsRes.json()
            : null
          : null;
      const backgroundData =
        backgroundRes.ok || backgroundRes.status === 404
          ? backgroundRes.ok
            ? await backgroundRes.json()
            : null
          : null;

      setCovers({
        photographie: photoData,
        graphismeGalerie: graphGalerieData,
        graphismeDecouvrir: graphDecouvrirData,
        services: servicesData,
        prestations: prestationsData,
        reportages: reportagesData,
        formations: formationsData,
        backgroundSite: backgroundData,
      });

      const currentCover =
        activeTab === "photographie"
          ? photoData
          : activeTab === "graphisme-galerie"
            ? graphGalerieData
            : activeTab === "graphisme-decouvrir"
              ? graphDecouvrirData
              : activeTab === "services"
                ? servicesData
                : activeTab === "prestations"
                  ? prestationsData
                  : activeTab === "reportages"
                    ? reportagesData
                    : activeTab === "formations"
                      ? formationsData
                      : backgroundData;

      if (currentCover) {
        setFormData({
          image: currentCover.image || "",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAllCovers();
  }, [fetchAllCovers]);

  useEffect(() => {
    const currentCover =
      activeTab === "photographie"
        ? covers.photographie
        : activeTab === "graphisme-galerie"
          ? covers.graphismeGalerie
          : activeTab === "graphisme-decouvrir"
            ? covers.graphismeDecouvrir
            : activeTab === "services"
              ? covers.services
              : activeTab === "prestations"
                ? covers.prestations
                : activeTab === "reportages"
                  ? covers.reportages
                  : activeTab === "formations"
                    ? covers.formations
                    : covers.backgroundSite;

    if (currentCover) {
      setFormData({
        image: currentCover.image || "",
      });
    } else {
      setFormData({ image: "" });
    }
  }, [activeTab, covers]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setUploading(activeTab);

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
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Veuillez sélectionner une image");
      return;
    }

    try {
      const currentCover =
        activeTab === "photographie"
          ? covers.photographie
          : activeTab === "graphisme-galerie"
            ? covers.graphismeGalerie
            : activeTab === "graphisme-decouvrir"
              ? covers.graphismeDecouvrir
              : activeTab === "services"
                ? covers.services
                : activeTab === "prestations"
                  ? covers.prestations
                  : activeTab === "reportages"
                    ? covers.reportages
                    : activeTab === "formations"
                      ? covers.formations
                      : covers.backgroundSite;

      const url = currentCover?._id
        ? `${API_URL}/api/covers/${activeTab}/${currentCover._id}`
        : `${API_URL}/api/covers/${activeTab}`;

      const response = await fetch(url, {
        method: currentCover?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          image: formData.image,
          titre: tabs.find((t) => t.id === activeTab)?.label || "",
          type: activeTab,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'opération");
      }

      alert(
        currentCover?._id
          ? "Image de couverture modifiée avec succès !"
          : "Image de couverture ajoutée avec succès !",
      );
      fetchAllCovers();
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

  const tabs = [
    {
      id: "photographie" as const,
      label: "Galerie Photo",
      description: "Card 'Galerie Photo' sur la page Photographie",
    },
    {
      id: "graphisme-galerie" as const,
      label: "Galerie Graphique",
      description: "Card 'Galerie Graphique' sur la page Graphisme",
    },
    {
      id: "graphisme-decouvrir" as const,
      label: "Découvrir le Graphisme",
      description: "Card 'Découvrir le Graphisme' sur la page Graphisme",
    },
    {
      id: "services" as const,
      label: "Services",
      description: "Page Services (navigation)",
    },
    {
      id: "prestations" as const,
      label: "Prestations",
      description: "Page Prestations (liste des services)",
    },
    {
      id: "reportages" as const,
      label: "Reportages",
      description: "Page Reportages (galeries)",
    },
    {
      id: "formations" as const,
      label: "Formations",
      description: "Page Formations (lien externe)",
    },
    {
      id: "background-site" as const,
      label: "Background du site",
      description: "Image de fond globale du site (toutes les pages)",
    },
  ];

  const currentCover =
    activeTab === "photographie"
      ? covers.photographie
      : activeTab === "graphisme-galerie"
        ? covers.graphismeGalerie
        : activeTab === "graphisme-decouvrir"
          ? covers.graphismeDecouvrir
          : activeTab === "services"
            ? covers.services
            : activeTab === "prestations"
              ? covers.prestations
              : activeTab === "reportages"
                ? covers.reportages
                : activeTab === "formations"
                  ? covers.formations
                  : covers.backgroundSite;

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
          <strong>Note :</strong> Gérez ici toutes les images de couverture des
          cards affichées sur les pages principales du site. Ces images seront
          visibles sur les pages Photographie et Graphisme.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#ffe992] text-black"
                : "bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description du tab actif */}
      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          {tabs.find((t) => t.id === activeTab)?.description}
        </p>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1a20] rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-[#ffe992] mb-4">
            {currentCover ? "Modifier l'image" : "Ajouter une image"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={uploading !== null}
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
              disabled={uploading !== null || !formData.image}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ffe992] text-black font-bold rounded-lg hover:bg-[#f4d677] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading !== null ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {currentCover ? "Modifier" : "Ajouter"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview de l'image actuelle */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#ffe992]">Image actuelle</h3>

          {currentCover ? (
            <div className="bg-[#1a1a20] rounded-xl border border-white/10 overflow-hidden">
              <div className="relative h-80">
                <img
                  src={getImageUrl(currentCover.image)}
                  alt={tabs.find((t) => t.id === activeTab)?.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#ffe992] text-black px-3 py-1 rounded-full text-xs font-bold">
                  En ligne
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a20] rounded-xl border border-white/10 p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Aucune image de couverture définie
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Utilisez le formulaire pour en ajouter une
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
