import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import { CalendarDays, GalleryHorizontal, ShoppingCart, Info } from "lucide-react";
import Footer from "../components/layout/Footer";
import homeImages from "../config/images.json";
import "../styles/home.css";

/**
 * Page univers Graphiste : navbar adaptée, contenu immersif, explication de la section graphisme.
 */
export default function Graphisme() {
  useEffect(() => {
    document.title = "Fabien Graphiste";
  }, []);

  return (
    <div className="home-page min-h-screen flex flex-col">
      <Navbar />
      {/* Overlay image de fond + texture */}
      <div className="hero-image-container">
        <img
          src={homeImages.hero}
          alt="Fabien graphiste"
          className="hero-image"
        />
      </div>
      {/* Accent géométrique et ligne diagonale */}
      <div className="geometric-accent" />
      <div className="diagonal-line" />

      {/* Contenu principal */}
      <main className="flex flex-col items-center justify-center flex-1 relative z-10 pt-28 pb-16">
        <h1 className="hero-title mb-6 mt-16 md:mt-24">
          <span className="hero-title-gradient">Fabien Graphiste</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center">
          Bienvenue dans l’univers <b>Graphisme</b> de Fabien. Retrouvez ici les
          services dédiés à la création graphique&nbsp;: événements, galerie
          graphique, projets exclusifs…
          <br />
          <span className="block mt-2 text-base text-white/70">
            Sélectionnez un menu ci-dessous pour explorer chaque fonctionnalité.
          </span>
        </p>
        <nav className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 py-2 md:grid-cols-4 md:gap-8 md:px-0 md:w-auto">
          <Link
            to="/evenements"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <CalendarDays className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Événements</span>
            <span className="text-sm text-yellow-100">Ateliers et événements graphiques à venir.</span>
          </Link>
          <Link
            to="/galerie-graphique"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <GalleryHorizontal className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Galerie graphique</span>
            <span className="text-sm text-yellow-100">Œuvres uniques, prix individuel pour chaque création.</span>
          </Link>
          <Link
            to="/panier"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <ShoppingCart className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Panier</span>
            <span className="text-sm text-yellow-100">Gérez vos achats graphiques.</span>
          </Link>
          <Link
            to="/about"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <Info className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">A propos</span>
            <span className="text-sm text-yellow-100">Plus d’informations sur moi.</span>
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
