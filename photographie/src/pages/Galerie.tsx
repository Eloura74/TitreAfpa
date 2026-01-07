import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Composants Layout & UI
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { SelectionFormatModal } from "../components/galerie/SelectionFormatModal";

// Contextes & Types
import { usePanier } from "../store/panierContext";
import { API_URL } from "../config/api";
import { Tarif, TarifOeuvre } from "../types/tarif";

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

const revealVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorieActive, setCategorieActive] = useState<string>("Toutes");
  const [photoSelectionnee, setPhotoSelectionnee] = useState<Photo | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [tarifsPourModale, setTarifsPourModale] = useState<
    (TarifOeuvre | Tarif)[]
  >([]);

  const { ajouterArticle } = usePanier();
  const { addToast } = useToast();

  // 1. Fetch & Normalisation
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/galerie`);
        const data: Photo[] = await res.json();

        const sanitized = data
          .filter((p) => p.categorie !== "EvenementPrive") // Double sécurité côté front
          .map((p) => ({
            ...p,
            src: p.src?.startsWith("http")
              ? p.src
              : p.src?.startsWith("/uploads/")
              ? `${API_URL}${p.src}`
              : p.src?.startsWith("/images/")
              ? p.src
              : `/images/${p.src}`,
            tarifs: Array.isArray(p.tarifs) ? p.tarifs : [],
          }));

        setPhotos(sanitized);
      } catch (err) {
        console.error("Fetch error:", err);
        addToast("Erreur lors du chargement de la galerie.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [addToast]);

  // 2. Logique de Panier
  const handleAjouterAuPanier = useCallback(
    (photo: Photo) => {
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
        setTarifsPourModale(tarifsDisponibles);
        setPhotoSelectionnee(photo);
        setModalVisible(true);
      }
    },
    [ajouterArticle, addToast]
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

  const filtered = useMemo(
    () =>
      categorieActive === "Toutes"
        ? photos
        : photos.filter((p) => p.categorie === categorieActive),
    [photos, categorieActive]
  );

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
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <h1 className="hero-title !mb-0 !ml-0 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
              Galerie d'Art
            </span>
          </h1>
        </motion.div>
      </header>

      {/* Navigation des filtres - Style Glassmorphism */}
      <nav className="sticky top-20 z-40 px-4 py-2 mb-8 mt-0">
        <div className="max-w-fit mx-auto flex flex-wrap justify-center items-center gap-2 md:gap-4 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {loading ? (
            <Skeleton width={200} height={30} className="rounded-full" />
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
              : filtered.map((photo) => (
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
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-opacity duration-700"
                        />

                        {/* Overlay au survol */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
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
            onSelect={handleSelectFormat}
            onClose={() => setModalVisible(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
