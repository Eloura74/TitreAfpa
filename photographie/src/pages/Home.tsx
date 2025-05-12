import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import homeImages from "../config/images.json";
import eclair from "/public/images/eclair2.png";
import "../styles/home.css";
import HomeIntro from "../components/HomeIntro";

/**
 * Page d'accueil immersive avec séparation diagonale et overlay, style projet d'origine
 */
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    document.title = "Photographe Professionnel | Accueil";
  }, []);

  return (
    <div className="home-page">
      {/* Intro immersive */}
      {showIntro && <HomeIntro onFinish={() => setShowIntro(false)} />}
      {/* Overlay image de fond + texture */}
      <div className="hero-image-container">
        <img
          src={homeImages.hero}
          alt="Photographe professionnel"
          className="hero-image"
        />
      </div>
      {/* Accent géométrique et ligne diagonale */}
      <div className="geometric-accent" />
      <div className="diagonal-line" />

      {/* Split screen desktop/tablette */}
      <div
        className="hidden md:flex relative w-full h-full items-center justify-center overflow-hidden"
        style={{ minHeight: "80vh" }}
      >
        {/* Bloc gauche cliquable */}
        <Link
          to="/photographie"
          className="flex-1 flex flex-col items-center justify-center z-10 group transition-all duration-500"
          style={{ position: "relative" }}
        >
          <h1
            className="text-3xl md:text-5xl font-bold mb-2 text-center 
               bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 
               bg-clip-text text-transparent drop-shadow-lg 
               transition-all duration-300 ease-in-out 
               group-hover:brightness-125 pb-6"
          >
            Fabien Photographie
          </h1>
          <div className="flex flex-row gap-4 mt-2 text-xs md:text-base text-gray-200 font-light">
            <span>Événements</span>
            <span>-</span>
            <span>Tirage en ligne</span>
            <span>-</span>
            <span>Galerie Photo</span>
          </div>
        </Link>

        {/* Bloc droit cliquable */}
        <Link
          to="/graphisme"
          className="flex-1 flex flex-col items-center justify-center z-10 group transition-all duration-500"
          style={{ position: "relative" }}
        >
          <h1
            className="text-3xl md:text-5xl font-bold mb-2 text-center 
               bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 
               bg-clip-text text-transparent drop-shadow-lg 
               transition-all duration-300 ease-in-out 
               group-hover:brightness-125 pb-6"
          >
            Fabien Photo-Graphiste
          </h1>

          <div className="flex flex-row gap-4 mt-2 text-xs md:text-base text-gray-200 font-light">
            <span>Événements</span>
            <span>-</span>
            <span>Galerie Œuvres Uniques Graphiques</span>
            <span>-</span>
            <span>A Propos</span>
          </div>
        </Link>
        {/* Image de fond */}
        <img
          src={homeImages.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 pointer-events-none"
        />
      </div>

      {/* Mobile : split vertical */}
      <div className="md:hidden flex flex-col h-full w-full z-10">
        <Link to="/photographie" className="flex-1 group">
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600 transition-colors duration-500 group-hover:from-blue-700 cursor-pointer">
            <h1 className="hero-title">
              <span className="hero-title-gradient">Fabien Photographie</span>
            </h1>
            <p className="hero-subtitle">
              Événements · Tirage en ligne · Galerie actuelle
            </p>
          </div>
        </Link>
        <Link to="/graphisme" className="flex-1 group">
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-800 to-yellow-400 transition-colors duration-500 group-hover:from-purple-700 cursor-pointer">
            <h1 className="hero-title">
              <span className="hero-title-gradient">Fabien Graphiste</span>
            </h1>
            <p className="hero-subtitle">
              Événements · Tirage en ligne · Galerie graphique
            </p>
          </div>
        </Link>
      </div>
      {/* Séparateur éclair central */}
      <img
        src={eclair}
        alt="Séparation éclair"
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-full w-auto z-30 pointer-events-none select-none lightning-separator hidden md:block"
        style={{
          transform: "translateX(-50%)",
          filter: `
      drop-shadow(0 0 10px #ffd700)
      drop-shadow(0 0 20px #ffcc00)
      saturate(1.8)
      contrast(1.2)
      brightness(1.2)
    `,
          opacity: 0.65,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
