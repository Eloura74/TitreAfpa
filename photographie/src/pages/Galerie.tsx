import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { scale: 0.98, opacity: 0, transition: { duration: 0.3 } }
};

const revealVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorieActive, setCategorieActive] = useState<string>("Toutes");
  const [photoSelectionnee, setPhotoSelectionnee] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tarifsPourModale, setTarifsPourModale] = useState<(TarifOeuvre | Tarif)[]>([]);

  const { ajouterArticle } = usePanier();
  const { addToast } = useToast();

  // 1. Fetch & Normalisation
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/galerie`);
        const data: Photo[] = await res.json();

        const sanitized = data.map((p) => ({
          ...p,
          src: p.src?.startsWith("http") ? p.src 
               : p.src?.startsWith("/uploads/") ? `${API_URL}${p.src}`
               : p.src?.startsWith("/images/") ? p.src 
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
  const handleAjouterAuPanier = useCallback((photo: Photo) => {
    const tarifsDisponibles = photo.tarifs && photo.tarifs.length > 0 
      ? photo.tarifs 
      : [{
          id: `def-${photo._id || crypto.randomUUID()}`,
          format: "Standard",
          support: "Papier photo",
          prix: photo.prix || 0,
        }];

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
  }, [ajouterArticle, addToast]);

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

    addToast(`${photoSelectionnee.titre} (${tarif.format}) ajouté au panier`, "success");
    setModalVisible(false);
    setPhotoSelectionnee(null);
  };

  // 4. Mémorisation
  const categories = useMemo(() => 
    ["Toutes", ...Array.from(new Set(photos.map(p => p.categorie)))], 
  [photos]);

  const filtered = useMemo(() => 
    categorieActive === "Toutes" ? photos : photos.filter(p => p.categorie === categorieActive),
  [photos, categorieActive]);

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-yellow-500/30 selection:text-white font-sans">
      <Navbar />

      {/* Header - Style Home.tsx */}
      <header className="relative pt-32 pb-16 px-6 overflow-hidden">
        <motion.div 
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <h1 className="text-3xl md:text-5xl font-extralight tracking-[0.4em] md:tracking-[0.6em] uppercase 
                         bg-gradient-to-b from-white via-yellow-200 to-yellow-500 
                         bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-6">
            Galerie d'Art
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mx-auto mb-6" />
          <p className="text-yellow-500/50 text-xs md:text-sm font-light tracking-[0.3em] uppercase">
            Collection Photographique
          </p>
        </motion.div>
      </header>

      {/* Navigation des filtres - Style épuré */}
      <nav className="sticky top-20 z-40 px-4 py-6 mb-8">
        <div className="max-w-fit mx-auto flex flex-wrap justify-center items-center gap-4 md:gap-8 bg-[#080808]/80 backdrop-blur-md px-8 py-4 rounded-full border border-white/5">
          {loading ? (
            <Skeleton width={200} height={30} className="rounded-full" />
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategorieActive(cat)}
                className={`relative text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 py-2 ${
                  categorieActive === cat 
                    ? "text-yellow-400 font-medium" 
                    : "text-gray-500 hover:text-yellow-200 font-light"
                }`}
              >
                {cat}
                {categorieActive === cat && (
                  <motion.div 
                    layoutId="activeUnderline" 
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Grille principale */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-12 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton height={500} className="rounded-sm" />
                  <Skeleton height={20} width="60%" />
                </div>
              ))
            ) : (
              filtered.map((photo) => (
                <motion.div
                  key={photo._id || photo.id}
                  variants={cardVariants}
                  layout
                  className="group relative flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-[#111]">
                    <motion.img
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    
                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                  </div>

                  {/* Content Section - Minimaliste */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <h3 className="text-lg md:text-xl font-light text-white tracking-[0.2em] uppercase group-hover:text-yellow-200 transition-colors duration-500">
                      {photo.titre}
                    </h3>
                    
                    <div className="w-8 h-[1px] bg-white/10 group-hover:bg-yellow-500/30 transition-colors duration-500" />

                    <p className="text-gray-500 text-[10px] tracking-widest uppercase line-clamp-1">
                      {photo.categorie}
                    </p>

                    <div className="pt-2 flex flex-col items-center gap-3 w-full">
                      <span className="text-yellow-500/80 text-sm font-light tracking-widest">
                        {photo.prix} €
                      </span>
                      
                      <button
                        onClick={() => handleAjouterAuPanier(photo)}
                        className="text-[9px] uppercase tracking-[0.25em] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 transition-all duration-500 hover:bg-white/5 w-full max-w-[200px]"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
