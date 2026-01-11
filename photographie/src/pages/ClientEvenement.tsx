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
import { ClientTariffSelector } from "../components/galerie/ClientTariffSelector";

// Types

interface Tarif {
  format: string;
  support: string;
  prix: number;
  id?: string;
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Configuration de la commande
  const [config, setConfig] = useState<{
    [photoId: string]: {
      selectedTarif?: any;
      hdSelected?: boolean;
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

  // Gestion du clavier pour la lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !evenement) return;

      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < evenement.photos.length - 1 ? prev + 1 : prev
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, evenement]);

  const toggleSelection = (photoId: string) => {
    const isSelected = selectedPhotos.includes(photoId);

    if (isSelected) {
      setSelectedPhotos((prev) => prev.filter((id) => id !== photoId));
      setConfig((prev) => {
        const newConfig = { ...prev };
        delete newConfig[photoId];
        return newConfig;
      });
    } else {
      setSelectedPhotos((prev) => [...prev, photoId]);

      // Initialiser la config par défaut si nouvelle sélection
      if (evenement) {
        const photo = evenement.photos.find((p) => p._id === photoId);
        if (photo && photo.tarifs && photo.tarifs.length > 0) {
          setConfig((prev) => ({
            ...prev,
            [photoId]: {
              tarifIndex: 0,
              quantite: 1,
            },
          }));
        }
      }
    }
  };

