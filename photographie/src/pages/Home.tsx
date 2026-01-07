import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import homeImages from "../config/images.json";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

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
  const [hoveredSide, setHoveredSide] = useState<
    "photo" | "graph" | "ecrin" | null
  >(null);

  useEffect(() => {
    document.title = "Fabien Licata | Photographe & Graphiste";
  }, []);

  const handleChoix = (choix: "photographie" | "photo-graphiste") => {
    setChoix(choix);
    navigate(choix === "photographie" ? "/photographie" : "/graphisme");
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#080808] overflow-y-auto md:overflow-hidden font-sans text-white">
      <Helmet>
        <title>Accueil | Fabien Licata</title>
        <meta
          name="description"
          content="Bienvenue sur le portfolio de Fabien Licata. Explorez l'univers de la photographie d'art et du design graphique. Tirages limités et créations sur mesure."
        />
        <meta
          property="og:title"
          content="Fabien Licata | Photographe & Graphiste"
        />
        <meta
          property="og:description"
          content="Bienvenue sur le portfolio de Fabien Licata. Explorez l'univers de la photographie d'art et du design graphique."
        />
        <meta property="og:image" content={homeImages.hero} />
      </Helmet>

      {/* BACKGROUND : Luminosité ajustée */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.55 }} // Augmenté pour moins d'obscurité
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <img
          src={homeImages.hero}
          className="w-full h-full object-cover"
          alt="Background"
        />
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

      {/* SÉPARATEUR VERTICAL (Entre Photo et Graphisme) */}
      <div className="absolute left-1/2 top-0 bottom-[40vh] -translate-x-1/2 z-20 pointer-events-none hidden md:block">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "100%", opacity: 0.4 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
          className="w-[1px] h-full bg-gradient-to-b from-transparent via-yellow-500/50 to-yellow-500/80"
        />
      </div>

      {/* SÉPARATEUR HORIZONTAL (Au dessus de l'Écrin Privé) */}
      <div className="absolute left-0 right-0 top-[60vh] z-20 pointer-events-none hidden md:block">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.4 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent"
        />
      </div>

      {/* POINT D'INTERSECTION (Diamant central) */}
      <div className="absolute left-1/2 top-[60vh] -translate-x-1/2 -translate-y-1/2 z-30 hidden md:block">
        {/* Onde d'animation */}
        <motion.div
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 4], opacity: [0.6, 0] }}
          transition={{
            delay: 2.0,
            duration: 2,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute inset-0 bg-yellow-500/50 rotate-45 rounded-sm"
        />

        {/* Point central */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "backOut" }}
          className="relative w-1.5 h-1.5 bg-yellow-500 rotate-45 shadow-[0_0_15px_rgba(234,179,8,1)] z-10"
        />
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 flex flex-col md:flex-row md:flex-wrap h-[100dvh]">
        {/* SECTION PHOTOGRAPHIE (Haut Gauche) */}
        <motion.section
          onMouseEnter={() => setHoveredSide("photo")}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleChoix("photographie")}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center transition-all duration-700 py-10 md:py-0 w-full md:w-1/2 md:h-[60vh]"
        >
          <div
            className={`transition-all duration-1000 ease-in-out text-center px-4
            ${
              hoveredSide === "graph" || hoveredSide === "ecrin"
                ? "md:opacity-25 md:scale-[0.98] md:blur-[1px]"
                : "opacity-100 scale-100 blur-0"
            }`}
          >
            <div className="overflow-hidden mb-2">
              <motion.span
                custom={2}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium"
              >
                Art Visuel
              </motion.span>
            </div>

            <div className="overflow-hidden mb-4">
              <motion.h1
                custom={3}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="text-3xl md:text-4xl lg:text-7xl font-light tracking-[0.2em] md:tracking-[0.25em] uppercase 
                           bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                           drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
              >
                Photographie
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.p
                custom={4}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="text-gray-400 text-[10px] md:text-sm italic font-extralight tracking-widest"
              >
                "Capturer l'instant, sublimer le réel"
              </motion.p>
            </div>

            <motion.div
              custom={5}
              variants={revealVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-100/40"
            >
              <span>Événements</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Tirage en ligne</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Galerie</span>

              {/* retour à la ligne forcé */}
              <div className="w-full" />

              <span>Services (Mariages, Studio, Shootings, …)</span>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION GRAPHISME (Haut Droite) */}
        <motion.section
          onMouseEnter={() => setHoveredSide("graph")}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleChoix("photo-graphiste")}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center transition-all duration-700 py-10 md:py-0 w-full md:w-1/2 md:h-[60vh]"
        >
          <div
            className={`transition-all duration-1000 ease-in-out text-center px-4
            ${
              hoveredSide === "photo" || hoveredSide === "ecrin"
                ? "md:opacity-25 md:scale-[0.98] md:blur-[1px]"
                : "opacity-100 scale-100 blur-0"
            }`}
          >
            <div className="overflow-hidden mb-2">
              <motion.span
                custom={2}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium"
              >
                Design Numérique
              </motion.span>
            </div>

            <div className="overflow-hidden mb-4">
              <motion.h1
                custom={3}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="text-3xl md:text-4xl lg:text-7xl font-light tracking-[0.2em] md:tracking-[0.25em] uppercase 
                           bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                           drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
              >
                Graphisme
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.p
                custom={4}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="text-gray-400 text-[10px] md:text-sm italic font-extralight tracking-widest"
              >
                "L'imaginaire au service de votre image"
              </motion.p>
            </div>

            <motion.div
              custom={5}
              variants={revealVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-100/40"
            >
              <span>Identité</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Galerie Graphique</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>À Propos</span>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION L'ÉCRIN PRIVÉ (Bas Centre) */}
        <motion.section
          onMouseEnter={() => setHoveredSide("ecrin")}
          onMouseLeave={() => setHoveredSide(null)}
          className="relative flex w-full md:w-full cursor-default flex-col items-center justify-start md:justify-center transition-all duration-700 py-10 md:py-0 md:h-[40vh]"
        >
          <div
            className={`transition-all duration-1000 ease-in-out text-center px-4
            ${
              hoveredSide === "photo" || hoveredSide === "graph"
                ? "md:opacity-25 md:scale-[0.98] md:blur-[1px]"
                : "opacity-100 scale-100 blur-0"
            }`}
          >
            <div className="overflow-hidden mb-2">
              <motion.span
                custom={6}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium"
              >
                Espace Client
              </motion.span>
            </div>

            <div className="overflow-hidden mb-4">
              <motion.h1
                custom={7}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="text-2xl md:text-3xl lg:text-5xl font-light tracking-[0.2em] md:tracking-[0.25em] uppercase 
                           bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent
                           drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
              >
                L'Écrin Privé
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6">
              <motion.p
                custom={8}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="text-gray-400 text-[10px] md:text-xs italic font-extralight tracking-widest max-w-md mx-auto"
              >
                "Accédez à vos reportages privés et sélectionnez vos souvenirs
                d'exception"
              </motion.p>
            </div>

            <motion.div
              custom={9}
              variants={revealVariants}
              initial="hidden"
              animate="visible"
            >
              <button
                onClick={() => navigate("/connexion")}
                className="group relative px-8 py-3 overflow-hidden rounded-sm transition-all duration-500"
              >
                <div className="absolute inset-0 border border-yellow-500/30 group-hover:border-yellow-500/80 transition-colors duration-500" />
                <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-colors duration-500" />
                <span className="relative text-yellow-500 text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500">
                  Se connecter
                </span>
              </button>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-4 md:bottom-10 w-full px-6 md:px-16 z-30 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 opacity-50 md:opacity-30 hover:opacity-100 transition-opacity duration-1000 pointer-events-none md:pointer-events-auto">
        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-extralight">
          © 2025 Fabien Licata
        </p>
        <div className="flex gap-8 md:gap-12 text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-extralight pointer-events-auto">
          <a href="#" className="hover:text-yellow-400 transition-colors">
            Instagram
          </a>
          <a href="#" className="hover:text-yellow-400 transition-colors">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
