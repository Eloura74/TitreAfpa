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
          image: oeuvre.image?.startsWith("http") ? oeuvre.image 
               : oeuvre.image?.startsWith("/uploads/") ? `${API_URL}${oeuvre.image}`
               : oeuvre.image?.startsWith("/images/") ? oeuvre.image 
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
    <div className="min-h-screen bg-[#080808] text-white selection:bg-yellow-500/30 selection:text-white font-sans">
      <Navbar />

      {/* Header */}
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
            Galerie Graphique
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mx-auto mb-6" />
          <p className="text-yellow-500/50 text-xs md:text-sm font-light tracking-[0.3em] uppercase">
            Créations Numériques Uniques
          </p>
        </motion.div>
      </header>

      {/* Grille principale */}
      <main className="max-w-[1800px] mx-auto px-6 md:px-8 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
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
              oeuvres.map((oeuvre) => (
                <motion.div
                  key={oeuvre.id}
                  variants={cardVariants}
                  layout
                  className="group relative flex flex-col"
                >
                  {/* Image Section avec Overlay */}
                  <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-[#111] rounded-2xl shadow-lg border border-white/10 group-hover:shadow-2xl group-hover:border-white/20 transition-all duration-500">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      src={oeuvre.image}
                      alt={oeuvre.titre}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    
                    {/* Overlay au survol avec Bouton */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAjouterAuPanier(oeuvre);
                        }}
                        className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500
                                   bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 
                                   text-white text-[10px] uppercase tracking-[0.25em] px-8 py-4 
                                   hover:scale-105 active:scale-95"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Content Section - Épuré */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex flex-col items-center gap-1">
                      <h3 className="text-base md:text-lg font-light text-white tracking-[0.2em] uppercase group-hover:text-yellow-200 transition-colors duration-500">
                        {oeuvre.titre}
                      </h3>
                      {oeuvre.description && (
                        <span className="text-gray-500 text-[10px] tracking-widest uppercase line-clamp-1">
                          {oeuvre.description}
                        </span>
                      )}
                    </div>

                    <div className="w-6 h-[1px] bg-white/5 group-hover:bg-yellow-500/20 transition-colors duration-500 my-2" />

                    <span className="text-yellow-500/80 text-xs font-light tracking-widest">
                      {oeuvre.prix} €
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
