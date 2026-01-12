// Import des hooks React pour gérer les effets et le cycle de vie du composant
import { useEffect, useState } from "react";
// Import des composants Link pour la navigation interne sans rechargement de page
import { Link } from "react-router-dom";
// Import d'icônes depuis la bibliothèque lucide-react pour les visuels
import {
  CalendarDays,
  Camera,
  GalleryHorizontal,
  ShoppingCart,
  Info,
} from "lucide-react";
// Import des composants layout Navbar (barre de navigation) et Footer (pied de page)
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
// Import des images de configuration
import homeImages from "../config/images.json";
// Import du fichier CSS pour le style spécifique de la page d'accueil
import "../styles/home.css";

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
 * Composant principal de la page "Photographie"
 * Cette page présente l'univers "Photographie" de Fabien avec un contenu immersif,
 * une navigation claire et des liens vers les sections importantes.
 */
export default function Photographie() {
  // États pour stocker les images dynamiques depuis la BDD
  const [galerieImage, setGalerieImage] = useState<string>("/images/photo5.jpg");
  const [eventImage, setEventImage] = useState<string>("/images/event1.jpg");
  
  // useEffect est utilisé ici pour modifier le titre de l'onglet du navigateur quand la page est chargée
  useEffect(() => {
    document.title = "Fabien Photographie";
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une seule fois, au montage
  
  // Récupération d'une image aléatoire depuis la base de données
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Récupérer une image aléatoire de la galerie photo
        const resGalerie = await fetch(`${API_URL}/api/galerie`);
        if (resGalerie.ok) {
          const dataGalerie = await resGalerie.json();
          const publicPhotos = dataGalerie.filter((p: any) => p.categorie !== "EvenementPrive");
          if (publicPhotos.length > 0) {
            const randomPhoto = publicPhotos[Math.floor(Math.random() * publicPhotos.length)];
            let imageUrl = "/images/photo5.jpg";
            if (randomPhoto.src?.startsWith("http")) imageUrl = randomPhoto.src;
            else if (randomPhoto.src?.startsWith("/uploads/")) imageUrl = `${API_URL}${randomPhoto.src}`;
            else if (randomPhoto.src?.startsWith("/images/")) imageUrl = randomPhoto.src;
            else imageUrl = getWatermarkedImageUrl(`/images/${randomPhoto.src}`);
            setGalerieImage(imageUrl);
          }
        }
        
        // Récupérer une image aléatoire des événements si disponible
        const resEvents = await fetch(`${API_URL}/api/evenements`);
        if (resEvents.ok) {
          const dataEvents = await resEvents.json();
          if (dataEvents.length > 0) {
            const randomEvent = dataEvents[Math.floor(Math.random() * dataEvents.length)];
            if (randomEvent.image) {
              let imageUrl = "/images/event1.jpg";
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
          <h1
            className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal uppercase font-playfair-sc
                       tracking-[0.2em] drop-shadow-[0_0_8px_rgba(234,179,8,0.1)]"
          >
            <span className="bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent">
              Photographe
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

        {/* Barre de navigation sous forme de cartes sur une ligne */}
        <motion.nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-7xl px-4"
          variants={containerVariants}
        >
          {/* Carte Galerie Photo */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            className="h-56"
          >
            <Link
              to="/galerie"
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
            >
              {/* Image de fond */}
              <div className="absolute inset-0">
                <img 
                  src={galerieImage} 
                  alt="Galerie Photo" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              
              {/* Contenu */}
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <GalleryHorizontal className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Galerie Photo
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Œuvres photographiques.
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
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
            >
              {/* Image de fond */}
              <div className="absolute inset-0">
                <img 
                  src="/images/shooting.jpg" 
                  alt="Services" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              
              {/* Contenu */}
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <Camera className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Services
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Mariages, shootings...
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
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
            >
              <div className="absolute inset-0">
                <img 
                  src={eventImage} 
                  alt="Événements" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <CalendarDays className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Événements
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Tous les événements photo.
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
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
            >
              <div className="absolute inset-0">
                <img 
                  src="/images/about.jpg" 
                  alt="À Propos" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
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
              className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
            >
              <div className="absolute inset-0">
                <img 
                  src="/images/pannier.jpg" 
                  alt="Panier" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-5">
                <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                  <ShoppingCart className="w-5 h-5 text-[#ffe992]" />
                </div>
                <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-bold">
                  Panier
                </h3>
                <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Vos achats photo.
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.nav>
      </motion.main>
      <Footer /> {/* Pied de page */}
    </div>
  );
}
