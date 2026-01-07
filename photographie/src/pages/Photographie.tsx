// Import des hooks React pour gérer les effets et le cycle de vie du composant
import { useEffect } from "react";
// Import des composants Link pour la navigation interne sans rechargement de page
import { Link } from "react-router-dom";
// Import d'icônes depuis la bibliothèque lucide-react pour les visuels
import {
  CalendarDays,
  Camera,
  GalleryHorizontal,
  ShoppingCart,
} from "lucide-react";
// Import des composants layout Navbar (barre de navigation) et Footer (pied de page)
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
// Import des images de configuration
import homeImages from "../config/images.json";
// Import du fichier CSS pour le style spécifique de la page d'accueil
import "../styles/home.css";

import { motion } from "framer-motion";

// Variantes d'animation pour l'apparition en cascade
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
    },
  },
};

/**
 * Composant principal de la page "Photographie"
 * Cette page présente l'univers "Photographie" de Fabien avec un contenu immersif,
 * une navigation claire et des liens vers les sections importantes.
 */
export default function Photographie() {
  // useEffect est utilisé ici pour modifier le titre de l'onglet du navigateur quand la page est chargée
  useEffect(() => {
    document.title = "Fabien Photographie";
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une seule fois, au montage

  return (
    // Conteneur principal avec une mise en page en colonne et une hauteur minimale sur tout l'écran
    <div className="home-page min-h-screen flex flex-col bg-[#0a0a10]">
      {/* La Navbar détecte automatiquement l'univers courant (photographie/graphisme) et adapte les liens */}
      <Navbar />
      {/* Conteneur de l'image de fond et de la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <img
          src={homeImages.hero} // Image de fond principale, issue du fichier de config
          alt="Photographe professionnel" // Texte alternatif pour accessibilité
          className="hero-image w-full h-full object-cover opacity-40" // Classe CSS pour le style
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/80 via-transparent to-[#0a0a10]" />
      </div>
      {/* Accent géométrique décoratif */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />
      {/* Contenu principal de la page, centré verticalement et horizontalement */}
      <motion.main
        className="flex flex-col items-center justify-center flex-1 relative z-10 pt-32 pb-20 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Titre principal avec dégradé de couleurs et style responsive */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="hero-title mb-6 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight break-words">
            <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
              Fabien <br className="block sm:hidden" /> Photographie
            </span>
          </h1>

          {/* Paragraphe d’introduction */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Bienvenue dans l’univers <b>Photographie</b> de Fabien. Retrouvez
            ici l’ensemble des services liés à la photo : événements, tirage en
            ligne, galerie artistique et plus encore.
          </p>
          <span className="block mt-4 text-sm text-[#ffe992]/80 uppercase tracking-widest font-medium">
            Sélectionnez un menu ci-dessous
          </span>
        </motion.div>

        {/* Barre de navigation sous forme de grille */}
        <motion.nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
          variants={containerVariants}
        >
          {/* Carte Événements */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="h-full"
          >
            <Link
              to="/evenements"
              className="group h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#ffe992]/20 transition-colors duration-500">
                  <CalendarDays className="w-8 h-8 text-[#d6c487] group-hover:text-[#ffe992] transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ffe992] mb-2 tracking-wide">
                    Événements
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Tous les événements photo à venir et passés.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Carte Services */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="h-full"
          >
            <Link
              to="/services"
              className="group h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#ffe992]/20 transition-colors duration-500">
                  <Camera className="w-8 h-8 text-[#d6c487] group-hover:text-[#ffe992] transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ffe992] mb-2 tracking-wide">
                    Services
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Mariages, shootings, événements...
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Carte Galerie Photo */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="h-full"
          >
            <Link
              to="/galerie"
              className="group h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#ffe992]/20 transition-colors duration-500">
                  <GalleryHorizontal className="w-8 h-8 text-[#d6c487] group-hover:text-[#ffe992] transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ffe992] mb-2 tracking-wide">
                    Galerie Photo
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Découvrez et achetez les œuvres photographiques.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Carte Panier */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="h-full"
          >
            <Link
              to="/panier"
              className="group h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#ffe992]/20 transition-colors duration-500">
                  <ShoppingCart className="w-8 h-8 text-[#d6c487] group-hover:text-[#ffe992] transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ffe992] mb-2 tracking-wide">
                    Panier
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Gérez vos achats et commandes photo.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.nav>
      </motion.main>
      <Footer /> {/* Pied de page */}
    </div>
  );
}
