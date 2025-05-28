// Import des hooks React pour gérer le cycle de vie et la navigation
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Link pour navigation, useNavigate pour redirection
import { useAuthStore } from "../store/authStore"; // Accès au store Zustand pour gérer le choix utilisateur
import homeImages from "../config/images.json"; // Import des images statiques depuis un fichier JSON
import "../styles/home.css"; // Import des styles spécifiques à la page d'accueil

/**
 * Composant principal de la page d'accueil immersive
 * Affiche deux zones cliquables permettant de choisir l'univers :
 * - Photographie
 * - Photo-Graphiste
 *
 * Cette page est responsive : split screen sur desktop/tablette,
 * et présentation verticale sur mobile.
 */
export default function Home() {
  const navigate = useNavigate(); // Hook pour rediriger l'utilisateur
  const { setChoix } = useAuthStore(); // Fonction pour mémoriser le choix (photographie ou graphisme)

  // useEffect : s'exécute au montage du composant, modifie le titre de l'onglet navigateur
  useEffect(() => {
    document.title = "Photographe Professionnel | Accueil";
  }, []);

  // Fonction appelée quand l'utilisateur clique sur un univers (photographie ou graphisme)
  const handleChoix = (choix: "photographie" | "photo-graphiste") => {
    setChoix(choix); // On sauvegarde ce choix dans le store global Zustand
    navigate("/connexion"); // Puis on redirige vers la page de connexion
  };

  return (
    <div className="home-page">
      {/* Conteneur de l'image de fond avec overlay */}
      <div className="hero-image-container">
        <img
          src={homeImages.hero} // Image de fond dynamique importée
          alt="Photographe professionnel" // Texte alternatif pour accessibilité
          className="hero-image" // Style CSS
        />
      </div>

      {/* Éléments graphiques décoratifs (formes, lignes diagonales) */}
      <div className="geometric-accent" />
      <div className="diagonal-line" />

      {/* Split screen visible uniquement sur desktop et tablette (md = breakpoint) */}
      <div
        className="hidden md:flex relative w-full h-full items-center justify-center overflow-hidden"
        style={{ minHeight: "80vh" }} // Hauteur minimale pour remplir une bonne partie de la fenêtre
      >
        {/* Bloc gauche cliquable : choix Photographie */}
        <button
          type="button"
          onClick={() => handleChoix("photographie")} // Appelle la fonction handleChoix avec "photographie"
          className="flex-1 flex flex-col items-center justify-center z-10 group transition-all duration-500 bg-transparent border-none outline-none cursor-pointer"
          style={{ position: "relative" }} // Permet d'ajouter des éléments positionnés par la suite
        >
          {/* Titre avec effet de dégradé et animation au survol */}
          <h1
            className="text-3xl md:text-5xl font-bold mb-2 text-center 
               bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 
               bg-clip-text text-transparent drop-shadow-lg 
               transition-all duration-300 ease-in-out 
               group-hover:brightness-125 pb-6"
          >
            Fabien Photographie
          </h1>
          {/* Liste courte des services proposés */}
          <div className="flex flex-row gap-4 mt-2 text-xs md:text-base text-gray-200 font-light">
            <span>Événements</span>
            <span>-</span>
            <span>Tirage en ligne</span>
            <span>-</span>
            <span>Galerie Photo</span>
          </div>
        </button>

        {/* Bloc droit cliquable : choix Photo-Graphiste */}
        <button
          type="button"
          onClick={() => handleChoix("photo-graphiste")} // Même principe que le bloc gauche
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

        {/* Image de fond visible derrière les boutons (positionnée en absolu) */}
        <img
          src={homeImages.hero} // Même image que le background, pour effet de profondeur
          alt="" // Image décorative, pas besoin de texte alternatif
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 pointer-events-none" // Positionnement, transparence et interaction désactivée
        />
      </div>

      {/* Sur mobile : Overlay sombre pour garantir lisibilité */}
      <div className="md:hidden fixed inset-0 z-0 bg-black/70 pointer-events-none" />

      {/* Sur mobile : Affichage vertical des choix avec des liens cliquables */}
      <div className="md:hidden flex flex-col h-full w-full z-10 px-4 py-8 gap-8 relative">
        {/* Lien vers Photographie */}
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

        {/* Lien vers Graphisme */}
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

      {/* Éclair vertical décoratif placé au centre sur desktop/tablette */}
      <img
        src="/images/eclair2.png"
        alt="Eclair" // Texte alternatif simple (image décorative)
        aria-hidden="true" // Indique que l'image n'est pas importante pour les lecteurs d'écran
        className="absolute left-1/2 top-0 h-full w-auto z-30 pointer-events-none select-none lightning-separator hidden md:block" // Position et style, visible seulement md et plus
        style={{
          transform: "translateX(-50%)", // Centre horizontalement l'image
          filter: `
      drop-shadow(0 0 10px #ffd700)
      drop-shadow(0 0 20px #ffcc00)
      saturate(1.8)
      contrast(1.2)
      brightness(1.2)
    `, // Effets visuels de lumière
          opacity: 0.65, // Transparence
          mixBlendMode: "screen", // Mode de fusion pour un effet lumineux
        }}
      />
    </div>
  );
}
