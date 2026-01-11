// Import des hooks React et des composants nécessaires
import { useEffect } from "react"; // useEffect pour gérer les effets de bord (ex: titre page)
import { Link } from "react-router-dom"; // Pour la navigation entre pages via des liens
import Navbar from "../components/layout/navbar"; // Barre de navigation en haut
import {
  CalendarDays,
  GalleryHorizontal,
  ShoppingCart,
  Info,
} from "lucide-react"; // Icônes visuelles utilisées
import Footer from "../components/layout/Footer"; // Pied de page
import homeImages from "../config/images.json"; // Images statiques importées depuis un fichier JSON
import "../styles/home.css"; // Styles spécifiques à cette page

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
 * Composant principal de la page "Graphisme"
 * - Affiche une page immersive dédiée à la section graphisme de Fabien
 * - Comprend une navbar, un fond image, des liens vers différentes sections et un footer
 */
export default function Graphisme() {
  // useEffect sert ici à modifier le titre affiché dans l'onglet du navigateur
  useEffect(() => {
    document.title = "Fabien Graphiste";
  }, []); // [] = exécute une seule fois au chargement du composant

  return (
    // Conteneur principal, flex colonne, hauteur minimum égale à la hauteur écran
    <div className="home-page min-h-screen flex flex-col bg-[#0a0a10]">
      {/* Barre de navigation fixe en haut */}
      {/* La Navbar détecte automatiquement l'univers courant (graphisme/photographie) et adapte les liens */}
      <Navbar />

      {/* Conteneur pour l'image de fond et la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <img
          src={homeImages.hero} // Source de l'image issue du JSON
          alt="Fabien graphiste" // Texte alternatif pour accessibilité
          className="hero-image w-full h-full object-cover opacity-40" // Classe CSS pour styliser l'image
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/80 via-transparent to-[#0a0a10]" />
      </div>

      {/* Décorations graphiques : accent géométrique et ligne diagonale */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* Contenu principal centré verticalement et horizontalement */}
      <motion.main
        className="flex flex-col items-center justify-center flex-1 relative z-10 pt-32 pb-20 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Titre principal avec un effet de dégradé de couleurs */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1
            className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal uppercase font-playfair-sc
                       tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
          >
            <span className="bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent">
              Le Photo-Graphisme
            </span>
          </h1>

          {/* Paragraphe de présentation, avec styles responsives */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Bienvenue dans l’univers <b>Graphisme</b> de Fabien. Retrouvez ici
            les services dédiés à la création graphique&nbsp;: événements,
            galerie graphique, projets exclusifs…
          </p>
          <span className="block mt-4 text-sm text-[#ffe992]/80 uppercase tracking-widest font-medium">
            Sélectionnez un menu ci-dessous
          </span>
        </motion.div>

        {/* Navigation principale sous forme de grille responsive */}
        <motion.nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
          variants={containerVariants}
        >
          {/* Chaque Link correspond à un bouton qui mène à une page spécifique */}

          {/* Bouton vers la page des événements graphiques */}
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
                    Ateliers et événements graphiques à venir.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Bouton vers la galerie graphique */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="h-full"
          >
            <Link
              to="/galerie-graphique"
              className="group h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#ffe992]/20 transition-colors duration-500">
                  <GalleryHorizontal className="w-8 h-8 text-[#d6c487] group-hover:text-[#ffe992] transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ffe992] mb-2 tracking-wide">
                    Galerie graphique
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Œuvres uniques, prix individuel pour chaque création.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Bouton vers le panier */}
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
                    Gérez vos achats graphiques.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Bouton vers la page "À propos" */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="h-full"
          >
            <Link
              to="/about"
              className="group h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#ffe992]/20 transition-colors duration-500">
                  <Info className="w-8 h-8 text-[#d6c487] group-hover:text-[#ffe992] transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#ffe992] mb-2 tracking-wide">
                    A propos
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Plus d’informations sur moi.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.nav>
      </motion.main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
