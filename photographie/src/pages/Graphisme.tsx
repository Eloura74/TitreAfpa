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
 * Interface définissant les propriétés d'une carte de navigation
 */
interface NavigationCardProps {
  to: string;           // URL de destination du lien
  image: string;        // URL de l'image de fond
  alt: string;          // Texte alternatif pour l'image
  icon: React.ReactNode; // Icône à afficher (composant React)
  title: string;        // Titre de la carte
  description: string;  // Description courte au survol
}

/**
 * Composant NavigationCard : carte de navigation réutilisable avec animation
 * Affiche une image de fond, une icône, un titre et une description
 * Description visible sur mobile, au survol uniquement sur desktop
 */
const NavigationCard: React.FC<NavigationCardProps> = ({ to, image, alt, icon, title, description }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.03, y: -6 }}
    whileTap={{ scale: 0.97 }}
    //ombre sur le bas de la carte
    className="h-48 sm:h-56 lg:h-64 relative drop-shadow-[2px_4px_8px_rgba(255,233,146,0.6)]"
  >
    {/* Effet de rayonnement élégant sous la carte */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#ffe992]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-[#ffe992]/30 blur-lg rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
    <Link
      to={to}
      className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
    >
      {/* Image de fond avec overlay gradient renforcé */}
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={alt} 
          className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>
      
      {/* Contenu de la carte avec effet glassmorphism */}
      <div className="relative h-full flex flex-col justify-end p-5">
        {/* Fond glassmorphism pour la zone de texte - version très transparente */}
        <div className="absolute bottom-0 left-0 right-0 h-22 bg-black/05 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
            {icon}
          </div>
          <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] font-bold">
            {title}
          </h3>
          <p className="text-xs text-gray-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
            {description}
          </p>
        </div>
      </div>
    </Link>
  </motion.div>
);

/**
 * Fonction utilitaire pour transformer une URL d'image selon son format
 * Gère les URLs absolues (http/https), relatives (/uploads/, /images/) et relatives simples
 * @param src - URL source de l'image
 * @param fallback - URL de secours si aucune transformation ne s'applique
 * @returns URL transformée prête à être utilisée
 */
const transformImageUrl = (src: string | undefined, fallback: string): string => {
  if (!src) return fallback;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
  if (src.startsWith("/images/")) return src;
  return getWatermarkedImageUrl(`/images/${src}`);
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
  
  // Récupération d'images aléatoires depuis la base de données (galerie graphique et événements)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Récupérer une image aléatoire de la galerie graphique
        const resGraph = await fetch(`${API_URL}/api/oeuvres-graphique`);
        if (resGraph.ok) {
          const dataGraph = await resGraph.json();
          if (dataGraph.length > 0) {
            const randomOeuvre = dataGraph[Math.floor(Math.random() * dataGraph.length)];
            setGalerieGraphImage(transformImageUrl(randomOeuvre.image, "/images/oeuvre1.png"));
          }
        }
        
        // Récupérer une image aléatoire des événements si disponible
        const resEvents = await fetch(`${API_URL}/api/evenements`);
        if (resEvents.ok) {
          const dataEvents = await resEvents.json();
          if (dataEvents.length > 0) {
            const randomEvent = dataEvents[Math.floor(Math.random() * dataEvents.length)];
            if (randomEvent.image) {
              setEventImage(transformImageUrl(randomEvent.image, "/images/event2.jpg"));
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
      
      {/* Effet de scintillement/éblouissement dans le coin supérieur gauche */}
      <motion.div
        // className="fixed top-0 left-0 w-96 h-96 pointer-events-none z-[5]"
        // initial={{ opacity: 0.3 }}
        // animate={{ 
        //   opacity: [0.6, 0.9, 0.6],
        //   scale: [1, 1.6, 1]
        // }}
        // transition={{
        //   duration: 8,
        //   repeat: Infinity,
        //   ease: "easeInOut"
        // }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-full blur-3xl"
          style={{
            background: 'radial-gradient(circle at top left, rgba(255, 233, 146, 0.2), rgba(255, 233, 146, 0.05), transparent)'
          }}
        />
        <div 
          className="absolute top-0 left-0 w-3/4 h-3/4 blur-2xl"
          style={{
            background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.1), transparent)'
          }}
        />
      </motion.div>

      {/* Conteneur pour l'image de fond et la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <img
          src={homeImages.hero} // Source de l'image issue du JSON
          alt="Fabien graphiste" // Texte alternatif pour accessibilité
          className="hero-image w-full h-full object-cover opacity-60" // Classe CSS pour styliser l'image
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
            <span className="bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">
              Le Photo-Graphisme
            </span>
          </h1>

          {/* Paragraphe de présentation avec animation dynamique */}
          <motion.div 
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative backdrop-blur-sm bg-black/20 border border-[#ffe992]/15 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden drop-shadow-[0_0_6px_rgba(255,233,146,0.3)]">
              {/* Effet de brillance animée */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatDelay: 5,
                  ease: "easeInOut" 
                }}
              />
              {/* Effet de rayonnement élégant sous la carte */}
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/10 to-transparent " />
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/05 to-transparent" />
              <motion.p 
                className="text-lg md:text-xl text-white/90 font-light leading-relaxed relative z-10  "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
              >
                Bienvenue dans l'univers <span className="font-semibold text-[#ffe992] drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">Graphisme</span> de Fabien. Retrouvez ici
                les services dédiés à la création graphique&nbsp;: événements,
                galerie graphique, projets exclusifs…
              </motion.p>
            </div>
          </motion.div>
          <span className="block mt-6 text-sm text-[#ffe992]/80 uppercase tracking-widest font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            Sélectionnez un menu ci-dessous
          </span>
        </motion.div>

        {/* Navigation principale sous forme de cartes sur une ligne */}
        {/* ecart de 4 entre les cartes */}
        <motion.nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-7xl px-4"
          variants={containerVariants}
        >
          <NavigationCard
            to="/galerie-graphique"
            image={galerieGraphImage}
            alt="Galerie Graphique"
            icon={<GalleryHorizontal className="w-5 h-5 text-[#ffe992]" />}
            title="Galerie graphique"
            description="Œuvres graphiques."
          />
          
          <NavigationCard
            to="/services"
            image="/images/shooting.jpg"
            alt="Services"
            icon={<Camera className="w-5 h-5 text-[#ffe992]" />}
            title="Services"
            description="Mariage, shootings..."
          />
          
          <NavigationCard
            to="/evenements"
            image={eventImage}
            alt="Événements"
            icon={<CalendarDays className="w-5 h-5 text-[#ffe992]" />}
            title="Événements"
            description="Tous les événements photo."
          />
          
          <NavigationCard
            to="/about"
            image="/images/about.jpg"
            alt="À Propos"
            icon={<Info className="w-5 h-5 text-[#ffe992]" />}
            title="À Propos"
            description="En savoir plus."
          />
          
          <NavigationCard
            to="/panier"
            image="/images/pannier.jpg"
            alt="Panier"
            icon={<ShoppingCart className="w-5 h-5 text-[#ffe992]" />}
            title="Panier"
            description="Vos achats."
          />
        </motion.nav>
      </motion.main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
