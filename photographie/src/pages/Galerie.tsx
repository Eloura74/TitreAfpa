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

// --- Variantes d'animation ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } 
  },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.3 } }
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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-[#d6c487] selection:text-black">
      <Navbar />

      {/* Header avec profondeur et éclat doré */}
      <header className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(214,196,135,0.15),transparent_70%)]" />
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-8xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-[#d6c487] to-[#8a7a4a]">
            Galerie d'Art
          </h1>
          <div className="h-1 w-24 bg-[#d6c487] mx-auto mb-6 rounded-full shadow-[0_0_15px_#d6c487]" />
          <p className="text-[#d6c487] text-lg md:text-xl font-light tracking-[0.2em] uppercase italic">
            L'excellence photographique pour votre intérieur
          </p>
        </motion.div>
      </header>

      {/* Navigation des filtres dorée */}
      <nav className="sticky top-24 z-40 px-4 py-8">
        <div className="max-w-fit mx-auto bg-[#1a1a25]/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-wrap justify-center items-center gap-2">
          {loading ? (
            <Skeleton width={200} height={40} className="rounded-xl" />
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategorieActive(cat)}
                className={`relative px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                  categorieActive === cat ? "text-black" : "text-gray-400 hover:text-[#d6c487]"
                }`}
              >
                {categorieActive === cat && (
                  <motion.div 
                    layoutId="activeGlow" 
                    className="absolute inset-0 bg-gradient-to-r from-[#d6c487] to-[#ffe992] rounded-xl shadow-[0_0_20px_rgba(214,196,135,0.4)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Grille principale */}
      <main className="max-w-[1400px] mx-auto px-8 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton height={400} className="rounded-3xl" />
                  <Skeleton height={30} width="60%" />
                </div>
              ))
            ) : (
              filtered.map((photo) => (
                <motion.div
                  key={photo._id || photo.id}
                  variants={cardVariants}
                  layout
                  className="group relative bg-[#12121a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#d6c487]/40 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(214,196,135,0.15)]"
                >
                  {/* Image Section */}
                  <div className="relative h-[450px] overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 1.2, ease: "circOut" }}
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />
                    
                    {/* Badge Catégorie Doré */}
                    <div className="absolute top-6 left-6">
                      <span className="bg-[#d6c487] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        {photo.categorie}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="absolute bottom-0 inset-x-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#ffe992] transition-colors">
                          {photo.titre}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-1 italic">
                          {photo.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[#ffe992] text-2xl font-black drop-shadow-md">
                          {photo.prix}€
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAjouterAuPanier(photo)}
                      className="w-full mt-4 bg-white/5 hover:bg-gradient-to-r hover:from-[#d6c487] hover:to-[#ffe992] hover:text-black py-4 rounded-2xl border border-white/10 hover:border-transparent transition-all duration-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 group/btn shadow-xl"
                    >
                      Ajouter à la collection
                      <div className="w-6 h-px bg-current group-hover/btn:w-10 transition-all duration-500" />
                    </button>
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
