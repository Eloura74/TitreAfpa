import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Composants Layout & UI
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { SelectionFormatModalV2 } from "../components/galerie/SelectionFormatModalV2";
import PageTitle from "../components/ui/PageTitle";

// Contextes & Types
import { usePanier } from "../store/panierContext";
import { API_URL } from "../config/api";
import { Tarif, TarifOeuvre } from "../types/tarif";
import { tariffServiceV2 } from "../services/tariffServiceV2";
import { TariffConfigV2 } from "../types/tarifConfigV2";
import { albumService, Album } from "../services/albumService";
import { Folder, ArrowLeft, Eye, X, ArrowRight } from "lucide-react";
import {
  getWatermarkedImageUrl,
  preventRightClick,
} from "../utils/cloudinaryUtils";

// Styles
import "../styles/globals.css";
import "../styles/galerie.css";

// --- Interfaces ---
interface Photo {
  id?: number;
  _id?: string;
  src: string;
  alt: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  type: string;
  tarifs?: TarifOeuvre[];
  availableTariffIds?: string[];
}

// --- Variantes d'animation (Douces comme Home) ---
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

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorieActive, setCategorieActive] = useState<string>("Toutes");
  const [photoSelectionnee, setPhotoSelectionnee] = useState<Photo | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [tariffConfig, setTariffConfig] = useState<TariffConfigV2 | null>(null);

  // Album Logic
  const [albums, setAlbums] = useState<Album[]>([]);
  const [viewMode, setViewMode] = useState<"albums" | "photos">("albums");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const { ajouterArticle } = usePanier();
  const { addToast } = useToast();

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 1. Fetch & Normalisation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resPhotos, config, albumsData] = await Promise.all([
          fetch(`${API_URL}/api/galerie`),
          tariffServiceV2.getTariffConfig(), // Use V2 service
          albumService.getAlbums(),
        ]);

        const data: Photo[] = await resPhotos.json();
        setAlbums(albumsData);
        setTariffConfig(config); // config is now TariffConfigV2

        // If albums exist, start in album mode, otherwise show all photos
        if (albumsData.length > 0) {
          setViewMode("albums");
        } else {
          setViewMode("photos");
        }

        // Helper to resolve tariffs (V2 Structure)
        const resolveTariffs = (
          availableIds: string[] | undefined,
          config: TariffConfigV2
        ): TarifOeuvre[] => {
          if (!availableIds || availableIds.length === 0 || !config.categories)
            return [];
          const resolved: TarifOeuvre[] = [];

          config.categories.forEach((cat) => {
            cat.products.forEach((prod) => {
              prod.supports.forEach((supp) => {
                supp.formats.forEach((fmt) => {
                  // Check if any level ID matches (simplification: usually we select specific combos)
                  // But here we need to know WHICH combo is available.
                  // Usually availableIds contains IDs of specific formats or supports.
                  // Let's assume availableIds contains the FORMAT ID or SUPPORT ID.

                  // Logic: If the format ID is in availableIds, we add it.
                  if (availableIds.includes(fmt.id)) {
                    // Calculate total price (sum of all levels)
                    const totalPrice =
                      (cat.price || 0) +
                      (prod.price || 0) +
                      (supp.price || 0) +
                      (fmt.price || 0);

                    resolved.push({
                      id: fmt.id,
                      format: fmt.name,
                      support: `${supp.name} (${prod.name})`,
                      prix: totalPrice,
                    });
                  }
                });
              });
            });
          });

          return resolved;
        };

        const sanitized = data
          .filter((p) => p.categorie !== "EvenementPrive") // Double sécurité côté front
          .map((p) => {
            // Resolve dynamic tariffs if available
            const resolvedTariffs = resolveTariffs(
              p.availableTariffIds,
              config as TariffConfigV2
            );

            return {
              ...p,
              src: p.src?.startsWith("http")
                ? p.src
                : p.src?.startsWith("/uploads/")
                ? `${API_URL}${p.src}`
                : p.src?.startsWith("/images/")
                ? p.src
                : `/images/${p.src}`,
              tarifs:
                resolvedTariffs.length > 0
                  ? resolvedTariffs
                  : Array.isArray(p.tarifs)
                  ? p.tarifs
                  : [],
            };
          });

        setPhotos(sanitized);
      } catch (err) {
        console.error("Fetch error:", err);
        addToast("Erreur lors du chargement de la galerie.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // 2. Logique de Panier
  const handleAjouterAuPanier = useCallback(
    (photo: Photo) => {
      // Si on a une config tarifaire et des IDs disponibles, on ouvre le nouveau configurateur
      if (
        tariffConfig &&
        photo.availableTariffIds &&
        photo.availableTariffIds.length > 0
      ) {
        setPhotoSelectionnee(photo);
        setModalVisible(true);
        return;
      }

      // Fallback: ancienne logique pour les tarifs simples (si nécessaire)
      const tarifsDisponibles =
        photo.tarifs && photo.tarifs.length > 0
          ? photo.tarifs
          : [
              {
                id: `def-${photo._id || crypto.randomUUID()}`,
                format: "Standard",
                support: "Papier photo",
                prix: photo.prix || 0,
              },
            ];

      if (tarifsDisponibles.length === 1) {
        const t = tarifsDisponibles[0];
        ajouterArticle({
          id: crypto.randomUUID(),
          photoId: photo._id,
          nom: `${photo.titre} (${t.format})`,
          prix: t.prix,
          quantite: 1,
          image: photo.src,
          format: t.format,
          support: t.support,
        });
        addToast(`${photo.titre} ajouté au panier`, "success");
      } else {
        setPhotoSelectionnee(photo);
        setModalVisible(true);
      }
    },
    [ajouterArticle, addToast, tariffConfig]
  );

  // 3. Gestion de la sélection de format via la modale
  const handleSelectFormat = (tarif: TarifOeuvre | Tarif) => {
    if (!photoSelectionnee) return;

    ajouterArticle({
      id: crypto.randomUUID(),
      photoId: photoSelectionnee._id,
      nom: `${photoSelectionnee.titre} (${tarif.format})`,
      prix: tarif.prix,
      quantite: 1,
      image: photoSelectionnee.src,
      format: tarif.format,
      support: tarif.support,
    });

    addToast(
      `${photoSelectionnee.titre} (${tarif.format}) ajouté au panier`,
      "success"
    );
    setModalVisible(false);
    setPhotoSelectionnee(null);
  };

  // 4. Mémorisation
  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(photos.map((p) => p.categorie)))],
    [photos]
  );

  // Calcul du nombre de photos par album
  const photoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    photos.forEach((p) => {
      // On suppose que la propriété album est présente sur la photo (même si le type Photo ne l'a pas explicitement, l'API le renvoie)
      const albumId = (p as any).album;
      if (albumId) {
        counts[albumId] = (counts[albumId] || 0) + 1;
      }
    });
    return counts;
  }, [photos]);

  const filtered = useMemo(() => {
    let currentPhotos = photos;

    // Filter by Album if selected
    if (viewMode === "photos" && selectedAlbum) {
      currentPhotos = currentPhotos.filter(
        (p) => (p as any).album === selectedAlbum._id
      );
    } else if (viewMode === "photos" && !selectedAlbum && albums.length > 0) {
      // If in photo mode but no album selected (and albums exist), show nothing or all?
      // Let's assume we only show photos when an album is selected if albums exist.
      // Or maybe we have a "All Photos" album?
      // For now, if no album selected, show all (legacy behavior)
    }

    if (categorieActive === "Toutes") return currentPhotos;
    return currentPhotos.filter((p) => p.categorie === categorieActive);
  }, [photos, categorieActive, viewMode, selectedAlbum, albums]);

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
          prev !== null && prev < filtered.length - 1 ? prev + 1 : prev
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filtered]);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white selection:bg-yellow-500/30 selection:text-white font-sans">
      <Helmet>
        <title>Galerie Photo | Fabien Licata</title>
        <meta
          name="description"
          content="Découvrez ma collection de photographies d'art. Paysages, portraits, urbain... Disponibles en tirages limités sur différents supports (Papier, Toile, Alu)."
        />
        <meta property="og:title" content="Galerie Photo | Fabien Licata" />
        <meta
          property="og:description"
          content="Découvrez ma collection de photographies d'art. Disponibles en tirages limités."
        />
      </Helmet>
      <Navbar />

      {/* Conteneur de l'image de fond et de la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/80 via-transparent to-[#0a0a10]" />
      </div>

      {/* Accent géométrique décoratif */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* Header - Style Cinématique */}
      <header className="relative pt-20 pb-0 px-6 overflow-hidden z-10">
        <PageTitle title="Galerie d'Art" />
      </header>

      {/* Navigation des filtres - Style Glassmorphism - Masqué sur mobile */}
      <nav className="sticky top-20 z-40 px-4 py-2 mb-8 mt-0 hidden md:block">
        <div className="max-w-fit mx-auto flex flex-wrap justify-center items-center gap-2 md:gap-4 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {viewMode === "photos" && selectedAlbum && (
            <button
              onClick={() => {
                setViewMode("albums");
                setSelectedAlbum(null);
                setCategorieActive("Toutes");
              }}
              className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-300 px-4 py-2 rounded-full text-[#ffe992] hover:bg-white/10 mr-4 border-r border-white/10 pr-6"
            >
              <ArrowLeft size={14} /> Albums
            </button>
          )}

          {loading ? (
            <Skeleton width={200} height={30} className="rounded-full" />
          ) : viewMode === "albums" ? (
            <span className="text-xs text-gray-400 uppercase tracking-widest px-4">
              Sélectionnez un album
            </span>
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategorieActive(cat)}
                className={`relative text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-300 px-4 py-2 rounded-full ${
                  categorieActive === cat
                    ? "text-[#ffe992] font-medium bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Grille principale */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-12 pb-32 relative z-10">
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
              : viewMode === "albums"
              ? // ALBUM GRID
                albums.map((album) => (
                  <motion.div
                    key={album._id}
                    variants={cardVariants}
                    layout
                    onClick={() => {
                      setSelectedAlbum(album);
                      setViewMode("photos");
                    }}
                    className="group relative cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)] hover:-translate-y-2 aspect-square flex flex-col">
                      {/* Cover Image */}
                      <div className="relative w-full h-full overflow-hidden">
                        {album.imageCouverture ? (
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            src={getWatermarkedImageUrl(album.imageCouverture)}
                            alt={album.titre}
                            className="w-full h-full object-cover transition-opacity duration-700 opacity-80 group-hover:opacity-100"
                            onContextMenu={preventRightClick}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-600">
                            <Folder size={64} />
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                          <h3 className="text-2xl font-serif font-bold text-white tracking-wide mb-1 group-hover:text-[#ffe992] transition-colors duration-300">
                            {album.titre}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {album.description}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-medium uppercase tracking-wider text-[#ffe992]">
                              <Eye size={12} />
                              {photoCounts[album._id] || 0} Photos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              : // PHOTO GRID
                filtered.map((photo) => (
                  <motion.div
                    key={photo._id || photo.id}
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
                          src={getWatermarkedImageUrl(photo.src)}
                          alt={photo.alt}
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
                              const index = filtered.findIndex(
                                (p) => p._id === photo._id
                              );
                              setLightboxIndex(index);
                            }}
                            className="w-full bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-white/20 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 flex items-center justify-center gap-2"
                          >
                            <Eye size={16} /> Voir en grand
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAjouterAuPanier(photo);
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
                            {photo.titre}
                          </h3>
                          <span className="text-xs text-gray-400 uppercase tracking-widest">
                            {photo.categorie}
                          </span>
                        </div>

                        <div className="w-full h-[1px] bg-white/10 group-hover:bg-[#ffe992]/30 transition-colors duration-500" />

                        <span className="text-[#ffe992] text-sm font-medium tracking-widest">
                          {photo.prix} €
                        </span>

                        {/* Boutons d'action Mobile Uniquement */}
                        <div className="flex md:hidden w-full gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const index = filtered.findIndex(
                                (p) => p._id === photo._id
                              );
                              setLightboxIndex(index);
                            }}
                            className="flex-1 bg-white/10 text-white text-[10px] uppercase font-bold py-2 rounded border border-white/10 flex items-center justify-center gap-1"
                          >
                            <Eye size={12} /> Voir
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAjouterAuPanier(photo);
                            }}
                            className="flex-1 bg-[#ffe992] text-black text-[10px] uppercase font-bold py-2 rounded flex items-center justify-center gap-1"
                          >
                            Panier
                          </button>
                        </div>
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
          <SelectionFormatModalV2
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
              key={filtered[lightboxIndex]._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={getWatermarkedImageUrl(filtered[lightboxIndex].src)}
              alt={filtered[lightboxIndex].titre || "Photo"}
              className="max-w-full max-h-[90vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={preventRightClick}
            />

            {/* Navigation Droite */}
            {lightboxIndex < filtered.length - 1 && (
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
                  {filtered[lightboxIndex].titre || "Sans titre"}
                </h3>
                <p className="text-sm text-gray-400">
                  {lightboxIndex + 1} / {filtered.length}
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
