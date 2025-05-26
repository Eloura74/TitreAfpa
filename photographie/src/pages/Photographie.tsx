import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Printer, GalleryHorizontal, ShoppingCart } from "lucide-react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import homeImages from "../config/images.json";
import "../styles/home.css";

/**
 * Page univers Photographie : navbar adaptée, contenu immersif, explication de la section photo.
 */
export default function Photographie() {
  useEffect(() => {
    document.title = "Fabien Photographie";
  }, []);

  return (
    <div className="home-page min-h-screen flex flex-col">
      <Navbar />
      {/* Overlay image de fond + texture */}
      <div className="hero-image-container">
        <img src={homeImages.hero} alt="Photographe professionnel" className="hero-image" />
      </div>
      {/* Accent géométrique et ligne diagonale */}
      <div className="geometric-accent" />
      <div className="diagonal-line" />

      {/* Overlay sombre mobile */}
      <div className="md:hidden fixed inset-0 z-0 bg-black/70 pointer-events-none" />

      {/* Contenu principal */}
      <main className="flex flex-col items-center justify-center flex-1 relative z-10 pt-20 pb-10">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-6 mt-12 break-words drop-shadow-lg">
          Fabien Photographie
        </h1>
        <p className="text-base sm:text-lg text-white/90 mb-8 max-w-2xl text-center px-4 bg-black/40 rounded py-2">
          Bienvenue dans l’univers <b>Photographie</b> de Fabien. Retrouvez ici l’ensemble des services liés à la photo : événements, tirage en ligne, galerie artistique et plus encore.
          <span className="block mt-2 text-sm text-white/70">Sélectionnez un menu ci-dessous pour explorer chaque fonctionnalité.</span>
        </p>
        {/* Menu horizontal scrollable sur mobile, grid sur desktop */}
        <nav className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 py-2 md:grid-cols-4 md:gap-8 md:px-0 md:w-auto">
          <Link
            to="/evenements"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <CalendarDays className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Événements</span>
            <span className="text-sm text-yellow-100">Tous les événements photo à venir et passés.</span>
          </Link>
          <Link
            to="/tirage"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <Printer className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Tirage en ligne</span>
            <span className="text-sm text-yellow-100">Importez vos photos à imprimer sur supports pros.</span>
          </Link>
          <Link
            to="/galerie"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <GalleryHorizontal className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Galerie photo</span>
            <span className="text-sm text-yellow-100">Découvrez et achetez les œuvres photographiques.</span>
          </Link>
          <Link
            to="/panier"
            className="w-full bg-gradient-to-b from-yellow-900/70 to-black/80 rounded-2xl shadow-xl px-4 py-6 text-yellow-200 text-center flex flex-col gap-2 items-center transition-transform hover:scale-105 hover:shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:rounded-xl md:shadow-lg"
          >
            <ShoppingCart className="w-7 h-7 mb-1 text-[#d6c487]" aria-hidden="true" />
            <span className="text-lg font-semibold">Panier</span>
            <span className="text-sm text-yellow-100">Gérez vos achats et commandes photo.</span>
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
