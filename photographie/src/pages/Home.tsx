import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import homeImages from "../config/images.json";
import { motion } from "framer-motion";

const revealVariants = {
  hidden: { y: "30%", opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 1.2,
      delay: i * 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Home() {
  const navigate = useNavigate();
  const { setChoix } = useAuthStore();
  const [hoveredSide, setHoveredSide] = useState<"photo" | "graph" | null>(null);

  useEffect(() => {
    document.title = "Fabien Licata | Photographe & Graphiste";
  }, []);

  const handleChoix = (choix: "photographie" | "photo-graphiste") => {
    setChoix(choix);
    navigate(choix === "photographie" ? "/galerie" : "/galerie-graphique");
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#080808] overflow-y-auto md:overflow-hidden font-sans text-white">
      
      {/* BACKGROUND : Luminosité ajustée */}
      <motion.div 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.55 }} // Augmenté pour moins d'obscurité
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <img src={homeImages.hero} className="w-full h-full object-cover" alt="Background" />
        {/* Overlays plus doux pour la clarté */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-black/10" /> 
      </motion.div>

      {/* HEADER : Signature Fabien Licata */}
      <header className="absolute top-8 md:top-16 left-0 w-full z-40 flex flex-col items-center pointer-events-none px-6">
        <div className="overflow-hidden">
          <motion.h2
            custom={0}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl md:text-5xl font-extralight tracking-[0.4em] md:tracking-[0.6em] uppercase 
                       bg-gradient-to-b from-white via-yellow-200 to-yellow-500 
                       bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] text-center"
          >
            Fabien Licata
          </motion.h2>
        </div>
        <div className="overflow-hidden mt-2 md:mt-3">
          <motion.p
            custom={1}
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            className="text-[9px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase text-yellow-500/50 font-light text-center"
          >
            Photo-Graphiste / Photographe
          </motion.p>
        </div>
      </header>

      {/* SÉPARATEUR CENTRAL : Réintégré et visible */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block">
         <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "40vh", opacity: 0.6 }} // Plus visible
            transition={{ delay: 1, duration: 1.5 }}
            className="w-[1px] bg-gradient-to-b from-transparent via-yellow-500 to-transparent shadow-[0_0_10px_rgba(234,179,8,0.3)]" 
         />
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-[100dvh]">
        
        {/* SECTION PHOTOGRAPHIE */}
        <motion.section
          onMouseEnter={() => setHoveredSide("photo")}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleChoix("photographie")}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center transition-all duration-700 py-20 md:py-0 border-b border-white/5 md:border-none"
        >
          <div className={`transition-all duration-1000 ease-in-out text-center px-4
            ${hoveredSide === "graph" ? "md:opacity-25 md:scale-[0.98] md:blur-[1px]" : "opacity-100 scale-100 blur-0"}`}>
            
            <div className="overflow-hidden mb-2">
              <motion.span custom={2} variants={revealVariants} initial="hidden" animate="visible"
                className="block text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium">
                Art Visuel
              </motion.span>
            </div>
            
            <div className="overflow-hidden mb-4">
              <motion.h1 custom={3} variants={revealVariants} initial="hidden" animate="visible"
                className="text-3xl md:text-4xl lg:text-7xl font-light tracking-[0.2em] md:tracking-[0.25em] uppercase 
                           bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                           drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]">
                Photographie
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.p custom={4} variants={revealVariants} initial="hidden" animate="visible"
                className="text-gray-400 text-[10px] md:text-sm italic font-extralight tracking-widest">
                "Capturer l'instant, sublimer le réel"
              </motion.p>
            </div>

            <motion.div custom={5} variants={revealVariants} initial="hidden" animate="visible"
              className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-100/40">
              <span>Événements</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Tirage en ligne</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Galerie</span>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION GRAPHISME */}
        <motion.section
          onMouseEnter={() => setHoveredSide("graph")}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleChoix("photo-graphiste")}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center transition-all duration-700 py-20 md:py-0"
        >
          <div className={`transition-all duration-1000 ease-in-out text-center px-4
            ${hoveredSide === "photo" ? "md:opacity-25 md:scale-[0.98] md:blur-[1px]" : "opacity-100 scale-100 blur-0"}`}>
            
            <div className="overflow-hidden mb-2">
              <motion.span custom={2} variants={revealVariants} initial="hidden" animate="visible"
                className="block text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium">
                Design Numérique
              </motion.span>
            </div>

            <div className="overflow-hidden mb-4">
              <motion.h1 custom={3} variants={revealVariants} initial="hidden" animate="visible"
                className="text-3xl md:text-4xl lg:text-7xl font-light tracking-[0.2em] md:tracking-[0.25em] uppercase 
                           bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                           drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]">
                Graphisme
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.p custom={4} variants={revealVariants} initial="hidden" animate="visible"
                className="text-gray-400 text-[10px] md:text-sm italic font-extralight tracking-widest">
                "L'imaginaire au service de votre image"
              </motion.p>
            </div>

            <motion.div custom={5} variants={revealVariants} initial="hidden" animate="visible"
              className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-100/40">
              <span>Identité</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Galerie Graphique</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>À Propos</span>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-4 md:bottom-10 w-full px-6 md:px-16 z-30 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 opacity-50 md:opacity-30 hover:opacity-100 transition-opacity duration-1000 pointer-events-none md:pointer-events-auto">
        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-extralight">© 2025 Fabien Licata</p>
        <div className="flex gap-8 md:gap-12 text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-extralight pointer-events-auto">
          <a href="#" className="hover:text-yellow-400 transition-colors">Instagram</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}