  const handleAddToQuote = () => {
    let addedCount = 0;
    selectedPhotos.forEach((photoId) => {
      const photo = evenement?.photos.find((p) => p._id === photoId);
      const conf = config[photoId];
      if (!photo || !conf) return;

      const quantity = conf.quantite || 1;

      // 1. Add Physical Print if selected
      if (conf.selectedTarif) {
        ajouterArticle({
          id: `${photo._id}-${conf.selectedTarif.id}-${Date.now()}`,
          nom: photo.titre || "Photo",
          prix: conf.selectedTarif.prix,
          quantite: quantity,
          image: photo.src,
          photoId: photo._id,
          format: conf.selectedTarif.format,
          support: conf.selectedTarif.support,
        });
        addedCount++;
      }

      // 2. Add HD Digital if selected
      if (conf.hdSelected) {
        ajouterArticle({
          id: `${photo._id}-HD-${Date.now()}`,
          nom: `${photo.titre || "Photo"} (Fichier Numérique HD)`,
          prix: 25, // Prix fixe pour l'instant, à rendre dynamique si besoin
          quantite: quantity,
          image: photo.src,
          photoId: photo._id,
          format: "Numérique",
          support: "Fichier HD",
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setShowConfig(false);
      setSelectedPhotos([]);
      navigate("/panier");
    } else {
      alert(
        "Veuillez sélectionner un format ou l'option HD pour au moins une photo."
      );
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
          {evenement.photos.map((photo, index) => (
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
            >
              <img
                src={photo.src}
                alt={photo.titre}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onClick={() => toggleSelection(photo._id)}
              />

              {/* Overlay Selection & Actions */}
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-4 ${
                  selectedPhotos.includes(photo._id)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {/* Bouton Voir */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(index);
                  }}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  title="Voir en grand"
                >
                  <ImageIcon size={24} />
                </button>

                {/* Bouton Sélectionner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(photo._id);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedPhotos.includes(photo._id)
                      ? "bg-[#ffe992] text-black scale-100 shadow-lg"
                      : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  }`}
                  title={
                    selectedPhotos.includes(photo._id)
                      ? "Désélectionner"
                      : "Sélectionner"
                  }
                >
                  <Check size={24} />
                </button>
              </div>

              {/* Prix à partir de */}
              {photo.tarifs && photo.tarifs.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0a0a10]">
                {selectedPhotos.map((photoId) => {
                  const photo = evenement?.photos.find(
                    (p) => p._id === photoId
                  );
                  if (!photo) return null;

                  const conf = config[photoId] || { quantite: 1 };

                  return (
                    <div
                      key={photoId}
                      className="flex flex-col lg:flex-row gap-8 bg-white/5 p-6 rounded-xl border border-white/5 hover:border-[#ffe992]/20 transition-colors"
                    >
                      {/* Photo Preview */}
                      <div className="w-full lg:w-1/3 space-y-4">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black shadow-lg">
                          <img
                            src={photo.src}
                            alt={photo.titre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-white text-lg truncate pr-4">
                            {photo.titre || "Sans titre"}
                          </h4>
                          <button
                            onClick={() => toggleSelection(photoId)}
                            className="text-xs text-red-400 hover:text-red-300 underline whitespace-nowrap"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>

                      {/* Configuration Panel */}
                      <div className="flex-1 space-y-6">
                        {/* Option HD Checkbox */}
                        <div
                          className="bg-[#1a1a24] border border-[#ffe992]/30 rounded-lg p-4 flex items-center justify-between group cursor-pointer hover:bg-[#22222e] transition-colors"
                          onClick={() => {
                            setConfig((prev) => ({
                              ...prev,
                              [photoId]: {
                                ...prev[photoId],
                                hdSelected: !prev[photoId]?.hdSelected,
                              },
                            }));
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                conf.hdSelected
                                  ? "bg-[#ffe992] border-[#ffe992] text-black"
                                  : "border-gray-500 group-hover:border-[#ffe992]"
                              }`}
                            >
                              {conf.hdSelected && (
                                <Check size={14} strokeWidth={3} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">
                                Fichier Numérique HD
                              </p>
                              <p className="text-xs text-gray-400">
                                Téléchargement haute définition
                              </p>
                            </div>
                          </div>
                          <span className="text-[#ffe992] font-bold">
                            25.00 €
                          </span>
                        </div>

                        <div className="w-full h-[1px] bg-white/10" />

                        {/* Tariff Selector */}
                        <ClientTariffSelector
                          selectedTarif={conf.selectedTarif}
                          onSelect={(tarif) => {
                            setConfig((prev) => ({
                              ...prev,
                              [photoId]: {
                                ...prev[photoId],
                                selectedTarif: tarif,
                              },
                            }));
                          }}
                        />

                        {/* Quantity */}
                        <div className="flex justify-end pt-4 border-t border-white/5">
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                              Quantité
                            </span>
                            <div className="flex items-center gap-3 bg-[#1a1a24] border border-white/10 rounded-lg p-1">
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
                                {conf.quantite || 1}
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

                        {/* Subtotal for this photo */}
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-sm text-gray-400">
                            Sous-total :
                          </span>
                          <span className="text-xl font-bold text-white">
                            {(
                              ((conf.selectedTarif?.prix || 0) +
                                (conf.hdSelected ? 25 : 0)) *
                              (conf.quantite || 1)
                            ).toFixed(2)}{" "}
                            €
                          </span>
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
                        const conf = config[id] || { quantite: 1 };
                        const price =
                          (conf.selectedTarif?.prix || 0) +
                          (conf.hdSelected ? 25 : 0);
                        return acc + price * (conf.quantite || 1);
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && evenement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Bouton Fermer */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all z-50"
            >
              <X size={32} />
            </button>

            {/* Navigation Gauche */}
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

            {/* Image */}
            <motion.img
              key={evenement.photos[lightboxIndex]._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={evenement.photos[lightboxIndex].src}
              alt={evenement.photos[lightboxIndex].titre || "Photo"}
              className="max-w-full max-h-[90vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation Droite */}
            {lightboxIndex < evenement.photos.length - 1 && (
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

            {/* Info Photo */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent text-center pointer-events-none flex flex-col items-center gap-4">
              <div>
                <h3 className="text-xl font-serif text-[#ffe992] mb-1">
                  {evenement.photos[lightboxIndex].titre || "Sans titre"}
                </h3>
                <p className="text-sm text-gray-400">
                  {lightboxIndex + 1} / {evenement.photos.length}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(null);
                }}
                className="pointer-events-auto px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all uppercase tracking-widest mb-4"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
