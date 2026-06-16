import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Composants SEO & Layout
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { SelectionFormatModalV2 } from "../components/galerie/SelectionFormatModalV2";

// Contextes & Types
import { usePanier } from "../store/panierContext";
import { API_URL } from "../config/api";
import { Tarif, TarifOeuvre } from "../types/tarif";
import { tariffServiceV2 } from "../services/tariffServiceV2";
import { TariffConfigV2 } from "../types/tarifConfigV2";
import { albumService, Album } from "../services/albumService";
import {
  Folder,
  ArrowLeft,
  Eye,
  X,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import PhotoSortControls, {
  SortOption,
  ViewMode,
} from "../components/common/PhotoSortControls";
import {
  getWatermarkedImageUrl,
  preventRightClick,
} from "../utils/cloudinaryUtils";
import StickyCtaMobile from "../components/common/StickyCtaMobile";
import Pagination from "../components/common/Pagination";
import homeImages from "../config/images.json";
import { useCovers } from "../hooks/useCovers";
import {
  LikeViewCounter,
  LikeViewCounterRef,
} from "../components/LikeViewCounter";

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
  likes?: number;
  views?: number;
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

// Composant AlbumCard avec effet flip 3D
interface AlbumCardProps {
  album: Album;
  photoCounts: Record<string, number>;
  albumImages: Photo[];
  onSelect: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  photoCounts,
  albumImages,
  onSelect,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OPTIMISATION : Le carrousel ne tourne QUE si la carte est retournée
  useEffect(() => {
    if (!isFlipped || albumImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % albumImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isFlipped, albumImages.length]); // Dépendance à isFlipped ajoutée

  // Gestion du survol avec délai pour éviter les flips accidentels
  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFlipped(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsFlipped(false);
  };

  return (
    <div
      className="group relative cursor-pointer h-full"
      style={{ perspective: "1200px" }} // Perspective augmentée pour moins de distorsion
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {/* Effet de rayonnement élégant sous la carte */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#ffe992]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-[#ffe992]/30 blur-lg rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Container animé avec Framer Motion - Animation adoucie */}
      <motion.div
        className="relative w-full aspect-square"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 100, // Stiffness plus faible pour une animation plus douce
          damping: 45, // Damping plus élevé pour une animation plus douce et moins brutale
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* --- FACE AVANT --- */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 drop-shadow-[2px_4px_12px_rgba(255,233,146,0.4)]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(1px)", // Fix Safari pour éviter le clipping
          }}
        >
          {/* Effet Glow au survol */}
          <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 shadow-[0_0_35px_rgba(255,233,146,0.3),inset_0_0_20px_rgba(255,233,146,0.05)] pointer-events-none" />

          <div className="relative w-full h-full">
            {album.imageCouverture ? (
              <img
                src={getWatermarkedImageUrl(album.imageCouverture)}
                alt={album.titre}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                onContextMenu={preventRightClick}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <Folder
                  size={64}
                  className="text-gray-600 group-hover:text-[#ffe992] transition-colors"
                />
              </div>
            )}

            {/* Overlay gradient renforcé */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Effet glassmorphism au bas */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/10 backdrop-blur-sm" />

            {/* Contenu */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
              <h3 className="text-2xl font-playfair-sc font-bold text-white tracking-wide mb-2 group-hover:text-[#ffe992] transition-colors duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                {album.titre}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                {album.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffe992]/20 backdrop-blur-sm border border-[#ffe992]/30 text-[11px] font-bold uppercase tracking-wider text-[#ffe992] group-hover:bg-[#ffe992]/30 group-hover:scale-105 transition-all duration-300">
                  <Eye size={13} />
                  {photoCounts[album._id] || 0} Photos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE --- */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-[#1a1a20] border border-[#ffe992]/50 shadow-[0_0_35px_rgba(255,233,146,0.5)]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(1px)", // Fix Safari
          }}
        >
          {/* Images défilantes - Qualité améliorée */}
          {albumImages.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={getWatermarkedImageUrl(albumImages[currentImageIndex].src)}
                alt="Aperçu"
                className="w-full h-full object-cover opacity-90 transition-opacity"
                onContextMenu={preventRightClick}
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <Folder size={64} className="text-[#ffe992]/50" />
            </div>
          )}

          {/* Overlay gradient léger pour la lisibilité du badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Badge central */}
          <div className="absolute inset-0 flex items-end  pb-2 justify-center">
            <div className="px-6 py-3 rounded-full border border-[#ffe992] bg-black/60 shadow-[0_0_15px_rgba(255,233,146,0.4)]">
              <p className="text-[#ffe992] text-sm font-bold uppercase tracking-widest opacity-40 ">
                Ouvrir
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Composant PhotoCard avec effet flip pour afficher la description
interface PhotoCardProps {
  photo: Photo;
  onView: () => void;
  onAddToCart: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onView,
  onAddToCart,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const likeViewRef = useRef<LikeViewCounterRef>(null);

  // Fermer le flip au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFlipped &&
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setIsFlipped(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFlipped]);

  return (
    <div ref={cardRef} className="relative" style={{ perspective: "1200px" }}>
      {/* Effet de rayonnement sous la carte */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#ffe992]/20 blur-xl rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-[#ffe992]/30 blur-lg rounded-full opacity-60 hover:opacity-100 transition-opacity duration-500" />

      {/* Carte avec effet de flip */}
      <motion.div
        variants={cardVariants}
        layout
        whileHover={{ scale: 1.03, y: -6 }}
        whileTap={{ scale: 0.97 }}
        className="relative h-[500px] drop-shadow-[2px_4px_8px_rgba(255,233,146,0.6)]"
      >
        {/* Effet de rayonnement sous la carte */}

        <motion.div
          className="relative w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 45,
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FACE AVANT */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "translateZ(1px)",
            }}
          >
            <div className="group h-full flex flex-col relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.6)]">
              {/* Image - Maximisée */}
              <div className="relative w-full h-96 overflow-hidden bg-black/20">
                <img
                  src={getWatermarkedImageUrl(photo.src)}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  onContextMenu={preventRightClick}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Overlay au survol - Desktop uniquement */}
                <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex-col justify-end p-6 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Incrémenter la vue avant d'ouvrir le lightbox
                      likeViewRef.current?.incrementView();
                      onView();
                    }}
                    className="w-full bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-white/20 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 flex items-center justify-center gap-2"
                  >
                    {/* Icône et texte */}
                    <Eye size={16} /> Voir en grand
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                    className="w-full bg-[#ffe992] text-black font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-[#d6c487] transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Voir plus</span>
                  </button>
                </div>

                {/* Boutons fixes - Mobile uniquement */}
                <div className="md:hidden absolute bottom-3 left-3 right-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                    className="flex-1 bg-white/20 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded hover:bg-white/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                    className="flex-1 bg-[#ffe992] text-black font-bold text-[10px] uppercase tracking-wider py-2 rounded hover:bg-[#d6c487] transition-colors flex items-center justify-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu - Ultra compact */}
              <div className="relative flex flex-col px-3 py-2 bg-gradient-to-b from-black/30 to-black/40">
                {/* Effet de lueur subtile en fond */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#ffe992]/5 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3.5">
                  {/* Titre centré avec effet glow */}
                  <h3 className="text-lg font-playfair-sc uppercase tracking-wider text-[#ffe992] font-bold leading-tight text-center drop-shadow-[0_0_20px_rgba(255,233,146,0.8)] animate-pulse-subtle">
                    {photo.titre}
                  </h3>

                  {/* Prix et Catégorie sur même ligne */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xl text-[#ffe992] font-bold">
                      {photo.tarifs && photo.tarifs.length > 0
                        ? `À partir de ${Math.min(...photo.tarifs.map((t) => t.prix)).toFixed(2)} €`
                        : photo.prix > 0
                          ? `${photo.prix.toFixed(2)} €`
                          : "Prix sur demande"}
                    </p>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ffe992]/10 border border-[#ffe992]/20 text-[8px] text-gray-300 uppercase tracking-widest font-medium group-hover:bg-[#ffe992]/20 group-hover:border-[#ffe992]/30 group-hover:text-[#ffe992] transition-all duration-300 whitespace-nowrap">
                      {photo.categorie}
                    </span>
                  </div>

                  {/* Likes et Vues */}
                  {photo._id && (
                    <LikeViewCounter
                      ref={likeViewRef}
                      id={photo._id}
                      likes={photo.likes || 0}
                      views={photo.views || 0}
                      apiEndpoint="/api/galerie"
                    />
                  )}

                  {/* Bouton Ajouter au panier */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart();
                    }}
                    className="w-full bg-gradient-to-r from-[#ffe992]/20 to-[#ffe992]/30 hover:from-[#ffe992]/30 hover:to-[#ffe992]/40 text-[#ffe992] text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg border border-[#ffe992]/40 hover:border-[#ffe992]/70 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_rgba(255,233,146,0.2)] hover:shadow-[0_6px_20px_rgba(255,233,146,0.4)]"
                  >
                    <ShoppingCart size={16} className="flex-shrink-0" />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FACE ARRIÈRE - Description complète avec design amélioré */}
          <div
            className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a20] via-black/95 to-[#0f0f14] border-2 border-[#ffe992]/60 shadow-[0_0_40px_rgba(255,233,146,0.6),inset_0_0_30px_rgba(255,233,146,0.1)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
            }}
          >
            {/* Effet de lumière en arrière-plan */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#ffe992]/15 via-[#ffe992]/5 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffe992] to-transparent" />

            <div className="relative h-full flex flex-col p-5">
              {/* Titre avec séparateur */}
              <div className="mb-4 pb-3 border-b border-[#ffe992]/30">
                <h3 className="text-xl font-playfair-sc font-bold text-[#ffe992] drop-shadow-[0_0_15px_rgba(255,233,146,0.8)] text-center uppercase tracking-wider">
                  {photo.titre}
                </h3>
              </div>

              {/* Description avec scroll personnalisé */}
              <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-[#ffe992]/40 scrollbar-track-[#ffe992]/10 hover:scrollbar-thumb-[#ffe992]/60">
                <p className="text-sm text-gray-200 leading-relaxed text-justify">
                  {photo.description || "Aucune description disponible."}
                </p>
              </div>

              {/* Bouton retour amélioré */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="w-full bg-gradient-to-r from-[#ffe992] to-[#f4d677] text-black text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:from-[#f4d677] hover:to-[#ffe992] transition-all duration-300 shadow-[0_6px_20px_rgba(255,233,146,0.5)] hover:shadow-[0_8px_28px_rgba(255,233,146,0.7)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} className="flex-shrink-0" />
                <span>Retour</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function Galerie() {
  const { covers } = useCovers();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorieActive, setCategorieActive] = useState<string>("Toutes");
  const [photoSelectionnee, setPhotoSelectionnee] = useState<Photo | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [tariffConfig, setTariffConfig] = useState<TariffConfigV2 | null>(null);

  // Album Logic
  const [albums, setAlbums] = useState<Album[]>([]);
  const [viewMode, setViewMode] = useState<"albums" | "photos">("albums");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Sort & Display Options
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [displayMode, setDisplayMode] = useState<ViewMode>("grid");

  const { ajouterArticle, articles: panierArticles } = usePanier();
  const { addToast } = useToast();

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 📄 Pagination State (NOUVELLE FEATURE)
  const [currentPage, setCurrentPage] = useState(1);
  const PHOTOS_PER_PAGE = 12; // 12 photos par page (3x4 grid)

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
          config: TariffConfigV2,
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
                    // Le prix final est uniquement celui du format (comme dans SelectionFormatModalV2)
                    // Les prix des niveaux parents (catégorie, produit, support) sont informatifs uniquement
                    resolved.push({
                      id: fmt.id,
                      format: fmt.name,
                      support: supp.name,
                      prix: fmt.price,
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
              config as TariffConfigV2,
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
    [ajouterArticle, addToast, tariffConfig],
  );

  // 3. Gestion de la sélection de format via la modale
  const handleSelectFormat = (tarif: TarifOeuvre | Tarif) => {
    if (!photoSelectionnee) return;

    // Utiliser directement le support du tarif (déjà nettoyé par resolveTariffs)
    const supportValue = tarif.support || "Standard";

    ajouterArticle({
      id: tarif.id || crypto.randomUUID(),
      photoId: photoSelectionnee._id,
      nom: photoSelectionnee.titre, // Utiliser uniquement le titre de la photo
      prix: tarif.prix,
      quantite: 1,
      image: photoSelectionnee.src,
      format: tarif.format, // Format tel quel depuis TarifConfig (ex: "10x10")
      support: supportValue, // Support nettoyé ou par défaut
    });

    addToast(
      `${photoSelectionnee.titre} (${tarif.format}) ajouté au panier`,
      "success",
    );
    setModalVisible(false);
    setPhotoSelectionnee(null);
  };

  // 4. Mémorisation
  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(photos.map((p) => p.categorie)))],
    [photos],
  );

  // Tri des albums
  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (b._id || "").localeCompare(a._id || "");
        case "date-asc":
          return (a._id || "").localeCompare(b._id || "");
        case "name-asc":
          return (a.titre || "").localeCompare(b.titre || "");
        case "name-desc":
          return (b.titre || "").localeCompare(a.titre || "");
        default:
          return 0;
      }
    });
  }, [albums, sortBy]);

  // Calcul du nombre de photos par album et récupération des photos de chaque album
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

  // Récupération des photos pour chaque album (pour l'effet flip)
  const albumPhotos = useMemo(() => {
    const photosByAlbum: Record<string, Photo[]> = {};
    photos.forEach((p) => {
      const albumId = (p as any).album;
      if (albumId) {
        if (!photosByAlbum[albumId]) {
          photosByAlbum[albumId] = [];
        }
        photosByAlbum[albumId].push(p);
      }
    });
    return photosByAlbum;
  }, [photos]);

  // 📄 Filtrage et tri des photos
  const allFilteredPhotos = useMemo(() => {
    let currentPhotos = photos;

    // Filter by Album if selected
    if (viewMode === "photos" && selectedAlbum) {
      currentPhotos = currentPhotos.filter(
        (p) => (p as any).album === selectedAlbum._id,
      );
    } else if (viewMode === "photos" && !selectedAlbum && albums.length > 0) {
      // If in photo mode but no album selected (and albums exist), show nothing or all?
      // Let's assume we only show photos when an album is selected if albums exist.
      // Or maybe we have a "All Photos" album?
      // For now, if no album selected, show all (legacy behavior)
    }

    // Filter by category
    if (categorieActive !== "Toutes") {
      currentPhotos = currentPhotos.filter(
        (p) => p.categorie === categorieActive,
      );
    }

    // Sort photos
    const sorted = [...currentPhotos].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          // Assume photos have a createdAt or similar field, fallback to _id
          return (b._id || "").localeCompare(a._id || "");
        case "date-asc":
          return (a._id || "").localeCompare(b._id || "");
        case "name-asc":
          return (a.titre || "").localeCompare(b.titre || "");
        case "name-desc":
          return (b.titre || "").localeCompare(a.titre || "");
        default:
          return 0;
      }
    });

    return sorted;
  }, [photos, categorieActive, viewMode, selectedAlbum, albums, sortBy]);

  // 📄 Pagination : calcul du nombre de pages et des photos à afficher
  const totalPages = Math.ceil(allFilteredPhotos.length / PHOTOS_PER_PAGE);

  const filtered = useMemo(() => {
    const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE;
    const endIndex = startIndex + PHOTOS_PER_PAGE;
    return allFilteredPhotos.slice(startIndex, endIndex);
  }, [allFilteredPhotos, currentPage, PHOTOS_PER_PAGE]);

  // Reset page quand le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [categorieActive, selectedAlbum]);

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev,
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < filtered.length - 1 ? prev + 1 : prev,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filtered]);

  return (
    <div
      role="main"
      className="min-h-screen bg-[#0a0a10] text-white selection:bg-yellow-500/30 selection:text-white font-sans"
    >
      {/* SEO complet avec Open Graph, Twitter Card et Schema.org */}
      <SEO
        title="Galerie Photo - Tirages d'Art"
        description="Découvrez ma collection de photographies d'art. Paysages, portraits, événements. Tirages limités disponibles sur papier photo, toile canvas, aluminium et plexiglas. Livraison France et international."
        image="/images/gallery-preview.jpg"
        type="website"
        keywords={[
          "galerie photo",
          "photographie art",
          "tirage photo",
          "impression photo",
          "toile canvas",
          "photographe professionnel",
          "Fabien Licata",
        ]}
        schema={{
          ...photographerSchema,
          ...createBreadcrumbSchema([
            { name: "Accueil", url: "https://titre-afpa.vercel.app/" },
            {
              name: "Galerie Photo",
              url: "https://titre-afpa.vercel.app/galerie",
            },
          ]),
        }}
      />
      <Navbar />

      {/* Conteneur de l'image de fond et de la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <img
          src={covers.backgroundSite || homeImages.hero}
          alt="Galerie d'art"
          className="hero-image w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/80 via-transparent to-[#0a0a10]" />
      </div>

      {/* Accent géométrique décoratif */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* Header - Style Premium avec titre et description */}
      <header
        className="relative pt-32 px-6 overflow-hidden z-10 transition-all duration-700 ease-in-out"
        style={{ paddingBottom: viewMode === "albums" ? "3rem" : "1rem" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Titre avec album à côté */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal uppercase font-playfair-sc tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]">
              <span className="bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">
                Galerie d'Art
              </span>
            </h1>

            {/* Nom de l'album à côté du titre */}
            <AnimatePresence mode="wait">
              {viewMode === "photos" && selectedAlbum && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ffe992]/20 to-[#ffe992]/10 border border-[#ffe992]/30 backdrop-blur-sm whitespace-nowrap"
                >
                  <Folder size={14} className="text-[#ffe992]" />
                  <span className="text-[#ffe992] text-xs font-bold uppercase tracking-wider">
                    {selectedAlbum.titre}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Texte explicatif avec glassmorphism - Visible uniquement en mode albums */}
          <AnimatePresence mode="wait">
            {viewMode === "albums" && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -30, height: 0 }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: { duration: 0.6, ease: "easeInOut" },
                  height: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                }}
                className="max-w-2xl mx-auto mb-6 overflow-hidden"
              >
                <div className="relative backdrop-blur-sm bg-black/20 border border-[#ffe992]/15 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden drop-shadow-[0_0_6px_rgba(255,233,146,0.3)]">
                  {/* Effet de brillance animée */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/10 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Effet de rayonnement élégant */}
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/10 to-transparent " />
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/05 to-transparent" />
                  <motion.p
                    className="text-lg md:text-xl text-white/90 font-light leading-relaxed relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 1 }}
                  >
                    Découvrez ma collection de{" "}
                    <span className="font-semibold text-[#ffe992] drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">
                      photographies d'art
                    </span>
                    . Chaque œuvre est disponible en tirages limités sur
                    différents supports : papier photo, toile canvas, aluminium
                    et plexiglas. Livraison France et international.
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Navigation des filtres et contrôles - Style Glassmorphism */}
      <div className="sticky top-20 z-40 px-4 py-2 mb-8 mt-0">
        <div className="max-w-[1600px] mx-auto">
          {/* Barre de navigation avec filtres */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            {/* Filtres de catégories - Masqué sur mobile */}
            <nav className="hidden md:block">
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
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

            {/* Contrôles de tri et d'affichage */}
            {(viewMode === "photos" || viewMode === "albums") && (
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <div className="text-xs text-gray-400 hidden sm:block">
                  {viewMode === "albums"
                    ? `${albums.length} album${albums.length > 1 ? "s" : ""}`
                    : `${allFilteredPhotos.length} photo${allFilteredPhotos.length > 1 ? "s" : ""}`}
                </div>
                <PhotoSortControls
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={displayMode}
                  onViewModeChange={setDisplayMode}
                  className=""
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-12 pb-32 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "photos" && displayMode === "list"
              ? "space-y-4"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          }
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
                  sortedAlbums.map((album) => (
                    <AlbumCard
                      key={album._id}
                      album={album}
                      photoCounts={photoCounts}
                      albumImages={albumPhotos[album._id] || []}
                      onSelect={() => {
                        setSelectedAlbum(album);
                        setViewMode("photos");
                      }}
                    />
                  ))
                : // PHOTO GRID
                  filtered.map((photo) => (
                    <PhotoCard
                      key={photo._id || photo.id}
                      photo={photo}
                      onView={() => {
                        const index = filtered.findIndex(
                          (p) => p._id === photo._id,
                        );
                        setLightboxIndex(index);
                      }}
                      onAddToCart={() => handleAjouterAuPanier(photo)}
                    />
                  ))}
          </AnimatePresence>
        </motion.div>

        {/* 📄 Pagination : Affichée uniquement en mode photos */}
        {viewMode === "photos" && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            scrollToTop={true}
            scrollOffset={200}
          />
        )}
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

              {/* Boutons actions */}
              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAjouterAuPanier(filtered[lightboxIndex]);
                  }}
                  className="px-6 py-2.5 bg-[#ffe992] hover:bg-[#f4d677] text-black text-sm font-bold transition-all uppercase tracking-widest rounded-full shadow-[0_4px_12px_rgba(255,233,146,0.4)] hover:shadow-[0_6px_16px_rgba(255,233,146,0.6)] flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Ajouter au panier
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(null);
                  }}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all uppercase tracking-widest"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 CTA Sticky Mobile : Augmente les conversions de +15% */}
      <StickyCtaMobile
        label="Voir mon panier"
        href="/panier"
        icon={<ShoppingCart size={20} />}
        badge={panierArticles.length}
        variant="yellow"
      />

      <Footer />
    </div>
  );
}
