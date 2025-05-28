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
    <div className="home-page min-h-screen flex flex-col">
      {/* Barre de navigation fixe en haut */}
      <Navbar />

      {/* Conteneur pour l'image de fond et la texture */}
      <div className="hero-image-container">
        <img
          src={homeImages.hero} // Source de l'image issue du JSON
          alt="Fabien graphiste" // Texte alternatif pour accessibilité
          className="hero-image" // Classe CSS pour styliser l'image
        />
      </div>

      {/* Décorations graphiques : accent géométrique et ligne diagonale */}
      <div className="geometric-accent" />
      <div className="diagonal-line" />

      {/* Contenu principal centré verticalement et horizontalement */}
      <main className="flex flex-col items-center justify-center flex-1 relative z-10 pt-28 pb-16">
        {/* Titre principal avec un effet de dégradé de couleurs */}
        <h1 className="hero-title mb-6 mt-16 md:mt-24">
          <span className="hero-title-gradient">Fabien Graphiste</span>
        </h1>

        {/* Paragraphe de présentation, avec styles responsives */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center">
          Bienvenue dans l’univers <b>Graphisme</b> de Fabien. Retrouvez ici les
          services dédiés à la création graphique&nbsp;: événements, galerie
          graphique, projets exclusifs…
          <br />
          <span className="block mt-2 text-base text-white/70">
            Sélectionnez un menu ci-dessous pour explorer chaque fonctionnalité.
          </span>
        </p>

        {/* Navigation principale sous forme de grille responsive */}
        <nav className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 py-2 md:grid-cols-4 md:gap-8 md:px-0 md:w-auto">
          {/* Chaque Link correspond à un bouton qui mène à une page spécifique */}

          {/* Bouton vers la page des événements graphiques */}
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
              Ateliers et événements graphiques à venir.
            </span>
          </Link>

          {/* Bouton vers la galerie graphique */}
          <Link
            to="/galerie-graphique"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            {/* Icône galerie */}
            <GalleryHorizontal
              className="w-7 h-7 mb-1 text-[#d6c487]"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold">Galerie graphique</span>
            <span className="text-sm text-yellow-100">
              Œuvres uniques, prix individuel pour chaque création.
            </span>
          </Link>

          {/* Bouton vers le panier */}
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
              Gérez vos achats graphiques.
            </span>
          </Link>

          {/* Bouton vers la page "À propos" */}
          <Link
            to="/about"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            {/* Icône info */}
            <Info className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">A propos</span>
            <span className="text-sm text-yellow-100">
              Plus d’informations sur moi.
            </span>
          </Link>
        </nav>
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
