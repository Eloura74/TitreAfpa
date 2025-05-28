import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import homeImages from "../config/images.json";
import "../styles/home.css";
import HomeIntro from "../components/HomeIntro";

/**
 * Page d'accueil immersive avec séparation diagonale et overlay, style projet d'origine
 */
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();
  const { setChoix } = useAuthStore();

  useEffect(() => {
    document.title = "Photographe Professionnel | Accueil";
  }, []);

  // Handler pour choisir l'univers et mémoriser le choix
  const handleChoix = (choix: "photographie" | "photo-graphiste") => {
    setChoix(choix);
    navigate("/connexion");
  };

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
        {/* Bloc gauche cliquable : Photographie */}
        <button
          type="button"
          onClick={() => handleChoix("photographie")}
          className="flex-1 flex flex-col items-center justify-center z-10 group transition-all duration-500 bg-transparent border-none outline-none cursor-pointer"
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
        </button>

        {/* Bloc droit cliquable */}
        <button
          type="button"
          onClick={() => handleChoix("photo-graphiste")}
          className="flex-1 flex flex-col items-center justify-center z-10 group transition-all duration-500 bg-transparent border-none outline-none cursor-pointer"
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
        </button>
        {/* Image de fond */}
        <img
          src={homeImages.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 pointer-events-none"
        />
      </div>

      {/* Overlay sombre mobile pour garantir la lisibilité des blocs */}
      <div className="md:hidden fixed inset-0 z-0 bg-black/70 pointer-events-none" />
      {/* Mobile : split vertical amélioré et lisible */}
      <div className="md:hidden flex flex-col h-full w-full z-10 px-4 py-8 gap-8 relative">
        <Link
          to="/photographie"
          className="group focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <div className="w-full bg-black/80 rounded-2xl shadow-lg flex flex-col items-center justify-center py-8 px-4">
            <h1 className="text-3xl font-bold text-center text-yellow-200 drop-shadow-lg mb-3 break-words">
              Fabien Photographe
            </h1>
            <p className="text-base text-yellow-100 text-center bg-black/40 rounded px-2 py-1 drop-shadow">
              Événements · Tirage en ligne · Galerie photo
            </p>
          </div>
        </Link>
        <Link
          to="/graphisme"
          className="group focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <div className="w-full bg-black/80 rounded-2xl shadow-lg flex flex-col items-center justify-center py-8 px-4">
            <h1 className="text-3xl font-bold text-center text-yellow-200 drop-shadow-lg mb-3 break-words">
              Fabien Graphiste
            </h1>
            <p className="text-base text-yellow-100 text-center bg-black/40 rounded px-2 py-1 drop-shadow">
              Événements · Galerie graphique · A propos
            </p>
          </div>
        </Link>
      </div>
      {/* Séparateur éclair central */}
      <img
        src="/images/eclair2.png"
        alt="Eclair"
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
