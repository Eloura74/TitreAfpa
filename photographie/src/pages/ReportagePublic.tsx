import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../config/api";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { SelectionFormatModalV2 } from "../components/galerie/SelectionFormatModalV2";
import { usePanier } from "../store/panierContext";
import { useToast } from "../components/Toast";
import {
  Calendar,
  Image as ImageIcon,
  X,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  MapPin,
} from "lucide-react";
import { TariffConfigV2 } from "../types/tarifConfigV2";
import { tariffServiceV2 } from "../services/tariffServiceV2";

interface PhotoOriginale {
  _id: string;
  nom: string;
  miniature?: string;
  fichierR2: string;
  taille: number;
  format: string;
}

interface Reportage {
  _id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  image?: string;
  lieu?: string;
  slug?: string;
  isPublic: boolean;
  availableTariffIds: string[];
  photosOriginales: PhotoOriginale[];
}

export default function ReportagePublic() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [reportage, setReportage] = useState<Reportage | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tariffConfig, setTariffConfig] = useState<TariffConfigV2 | null>(null);

  const { ajouterArticle } = usePanier();
  const { addToast } = useToast();

  useEffect(() => {
    loadReportage();
    loadTariffConfig();
  }, [slug]);

  const loadTariffConfig = async () => {
    const config = await tariffServiceV2.getTariffConfig();
    setTariffConfig(config);
  };

  const loadReportage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/ecrin/info/${slug}`);

      if (res.data.success && res.data.acces) {
        const data = res.data.acces;

        if (!data.isPublic) {
          addToast("Ce reportage n'est pas public", "error");
          navigate("/reportages");
          return;
        }

        setReportage(data);
        document.title = `${data.titre} | Fabien Licata`;
      } else {
        addToast("Reportage introuvable", "error");
        navigate("/reportages");
      }
    } catch (error) {
      console.error("Erreur chargement reportage:", error);
      addToast("Erreur lors du chargement du reportage", "error");
      navigate("/reportages");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    addToast(
      "Le téléchargement direct est désactivé. Utilisez le panier pour commander.",
      "info",
    );
  };

  const handleAddToCart = useCallback(
    (photo: PhotoOriginale) => {
      if (
        !reportage?.availableTariffIds ||
        reportage.availableTariffIds.length === 0
      ) {
        addToast("Aucun format disponible pour ce reportage", "error");
        return;
      }

      const photoWithTariffs = {
        ...photo,
        _id: photo._id,
        titre: photo.nom,
        src: photo.miniature || photo.fichierR2,
        availableTariffIds: reportage.availableTariffIds,
      };

      setSelectedPhoto(photoWithTariffs);
      setModalVisible(true);
    },
    [reportage, addToast],
  );

  const handleSelectFormat = (tarif: any) => {
    if (!selectedPhoto) return;

    const supportValue = tarif.support || "Standard";

    ajouterArticle({
      id: crypto.randomUUID(),
      photoId: selectedPhoto._id,
      nom: selectedPhoto.nom,
      prix: tarif.prix,
      quantite: tarif.quantity || 1,
      image: selectedPhoto.src,
      format: tarif.format,
      support: supportValue,
    });

    addToast(
      `${selectedPhoto.nom} (${tarif.format}) ajouté au panier`,
      "success",
    );
    setModalVisible(false);
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a10]">
        <div className="w-12 h-12 border-4 border-[#ffe992]/20 border-t-[#ffe992] rounded-full animate-spin" />
      </div>
    );
  }

  if (!reportage) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a10]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        {/* En-tête du reportage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate("/reportages")}
            className="flex items-center gap-2 text-gray-400 hover:text-[#ffe992] transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Retour aux reportages</span>
          </button>

          {reportage.image && (
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
              <img
                src={reportage.image}
                alt={reportage.titre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-5xl font-playfair-sc text-white mb-4">
                  {reportage.titre}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#ffe992]" />
                    <span>
                      {formatDate(reportage.dateDebut)} -{" "}
                      {formatDate(reportage.dateFin)}
                    </span>
                  </div>
                  {reportage.lieu && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#ffe992]" />
                      <span>{reportage.lieu}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#ffe992]" />
                    <span>{reportage.photosOriginales.length} photos</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportage.description && (
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              {reportage.description}
            </p>
          )}
        </motion.div>

        {/* Galerie de photos */}
        {reportage.photosOriginales.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
            <ImageIcon
              className="mx-auto text-gray-500 mb-4"
              size={48}
              opacity={0.5}
            />
            <p className="text-gray-400">
              Aucune photo disponible pour ce reportage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reportage.photosOriginales.map((photo, index) => (
              <motion.div
                key={photo._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40 cursor-pointer"
                onClick={() => setLightboxIndex(index)}
                onContextMenu={preventRightClick}
              >
                <img
                  src={photo.miniature || photo.fichierR2}
                  alt={photo.nom}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onContextMenu={preventRightClick}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium mb-2 line-clamp-1">
                      {photo.nom}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(photo);
                      }}
                      className="w-full bg-[#ffe992] text-black text-xs font-bold py-2 px-3 rounded hover:bg-[#d6c487] transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      Commander
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal de sélection de format */}
      <AnimatePresence>
        {modalVisible && selectedPhoto && tariffConfig && (
          <SelectionFormatModalV2
            photo={selectedPhoto}
            onSelect={handleSelectFormat}
            onClose={() => {
              setModalVisible(false);
              setSelectedPhoto(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all z-50"
            >
              <X size={32} />
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50"
              >
                <ArrowLeft size={40} />
              </button>
            )}

            <motion.img
              key={reportage.photosOriginales[lightboxIndex]._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={
                reportage.photosOriginales[lightboxIndex].miniature ||
                reportage.photosOriginales[lightboxIndex].fichierR2
              }
              alt={reportage.photosOriginales[lightboxIndex].nom}
              className="max-w-full max-h-[90vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={preventRightClick}
              draggable={false}
            />

            {lightboxIndex < reportage.photosOriginales.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50"
              >
                <ArrowRight size={40} />
              </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent text-center pointer-events-none flex flex-col items-center gap-4">
              <div>
                <h3 className="text-xl font-serif text-[#ffe992] mb-1">
                  {reportage.photosOriginales[lightboxIndex].nom}
                </h3>
                <p className="text-sm text-gray-400">
                  {lightboxIndex + 1} / {reportage.photosOriginales.length}
                </p>
              </div>

              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(reportage.photosOriginales[lightboxIndex]);
                  }}
                  className="px-6 py-2.5 bg-[#ffe992] hover:bg-[#f4d677] text-black text-sm font-bold transition-all uppercase tracking-widest rounded-full shadow-[0_4px_12px_rgba(255,233,146,0.4)] hover:shadow-[0_6px_16px_rgba(255,233,146,0.6)] flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Commander cette photo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
