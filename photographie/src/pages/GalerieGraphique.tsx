import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Composants Layout & UI
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

// Contextes & Types
import { usePanier } from "../store/panierContext";
import { API_URL } from "../config/api";

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

const revealVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function GalerieGraphique() {
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]);
  const [loading, setLoading] = useState(true);

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

        const sanitized = data.map((oeuvre: any) => ({
          id: oeuvre._id || oeuvre.id,
          titre: oeuvre.titre,
          image: oeuvre.image?.startsWith("http")
            ? oeuvre.image
            : oeuvre.image?.startsWith("/uploads/")
            ? `${API_URL}${oeuvre.image}`
            : oeuvre.image?.startsWith("/images/")
            ? oeuvre.image
            : `/images/${oeuvre.image || "/placeholder.jpg"}`,
          prix: oeuvre.prix,
          description: oeuvre.description,
        }));

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

  // 2. Logique Panier (Oeuvre unique)
  const handleAjouterAuPanier = (oeuvre: OeuvreGraphique) => {
    ajouterArticle({
      id: crypto.randomUUID(),
      photoId: oeuvre.id,
      nom: `${oeuvre.titre} (Oeuvre Graphique)`,
      prix: oeuvre.prix,
      quantite: 1,
      image: oeuvre.image,
    });
    addToast(`${oeuvre.titre} ajouté au panier`, "success");
  };

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
      <header className="relative pt-20 pb-12 px-6 overflow-hidden z-10">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <h1 className="hero-title !mb-0 !ml-0 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight break-words hyphens-auto">
            <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
              Galerie Graphique
            </span>
          </h1>
        </motion.div>
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
              : oeuvres.map((oeuvre) => (
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
                          src={oeuvre.image}
                          alt={oeuvre.titre}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-opacity duration-700"
                        />

                        {/* Overlay au survol */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
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

      <Footer />
    </div>
  );
}
