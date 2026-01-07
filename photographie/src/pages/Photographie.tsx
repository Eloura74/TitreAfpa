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
    <div className="home-page min-h-screen flex flex-col">
      {/* La Navbar détecte automatiquement l'univers courant (photographie/graphisme) et adapte les liens */}
      <Navbar />
      {/* Conteneur de l'image de fond et de la texture */}
      <div className="hero-image-container">
        <img
          src={homeImages.hero} // Image de fond principale, issue du fichier de config
          alt="Photographe professionnel" // Texte alternatif pour accessibilité
          className="hero-image" // Classe CSS pour le style
        />
      </div>
      {/* Accent géométrique décoratif */}
      <div className="geometric-accent" />
      {/* Ligne diagonale décorative */}
      <div className="diagonal-line" />
      {/* Contenu principal de la page, centré verticalement et horizontalement */}
      <main className="flex flex-col items-center justify-center flex-1 relative z-10 pt-28 pb-16">
        {/* Titre principal avec dégradé de couleurs et style responsive */}
        <h1 className="hero-title mb-6 mt-16 md:mt-24">
          <span className="hero-title-gradient">Fabien Photographie</span>
        </h1>

        {/* Paragraphe d’introduction avec fond semi-transparent et arrondi */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center">
          Bienvenue dans l’univers <b>Photographie</b> de Fabien. Retrouvez ici
          l’ensemble des services liés à la photo : événements, tirage en ligne,
          galerie artistique et plus encore.
          <br />
          <span className="block mt-2 text-base text-white/70">
            Sélectionnez un menu ci-dessous pour explorer chaque fonctionnalité.
          </span>
        </p>

        {/* Barre de navigation sous forme de grille, responsive (scrollable sur mobile) */}
        <nav className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 py-2 md:grid-cols-4 md:gap-8 md:px-0 md:w-auto">
          {/* Lien vers la page des événements photo */}
          <Link
            to="/evenements"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            {/* Icône calendrier */}
            <CalendarDays
              className="w-7 h-7 mb-1 text-[#d6c487]"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold">Événements</span>
            <span className="text-sm text-yellow-100">
              Tous les événements photo à venir et passés.
            </span>
          </Link>

          {/* Lien vers la page des services */}
          <Link
            to="/services"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            {/* Icône camera */}
            <Camera
              className="w-7 h-7 mb-1 text-[#d6c487]"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold">Services</span>
            <span className="text-sm text-yellow-100">
              Mariages, shootings, événements...
            </span>
          </Link>

          {/* Lien vers la galerie photo */}
          <Link
            to="/galerie"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            {/* Icône galerie */}
            <GalleryHorizontal
              className="w-7 h-7 mb-1 text-[#d6c487]"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold">Galerie photo</span>
            <span className="text-sm text-yellow-100">
              Découvrez et achetez les œuvres photographiques.
            </span>
          </Link>

          {/* Lien vers le panier */}
          <Link
            to="/panier"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            {/* Icône panier */}
            <ShoppingCart
              className="w-7 h-7 mb-1 text-[#d6c487]"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold">Panier</span>
            <span className="text-sm text-yellow-100">
              Gérez vos achats et commandes photo.
            </span>
          </Link>
        </nav>
      </main>
      <Footer /> {/* Pied de page */}
    </div>
  );
}
