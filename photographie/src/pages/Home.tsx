import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import homeImages from "../config/images.json";
import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import GoldDust from "../components/GoldDust";
import ContactFooter from "./ContactFooter";
import CoverflowCarousel from "../components/CoverflowCarousel";
import { API_URL } from "../config/api";
import { getWatermarkedImageUrl } from "../utils/cloudinaryUtils";

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
  const [isPC, setIsPC] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // États pour les images dynamiques
  const [dynamicPhotoImages, setDynamicPhotoImages] = useState<string[]>([]);
  const [dynamicGraphismeImages, setDynamicGraphismeImages] = useState<
    string[]
  >([]);

  // --- CONFIGURATION PARALLAXE ---
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const windowSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    windowSize.current = { w: window.innerWidth, h: window.innerHeight };

    const handleResize = () => {
      windowSize.current = { w: window.innerWidth, h: window.innerHeight };
      // Vérifier si l'appareil est un PC (a le survol et un grand écran)
      const hasHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;
      const isLargeScreen = window.innerWidth >= 1024;
      setIsPC(hasHover && isLargeScreen);
    };

    // Vérification initiale
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- RÉCUPÉRATION DES IMAGES DYNAMIQUES ---
  useEffect(() => {
    // Optimisation : ne charger les images du carrousel que sur PC
    if (!isPC && window.innerWidth < 1024) return;

    const fetchImages = async () => {
      try {
        // 1. Photographie
        const resPhoto = await fetch(`${API_URL}/api/galerie`);
        if (resPhoto.ok) {
          const dataPhoto = await resPhoto.json();
          const images = dataPhoto
            .filter((p: any) => p.categorie !== "EvenementPrive")
            .map((p: any) => {
              if (p.src?.startsWith("http")) return p.src;
              if (p.src?.startsWith("/uploads/")) return `${API_URL}${p.src}`;
              if (p.src?.startsWith("/images/")) return p.src;
              return getWatermarkedImageUrl(`/images/${p.src}`);
            });
          setDynamicPhotoImages(images);
        }

        // 2. Graphisme
        const resGraph = await fetch(`${API_URL}/api/oeuvres-graphique`);
        if (resGraph.ok) {
          const dataGraph = await resGraph.json();
          const images = dataGraph.map((oeuvre: any) => {
            if (oeuvre.image?.startsWith("http")) return oeuvre.image;
            if (oeuvre.image?.startsWith("/uploads/"))
              return `${API_URL}${oeuvre.image}`;
            if (oeuvre.image?.startsWith("/images/")) return oeuvre.image;
            return getWatermarkedImageUrl(
              `/images/${oeuvre.image || "/placeholder.jpg"}`
            );
          });
          setDynamicGraphismeImages(images);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des images pour le carrousel:",
          error
        );
      }
    };

    fetchImages();
  }, [isPC]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { w, h } = windowSize.current;
    // Normaliser entre -1 et 1
    const x = (clientX / w) * 2 - 1;
    const y = (clientY / h) * 2 - 1;
    setMousePosition({ x, y });
  };

  // Valeurs de parallaxe (inversées pour la profondeur)
  const parallaxX = shouldReduceMotion ? 0 : mousePosition.x * -15;
  const parallaxY = shouldReduceMotion ? 0 : mousePosition.y * -15;

  useEffect(() => {
    document.title = "Fabien Licata | Photographe & Graphiste";
  }, []);

  const handleChoix = (choix: "photographie" | "photo-graphiste") => {
    setChoix(choix);
    navigate(choix === "photographie" ? "/photographie" : "/graphisme");
  };

  return (
    <div
      className="relative min-h-[100dvh] w-full bg-[#080808] overflow-y-auto md:overflow-hidden font-sans text-white"
      onMouseMove={handleMouseMove}
    >
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

      {/* PARTICULES D'OR */}
      {!shouldReduceMotion && <GoldDust />}

      {/* ARRIÈRE-PLAN : Luminosité ajustée + PARALLAXE */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 0.55,
          x: parallaxX,
          y: parallaxY,
        }}
        transition={{
          scale: { duration: 2.5, ease: "easeOut" },
          opacity: { duration: 2.5, ease: "easeOut" },
          x: { type: "spring", stiffness: 50, damping: 20 },
          y: { type: "spring", stiffness: 50, damping: 20 },
        }}
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

      {/* OVERLAY SPOTLIGHT (au-dessus du background, sous le contenu) */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        <div
          className={`
            absolute inset-0 transition-opacity duration-700
            ${hoveredSide ? "opacity-100" : "opacity-0"}
          `}
        />
        <div
          className={`
            absolute inset-0
            ${
              hoveredSide === "photo"
                ? "bg-[radial-gradient(60%_40%_at_25%_30%,rgba(212,175,55,0.18),transparent_60%)]"
                : hoveredSide === "graph"
                ? "bg-[radial-gradient(60%_40%_at_75%_30%,rgba(212,175,55,0.18),transparent_60%)]"
                : hoveredSide === "ecrin"
                ? "bg-[radial-gradient(60%_45%_at_50%_78%,rgba(212,175,55,0.18),transparent_60%)]"
                : ""
            }
            transition-all duration-700
          `}
        />
      </div>

      {/* EN-TÊTE : Signature Fabien Licata */}
      <header className="absolute top-2 md:top-2 left-0 w-full z-40 flex justify-center items-center pointer-events-none px-6">
        <div className="overflow-hidden">
          <img
            src={"/images/logoHome.png"}
            alt="Logo"
            className="w-48 h-auto md:w-80 lg:w-96 object-contain drop-shadow-2xl"
          />
        </div>
      </header>

      {/* SÉPARATEUR VERTICAL (Entre Photo et Graphisme) */}
      <div className="absolute left-1/2 top-0 bottom-[40vh] -translate-x-1/2 z-20 pointer-events-none hidden md:block">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "100%",
            opacity: hoveredSide ? 0.65 : 0.35,
            filter: hoveredSide
              ? "drop-shadow(0 0 10px rgba(212,175,55,0.35))"
              : "none",
          }}
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
          animate={{ scale: [1, 20], opacity: [0.5, 0] }}
          transition={{
            delay: 2.0,
            duration: 3,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="absolute inset-0 bg-yellow-500/30 rotate-45 rounded-sm"
        />

        {/* Point central */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: hoveredSide ? 1.15 : 1,
            boxShadow: hoveredSide
              ? "0 0 22px rgba(212,175,55,0.75)"
              : "0 0 12px rgba(212,175,55,0.45)",
            opacity: 1,
          }}
          transition={{
            delay: 1.2,
            duration: 0.8,
            ease: "backOut",
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
          className="relative w-1.5 h-1.5 bg-yellow-500 rotate-45 z-10"
        />
      </div>

      {/* CONTENU PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col md:flex-row md:flex-wrap min-h-[100dvh] md:h-[100dvh] pt-40 pb-24 md:pt-0 md:pb-0"
      >
        {/* SECTION PHOTOGRAPHIE (Haut Gauche) */}
        <motion.section
          onMouseEnter={() => setHoveredSide("photo")}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleChoix("photographie")}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center md:justify-start md:pt-[20vh] py-10 md:py-0 w-full md:w-1/2 md:h-[60vh]"
        >
          {/* Overlay d'assombrissement si non survolé */}
          <div
            className={`
              absolute inset-0 pointer-events-none transition-opacity duration-700
              ${
                hoveredSide && hoveredSide !== "photo"
                  ? "opacity-35"
                  : "opacity-0"
              }
              bg-black
            `}
          />

          {/* CARROUSEL PHOTOGRAPHIE */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }}
            animate={
              isPC && hoveredSide === "photo" && dynamicPhotoImages.length > 0
                ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 -translate-x-1/2 top-[80%] z-10"
          >
            <CoverflowCarousel
              images={dynamicPhotoImages}
              isVisible={true} // Géré par le motion.div parent
              className="" // Position gérée par le parent
            />
            {/* Halo discret derrière le carrousel */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(closest-side,rgba(212,175,55,0.14),transparent)] blur-xl" />
          </motion.div>

          <div
            className={`relative z-20 pointer-events-none transition-all duration-1000 ease-in-out text-center px-4
            ${
              hoveredSide === "graph" || hoveredSide === "ecrin"
                ? "md:scale-[0.98]" // Plus de blur, juste scale
                : "scale-100"
            }`}
          >
            <div className="overflow-hidden mb-2">
              <motion.span
                custom={2}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block pointer-events-auto text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium font-syncopate"
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
                className={`pointer-events-auto text-3xl md:text-2xl lg:text-6xl font-normal uppercase font-playfair-sc
                  transition-all duration-700
                  ${
                    hoveredSide === "photo"
                      ? "tracking-[0.26em] drop-shadow-[0_0_14px_rgba(212,175,55,0.18)]"
                      : "tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
                  }
                  bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                `}
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
                className="pointer-events-auto text-gray-400 text-[10px] md:text-sm italic font-extralight tracking-widest font-playfair"
              >
                "Capturer l'instant, sublimer le réel"
              </motion.p>
            </div>

            <motion.div
              custom={5}
              variants={revealVariants}
              initial="hidden"
              animate="visible"
              className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-100/40 font-syncopate"
            >
              <span>Événements</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Galerie</span>
              <span className="hidden md:block w-[1px] h-3 bg-yellow-700/40" />
              <span>Services (Mariages, Studio, Shootings, …)</span>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION GRAPHISME (Haut Droite) */}
        <motion.section
          onMouseEnter={() => setHoveredSide("graph")}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleChoix("photo-graphiste")}
          className="relative flex flex-1 cursor-pointer flex-col items-center justify-center md:justify-start md:pt-[20vh] py-10 md:py-0 w-full md:w-1/2 md:h-[60vh]"
        >
          {/* Overlay d'assombrissement si non survolé */}
          <div
            className={`
              absolute inset-0 pointer-events-none transition-opacity duration-700
              ${
                hoveredSide && hoveredSide !== "graph"
                  ? "opacity-35"
                  : "opacity-0"
              }
              bg-black
            `}
          />

          {/* CARROUSEL GRAPHISME */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }}
            animate={
              isPC &&
              hoveredSide === "graph" &&
              dynamicGraphismeImages.length > 0
                ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 -translate-x-1/2 top-[80%] z-10"
          >
            <CoverflowCarousel
              images={dynamicGraphismeImages}
              isVisible={true}
              className=""
            />
            {/* Halo discret derrière le carrousel */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(closest-side,rgba(212,175,55,0.14),transparent)] blur-xl" />
          </motion.div>

          <div
            className={`relative z-20 pointer-events-none transition-all duration-1000 ease-in-out text-center px-4
            ${
              hoveredSide === "photo" || hoveredSide === "ecrin"
                ? "md:scale-[0.98]"
                : "scale-100"
            }`}
          >
            <div className="overflow-hidden mb-2">
              <motion.span
                custom={2}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block pointer-events-auto text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium font-syncopate"
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
                className={`pointer-events-auto text-3xl md:text-4xl lg:text-6xl font-normal uppercase font-playfair-sc
                  transition-all duration-700
                  ${
                    hoveredSide === "graph"
                      ? "tracking-[0.26em] drop-shadow-[0_0_14px_rgba(212,175,55,0.18)]"
                      : "tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
                  }
                  bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                `}
              >
                PHOTO-GRAPHISME
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.p
                custom={4}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="pointer-events-auto text-gray-400 text-[10px] md:text-sm italic font-extralight tracking-widest font-playfair"
              >
                "L'imaginaire au service de votre image"
              </motion.p>
            </div>

            <motion.div
              custom={5}
              variants={revealVariants}
              initial="hidden"
              animate="visible"
              className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-100/40 font-syncopate"
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
          {/* Overlay d'assombrissement si non survolé */}
          <div
            className={`
              absolute inset-0 pointer-events-none transition-opacity duration-700
              ${
                hoveredSide && hoveredSide !== "ecrin"
                  ? "opacity-35"
                  : "opacity-0"
              }
              bg-black
            `}
          />

          <div
            className={`transition-all duration-1000 ease-in-out text-center px-4
            ${
              hoveredSide === "photo" || hoveredSide === "graph"
                ? "md:scale-[0.98]"
                : "scale-100"
            }`}
          >
            <div className="overflow-hidden mb-2">
              <motion.span
                custom={6}
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                className="block pointer-events-auto text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-yellow-500/70 font-medium font-syncopate"
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
                className={`pointer-events-auto text-3xl md:text-4xl lg:text-6xl font-normal uppercase font-playfair-sc
                  transition-all duration-700
                  ${
                    hoveredSide === "ecrin"
                      ? "tracking-[0.26em] drop-shadow-[0_0_14px_rgba(212,175,55,0.18)]"
                      : "tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
                  }
                  bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent
                `}
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
                className="pointer-events-auto text-gray-400 text-[10px] md:text-xs italic font-extralight tracking-widest max-w-md mx-auto font-playfair"
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
              className="pointer-events-auto"
            >
              <button
                onClick={() => navigate("/connexion")}
                className="group relative px-8 py-3 overflow-hidden rounded-xl transition-all duration-500"
              >
                {/* Sheen effect */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-[linear-gradient(110deg,transparent,rgba(255,235,160,0.18),transparent)] translate-x-[-60%] group-hover:translate-x-[60%]
                  duration-[900ms] ease-out pointer-events-none"
                />
                <div className="absolute inset-0 border border-yellow-500/30 group-hover:border-yellow-500/70 transition-colors duration-500" />
                <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-colors duration-500" />
                <span
                  className="relative text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500
                bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent font-syncopate"
                >
                  Se connecter
                </span>
              </button>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>

      {/* FOOTER */}
      <ContactFooter />

      {/* INDICATEUR MOBILE (3 points) */}
      <div className="md:hidden fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
      </div>
    </div>
  );
}
