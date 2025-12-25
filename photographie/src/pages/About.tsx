import { useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 flex flex-col">
      <Helmet>
        <title>À Propos | Fabien Licata - Photographe</title>
        <meta
          name="description"
          content="Découvrez le parcours et la philosophie de Fabien Licata, photographe professionnel dans le Var. Portraits, événements, studio mobile."
        />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-16"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-thin tracking-[0.2em] uppercase text-yellow-500">
              À Propos
            </h1>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto" />
            <p className="max-w-2xl mx-auto text-gray-400 font-light tracking-wide text-sm md:text-base leading-relaxed">
              Photographe professionnel spécialisé dans les événements, portraits et
              galeries artistiques. Transformez vos souvenirs en véritables œuvres
              d'art.
            </p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Image Section (Left) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-5 relative group"
            >
              <div className="relative overflow-hidden rounded-sm shadow-2xl shadow-black/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <img
                  src="/images/fabien.jpg"
                  alt="Fabien Licata"
                  className="w-full h-[500px] object-cover object-top transform transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                />
                
                {/* Decorative Border */}
                <div className="absolute inset-4 border border-white/10 z-20 pointer-events-none transition-colors duration-500 group-hover:border-yellow-500/30" />
                
                {/* Caption */}
                <div className="absolute bottom-6 left-6 z-20">
                  <p className="text-yellow-500 text-xs tracking-[0.2em] uppercase mb-1">
                    Photographe Professionnel
                  </p>
                  <h3 className="text-2xl font-light text-white tracking-widest uppercase">
                    Fabien Licata
                  </h3>
                </div>
              </div>
              
              {/* Background decorative element */}
              <div className="absolute -top-4 -left-4 w-full h-full border border-yellow-500/10 -z-10 rounded-sm" />
            </motion.div>

            {/* Text Content (Right) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-7 space-y-12"
            >
              {/* Section: Parcours */}
              <div className="space-y-4 relative pl-6 border-l border-yellow-500/20">
                <h2 className="text-lg text-yellow-500 font-normal tracking-[0.15em] uppercase">
                  Mon Parcours
                </h2>
                <p className="text-gray-300 leading-relaxed font-light text-justify">
                  Plongé dans l'univers captivant de la photographie depuis mon plus
                  jeune âge, je suis un photographe passionné établi à{" "}
                  <strong className="text-white font-normal">Pignans dans le Var</strong>.
                  Tantôt reporter-photographe, photographe de mode, photographe
                  animalier, mon métier recouvre une multitude de possibilités !
                </p>
              </div>

              {/* Section: Expertise */}
              <div className="space-y-4 relative pl-6 border-l border-yellow-500/20">
                <h2 className="text-lg text-yellow-500 font-normal tracking-[0.15em] uppercase">
                  Polyvalence & Expertise
                </h2>
                <p className="text-gray-300 leading-relaxed font-light text-justify">
                  En tant que professionnel, je maîtrise l’art d’immortaliser un
                  visage, un sportif en action, une nouvelle marque, un artiste sur
                  scène, un événement festif ou politique (concerts, festivals,
                  compétitions sportives), ou la découverte de votre commune, sans
                  oublier les événements privés (mariage, baptême, repas de famille,
                  etc.).
                </p>
              </div>

              {/* Section: Studio */}
              <div className="space-y-4 relative pl-6 border-l border-yellow-500/20">
                <h2 className="text-lg text-yellow-500 font-normal tracking-[0.15em] uppercase">
                  Studio Mobile
                </h2>
                <p className="text-gray-300 leading-relaxed font-light text-justify">
                  Je pratique également <strong className="text-white font-normal">la photographie de studio</strong>,
                  capturant l'essence d'un portrait seul, d'un duo, ou d'une
                  famille. Mon studio d'art <strong className="text-white font-normal">(celui-ci étant mobile)</strong> est un lieu
                  où la créativité s'épanouit, que ce soit pour des séances de mode,
                  des compositions artistiques destinées à l'exposition, des
                  packshots produits et bien d'autres projets.
                </p>
              </div>

              {/* Quote Block */}
              <div className="relative py-8 px-8 bg-gradient-to-r from-white/5 to-transparent border-l-2 border-yellow-500 rounded-r-sm mt-8">
                <p className="text-gray-200 italic font-light text-lg leading-relaxed relative z-10">
                  "Chaque instant capturé est une histoire à raconter, une émotion à
                  partager. Bienvenue dans mon univers photographique."
                </p>
              </div>

              {/* Section: Prints */}
              <div className="space-y-4 pt-8 border-t border-white/10">
                <h2 className="text-lg text-yellow-500 font-normal tracking-[0.15em] uppercase">
                  Tirages d'Art
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  Offrez-vous des impressions uniques en commandant les tirages de
                  mes photographies. Le prix englobe non seulement les coûts de
                  laboratoire, mais également ma contribution d'artiste,
                  garantissant ainsi une œuvre authentique et exclusive à votre
                  collection.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
