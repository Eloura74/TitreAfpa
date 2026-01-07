import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import axios from "axios";
import { API_URL } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  X,
  ShoppingBag,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import { usePanier } from "../store/panierContext";

// Types
interface Tarif {
  _id?: string;
  id?: string;
  format: string;
  support: string;
  prix: number;
}

interface Photo {
  _id: string;
  src: string;
  titre?: string;
  tarifs?: Tarif[];
}

interface Evenement {
  _id: string;
  titre: string;
  description?: string;
  dateDebut: string;
  photos: Photo[];
}

export default function ClientEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  // Configuration de la commande
  const [config, setConfig] = useState<{
    [photoId: string]: {
      tarifId: string;
      quantite: number;
    };
  }>({});

  useEffect(() => {
    const fetchEvenement = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/acces-prive/${id}`, {
          withCredentials: true,
        });
        setEvenement(res.data);
      } catch (error) {
        console.error("Erreur chargement événement", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvenement();
  }, [id]);

  const toggleSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSelection = prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId];

      // Initialiser la config par défaut si nouvelle sélection
      if (!prev.includes(photoId) && evenement) {
        const photo = evenement.photos.find((p) => p._id === photoId);
        if (photo && photo.tarifs && photo.tarifs.length > 0) {
          setConfig((curr) => ({
            ...curr,
            [photoId]: {
              tarifId: (photo.tarifs![0]._id || photo.tarifs![0].id) as string,
              quantite: 1,
            },
          }));
        }
      }
      return newSelection;
    });
  };

  const handleAddToQuote = () => {
    let addedCount = 0;
    selectedPhotos.forEach((photoId) => {
      const photo = evenement?.photos.find((p) => p._id === photoId);
      const conf = config[photoId];
      // Default to first tariff if not configured
      const defaultTarif = photo?.tarifs?.[0];
      const targetTarifId =
        conf?.tarifId || defaultTarif?._id || defaultTarif?.id;

      const tarif = photo?.tarifs?.find(
        (t) => t._id === targetTarifId || t.id === targetTarifId
      );

      if (!photo || !tarif) return;

      ajouterArticle({
        id: `${photo._id}-${tarif._id || tarif.id}`,
        nom: photo.titre || "Photo",
        prix: tarif.prix,
        quantite: conf?.quantite || 1,
        image: photo.src,
        photoId: photo._id,
        format: tarif.format,
        support: tarif.support,
      });
      addedCount++;
    });

    if (addedCount > 0) {
      // alert("Vos photos ont été ajoutées au panier !");
      setShowConfig(false);
      setSelectedPhotos([]);
      navigate("/panier");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#ffe992]"></span>
      </div>
    );

  if (!evenement)
    return (
      <div className="min-h-screen bg-[#0a0a10] flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-2xl font-serif text-[#ffe992]">
          Événement introuvable
        </h1>
        <button
          onClick={() => navigate("/mon-compte")}
          className="text-sm underline hover:text-[#ffe992]"
        >
          Retour à mon compte
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col selection:bg-[#ffe992]/30">
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="flex-1 container mx-auto px-4 py-8 pt-48 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 relative">
          <button
            onClick={() => navigate("/mon-compte")}
            className="absolute left-0 top-2 p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white"
            title="Retour"
          >
            <ArrowLeft />
          </button>

          <h1 className="hero-title !mb-2 !ml-0 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center">
            <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
              {evenement.titre}
            </span>
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 font-light tracking-wide uppercase">
            <span>{new Date(evenement.dateDebut).toLocaleDateString()}</span>
            <span className="w-1 h-1 bg-[#ffe992] rounded-full" />
            <span>{evenement.photos.length} photos</span>
          </div>
        </div>

        {/* Grid Photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-32">
          {evenement.photos.map((photo) => (
            <motion.div
              key={photo._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative aspect-[2/3] group cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ${
                selectedPhotos.includes(photo._id)
                  ? "border-[#ffe992] shadow-[0_0_20px_rgba(255,233,146,0.2)]"
                  : "border-white/10 hover:border-[#ffe992]/50"
              }`}
              onClick={() => toggleSelection(photo._id)}
            >
              <img
                src={photo.src}
                alt={photo.titre}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay Selection */}
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${
                  selectedPhotos.includes(photo._id)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedPhotos.includes(photo._id)
                      ? "bg-[#ffe992] text-black scale-100 shadow-lg"
                      : "bg-white/20 text-white backdrop-blur-sm scale-90 hover:bg-white/30"
                  }`}
                >
                  <Check size={24} />
                </div>
              </div>

              {/* Prix à partir de */}
              {photo.tarifs && photo.tarifs.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-center text-gray-300 font-light tracking-wide uppercase">
                    À partir de{" "}
                    <span className="text-[#ffe992] font-bold text-sm ml-1">
                      {Math.min(...photo.tarifs.map((t) => t.prix))}€
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedPhotos.length > 0 && !showConfig && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-[#12121a]/90 backdrop-blur-xl border border-white/10 rounded-full p-2 z-40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between pr-2 pl-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <ImageIcon className="text-[#ffe992]" size={24} />
                <span className="absolute -top-2 -right-2 bg-[#ffe992] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {selectedPhotos.length}
                </span>
              </div>
              <span className="text-sm font-medium text-white hidden sm:inline">
                <span className="text-gray-400 font-light">Sélection :</span>{" "}
                {selectedPhotos.length} photo
                {selectedPhotos.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPhotos([])}
                className="px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowConfig(true)}
                className="px-6 py-2.5 bg-[#ffe992] hover:bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,233,146,0.2)] flex items-center gap-2"
              >
                Commander <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12121a] w-full max-w-5xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div>
                  <h3 className="text-2xl font-serif text-[#ffe992]">
                    Configuration
                  </h3>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                    Personnalisez vos tirages
                  </p>
                </div>
                <button
                  onClick={() => setShowConfig(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0a10]">
                {selectedPhotos.map((photoId) => {
                  const photo = evenement?.photos.find(
                    (p) => p._id === photoId
                  );
                  if (!photo) return null;

                  return (
                    <div
                      key={photoId}
                      className="flex flex-col sm:flex-row gap-6 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#ffe992]/20 transition-colors"
                    >
                      <div className="w-full sm:w-32 aspect-[2/3] rounded-lg overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={photo.src}
                          alt={photo.titre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-white text-lg">
                            {photo.titre || "Sans titre"}
                          </h4>
                          <button
                            onClick={() => toggleSelection(photoId)}
                            className="text-xs text-red-400 hover:text-red-300 underline"
                          >
                            Retirer
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs text-[#ffe992] uppercase tracking-wider font-bold">
                              Format & Support
                            </label>
                            <div className="relative">
                              <select
                                value={config[photoId]?.tarifId || ""}
                                onChange={(e) =>
                                  setConfig((prev) => ({
                                    ...prev,
                                    [photoId]: {
                                      ...prev[photoId],
                                      tarifId: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#ffe992] focus:outline-none appearance-none cursor-pointer hover:bg-[#22222e] transition-colors"
                              >
                                {photo.tarifs?.map((t: any, index: number) => (
                                  <option
                                    key={t._id || t.id || index}
                                    value={t._id || t.id}
                                  >
                                    {t.format} — {t.support}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <ArrowRight size={14} className="rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs text-[#ffe992] uppercase tracking-wider font-bold">
                              Quantité
                            </label>
                            <div className="flex items-center gap-3 bg-[#1a1a24] border border-white/10 rounded-lg p-1 w-fit">
                              <button
                                onClick={() =>
                                  setConfig((prev) => ({
                                    ...prev,
                                    [photoId]: {
                                      ...prev[photoId],
                                      quantite: Math.max(
                                        1,
                                        (prev[photoId]?.quantite || 1) - 1
                                      ),
                                    },
                                  }))
                                }
                                className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono text-lg">
                                {config[photoId]?.quantite || 1}
                              </span>
                              <button
                                onClick={() =>
                                  setConfig((prev) => ({
                                    ...prev,
                                    [photoId]: {
                                      ...prev[photoId],
                                      quantite:
                                        (prev[photoId]?.quantite || 1) + 1,
                                    },
                                  }))
                                }
                                className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <p className="text-sm text-gray-400">
                            Prix unitaire :{" "}
                            <span className="text-white font-bold">
                              {
                                photo.tarifs?.find(
                                  (t) =>
                                    t._id === config[photoId]?.tarifId ||
                                    t.id === config[photoId]?.tarifId
                                )?.prix
                              }
                              €
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-[#12121a] flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-right flex-1">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Total estimé
                  </p>
                  <p className="text-3xl font-serif text-[#ffe992]">
                    {selectedPhotos
                      .reduce((acc, id) => {
                        const photo = evenement?.photos.find(
                          (p) => p._id === id
                        );
                        const conf = config[id];
                        const tarif = photo?.tarifs?.find(
                          (t) =>
                            t._id === conf?.tarifId || t.id === conf?.tarifId
                        );
                        return acc + (tarif?.prix || 0) * (conf?.quantite || 1);
                      }, 0)
                      .toFixed(2)}{" "}
                    €
                  </p>
                </div>
                <button
                  onClick={handleAddToQuote}
                  className="w-full sm:w-auto px-8 py-4 bg-[#ffe992] hover:bg-white text-black rounded-xl font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,233,146,0.3)] flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} />
                  Ajouter au panier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
