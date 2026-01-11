// Import des hooks React et des composants nécessaires
import { useEffect, useState } from "react"; // useEffect pour gérer les effets de bord (ex: titre page)
import { Link } from "react-router-dom"; // Pour la navigation entre pages via des liens
import Navbar from "../components/layout/navbar"; // Barre de navigation en haut
import {
  CalendarDays,
  GalleryHorizontal,
  ShoppingCart,
  Info,
  Camera,
} from "lucide-react"; // Icônes visuelles utilisées
import Footer from "../components/layout/Footer"; // Pied de page
import homeImages from "../config/images.json"; // Images statiques importées depuis un fichier JSON
import "../styles/home.css"; // Styles spécifiques à cette page

import { motion } from "framer-motion";
import { API_URL } from "../config/api";
import { getWatermarkedImageUrl } from "../utils/cloudinaryUtils";

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
  // États pour stocker les images dynamiques depuis la BDD
  const [galerieGraphImage, setGalerieGraphImage] = useState<string>("/images/oeuvre1.png");
  const [eventImage, setEventImage] = useState<string>("/images/event2.jpg");
  
  // useEffect sert ici à modifier le titre affiché dans l'onglet du navigateur
  useEffect(() => {
    document.title = "Fabien Graphiste";
  }, []); // [] = exécute une seule fois au chargement du composant
  
  // Récupération d'une image aléatoire depuis la base de données
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Récupérer une image aléatoire de la galerie graphique
        const resGraph = await fetch(`${API_URL}/api/oeuvres-graphique`);
        if (resGraph.ok) {
          const dataGraph = await resGraph.json();
          if (dataGraph.length > 0) {
            const randomOeuvre = dataGraph[Math.floor(Math.random() * dataGraph.length)];
            let imageUrl = "/images/oeuvre1.png";
            if (randomOeuvre.image?.startsWith("http")) imageUrl = randomOeuvre.image;
            else if (randomOeuvre.image?.startsWith("/uploads/")) imageUrl = `${API_URL}${randomOeuvre.image}`;
            else if (randomOeuvre.image?.startsWith("/images/")) imageUrl = randomOeuvre.image;
            else imageUrl = getWatermarkedImageUrl(`/images/${randomOeuvre.image || "oeuvre1.png"}`);
            setGalerieGraphImage(imageUrl);
          }
        }
        
        // Récupérer une image aléatoire des événements si disponible
        const resEvents = await fetch(`${API_URL}/api/evenements`);
        if (resEvents.ok) {
          const dataEvents = await resEvents.json();
          if (dataEvents.length > 0) {
            const randomEvent = dataEvents[Math.floor(Math.random() * dataEvents.length)];
            if (randomEvent.image) {
              let imageUrl = "/images/event2.jpg";
              if (randomEvent.image?.startsWith("http")) imageUrl = randomEvent.image;
              else if (randomEvent.image?.startsWith("/uploads/")) imageUrl = `${API_URL}${randomEvent.image}`;
              else if (randomEvent.image?.startsWith("/images/")) imageUrl = randomEvent.image;
              else imageUrl = `/images/${randomEvent.image}`;
              setEventImage(imageUrl);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des images:", error);
      }
    };
    
    fetchImages();
  }, []);

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

        {/* Navigation principale sous forme de cartes sur une ligne */}
        <motion.nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-7xl px-4"
          variants={containerVariants}
        >
          {/* Chaque Link correspond à un bouton qui mène à une page spécifique */}

          {/* Carte Galerie Graphique */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className="h-56"
          >
            <Link
              to="/galerie-graphique"
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.4),inset_0_0_20px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0">
                <img 
                  src={galerieGraphImage} 
                  alt="Galerie Graphique" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <GalleryHorizontal className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Galerie graphique
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Œuvres graphiques.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Carte Services */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className="h-56"
          >
            <Link
              to="/services"
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.4),inset_0_0_20px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0">
                <img 
                  src="/images/shooting.jpg" 
                  alt="Services" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <Camera className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Services
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Création, design...
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Carte Événements */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className="h-56"
          >
            <Link
              to="/evenements"
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.4),inset_0_0_20px_rgba(255,233,146,0.1)]"
            >
              {/* Image de fond */}
              <div className="absolute inset-0">
                <img 
                  src={eventImage} 
                  alt="Événements" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              
              {/* Contenu */}
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <CalendarDays className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Événements
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Ateliers graphiques.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Carte À Propos */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className="h-56"
          >
            <Link
              to="/about"
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.4),inset_0_0_20px_rgba(255,233,146,0.1)]"
            >
              <div className="absolute inset-0">
                <img 
                  src="/images/about.jpg" 
                  alt="À Propos" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <Info className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  À Propos
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  En savoir plus.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Carte Panier */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className="h-56"
          >
            <Link
              to="/panier"
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.4),inset_0_0_20px_rgba(255,233,146,0.1)]"
            >
              {/* Image de fond */}
              <div className="absolute inset-0">
                <img 
                  src="/images/pannier.jpg" 
                  alt="Panier" 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              
              {/* Contenu */}
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <ShoppingCart className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Panier
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Vos achats.
                </p>
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
