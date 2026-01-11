import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, X } from "lucide-react";
import {
  getWatermarkedImageUrl,
  preventRightClick,
} from "../utils/cloudinaryUtils";

// Composants Layout & UI
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { SelectionFormatModal } from "../components/galerie/SelectionFormatModal";
import PageTitle from "../components/ui/PageTitle";

// Contextes & Types
import { usePanier } from "../store/panierContext";
import { API_URL } from "../config/api";
import { Tarif, TarifOeuvre } from "../types/tarif";

// Styles
import "../styles/globals.css";
import "../styles/galerie.css";

// --- Interface ---
interface OeuvreGraphique {
  id: string;
  titre: string;
  image: string;
  prix: number;
  description?: string;
  // Ajout pour compatibilité avec le modal
  src?: string;
  categorie?: string;
  availableTariffIds?: string[];
}

// --- Variantes d'animation ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { scale: 0.98, opacity: 0, transition: { duration: 0.3 } },
};

export default function GalerieGraphique() {
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Lightbox State
  const [modalVisible, setModalVisible] = useState(false);
  const [photoSelectionnee, setPhotoSelectionnee] =
    useState<OeuvreGraphique | null>(null);
  const [tarifsPourModale, setTarifsPourModale] = useState<
    (TarifOeuvre | Tarif)[]
  >([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { ajouterArticle } = usePanier();
  const { addToast } = useToast();

  // 1. Fetch & Normalisation
  useEffect(() => {
    const fetchOeuvres = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/oeuvres-graphique`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();

        const sanitized = data.map((oeuvre: any) => {
          const imgSrc = oeuvre.image?.startsWith("http")
            ? oeuvre.image
            : oeuvre.image?.startsWith("/uploads/")
            ? `${API_URL}${oeuvre.image}`
            : oeuvre.image?.startsWith("/images/")
            ? oeuvre.image
            : `/images/${oeuvre.image || "/placeholder.jpg"}`;

          return {
            id: oeuvre._id || oeuvre.id,
            titre: oeuvre.titre,
            image: imgSrc,
            src: imgSrc, // Alias pour compatibilité
            categorie: "Art Graphique", // Catégorie par défaut
            prix: oeuvre.prix,
            description: oeuvre.description,
          };
        });

        setOeuvres(sanitized);
      } catch (err) {
        console.error("Fetch error:", err);
        addToast("Erreur lors du chargement des œuvres graphiques.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOeuvres();
  }, [addToast]);

  // 2. Logique Panier (Via Modal)
  const handleAjouterAuPanier = (oeuvre: OeuvreGraphique) => {
    // Créer un tarif "Standard" par défaut pour le modal
    const tarifStandard: Tarif = {
      id: `std-${oeuvre.id}`,
      nom: "Standard",
      type: "tirage",
      actif: true,
      format: "Format Unique",
      support: "Impression Fine Art",
      prix: oeuvre.prix,
    };

    setTarifsPourModale([tarifStandard]);
    setPhotoSelectionnee(oeuvre);
    setModalVisible(true);
  };

  const handleSelectFormat = (tarif: TarifOeuvre | Tarif) => {
    if (!photoSelectionnee) return;

    ajouterArticle({
      id: crypto.randomUUID(),
      photoId: photoSelectionnee.id,
      nom: `${photoSelectionnee.titre} (${tarif.format})`,
      prix: tarif.prix,
      quantite: 1,
      image: photoSelectionnee.image,
      format: tarif.format,
      support: tarif.support,
    });

    addToast(`${photoSelectionnee.titre} ajouté au panier`, "success");
    setModalVisible(false);
    setPhotoSelectionnee(null);
  };

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < oeuvres.length - 1 ? prev + 1 : prev
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, oeuvres]);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white selection:bg-yellow-500/30 selection:text-white font-sans">
      <Navbar />

      {/* Conteneur de l'image de fond et de la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/80 via-transparent to-[#0a0a10]" />
      </div>

      {/* Accent géométrique décoratif */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* Header - Style Cinématique */}
      <header className="relative pt-32 pb-12 px-6 overflow-hidden z-10">
        <PageTitle title="Galerie Graphique" />
      </header>

      {/* Grille principale */}
      <main className="max-w-[1800px] mx-auto px-6 md:px-8 pb-32 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {loading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton height={500} className="rounded-2xl" />
                      <Skeleton height={20} width="60%" />
                    </div>
                  ))
              : oeuvres.map((oeuvre, index) => (
                  <motion.div
                    key={oeuvre.id}
                    variants={cardVariants}
                    layout
                    className="group relative flex flex-col h-full"
                  >
                    {/* Carte Glassmorphism */}
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)] hover:-translate-y-2 h-full flex flex-col">
                      {/* Image Section */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          src={getWatermarkedImageUrl(oeuvre.image)}
                          alt={oeuvre.titre}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-opacity duration-700"
                          onContextMenu={preventRightClick}
                        />

                        {/* Overlay au survol */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxIndex(index);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-white/20 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 flex items-center justify-center gap-2"
                          >
                            <Eye size={16} /> Voir en grand
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAjouterAuPanier(oeuvre);
                            }}
                            className="w-full bg-[#ffe992] text-black font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-[#d6c487] transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500"
                          >
                            Ajouter au panier
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex flex-col items-center text-center flex-1 justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-serif font-bold text-white tracking-wide mb-1 group-hover:text-[#ffe992] transition-colors duration-300">
                            {oeuvre.titre}
                          </h3>
                          {oeuvre.description && (
                            <span className="text-xs text-gray-400 uppercase tracking-widest line-clamp-1">
                              {oeuvre.description}
                            </span>
                          )}
                        </div>

                        <div className="w-full h-[1px] bg-white/10 group-hover:bg-[#ffe992]/30 transition-colors duration-500" />

                        <span className="text-[#ffe992] text-sm font-medium tracking-widest">
                          {oeuvre.prix} €
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Modal - Animée */}
      <AnimatePresence>
        {modalVisible && photoSelectionnee && (
          <SelectionFormatModal
            tarifs={tarifsPourModale}
            config={null} // Pas de config complexe pour l'art graphique pour l'instant
            photo={photoSelectionnee}
            onSelect={handleSelectFormat}
            onClose={() => setModalVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center"
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
              key={oeuvres[lightboxIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={getWatermarkedImageUrl(oeuvres[lightboxIndex].image)}
              alt={oeuvres[lightboxIndex].titre || "Oeuvre"}
              className="max-w-full max-h-[90vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={preventRightClick}
            />

            {/* Navigation Droite */}
            {lightboxIndex < oeuvres.length - 1 && (
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
                  {oeuvres[lightboxIndex].titre || "Sans titre"}
                </h3>
                <p className="text-sm text-gray-400">
                  {lightboxIndex + 1} / {oeuvres.length}
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
