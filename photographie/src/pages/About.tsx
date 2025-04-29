// Importations des modules nécessaires
// React : framework React
// useEffect : hook React pour la gestion du cycle de vie
// Navbar : composant de navigation
// Footer : composant de footer
// globals.css : styles globaux
import { useEffect } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css";

// Fonction principale du composant About
export default function About() {
  useEffect(() => {
    document.title = "Photographe Professionnel | À propos"; // Mise à jour du titre de la page
  }, []);

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content flex flex-col items-center text-center">
        {/* Titre principal avec animation shimmer */}
        <h1 className="title-primary text-4xl md:text-5xl font-cinzel uppercase tracking-wider animate-shimmer mb-4">
          À propos
        </h1>
        <div className="title-divider"></div>

        {/* Sous-titre */}
        <p className="sous-titre mb-10 max-w-2xl">
          Photographe professionnel spécialisé dans les événements, portraits et
          galeries artistiques. Transformez vos souvenirs en véritables œuvres
          d'art.
        </p>

        {/* Bloc principal avec photo à gauche et texte à droite */}
        <div className="flex flex-col md:flex-row items-start gap-8 mt-8">
          {/* Photo à gauche, avec effet d'ombre/dégradé sombre à droite */}
          <div className="relative min-w-[180px] max-w-[220px] w-full h-[320px] md:h-[350px] flex-shrink-0 md:-ml-12 overflow-visible ml-20">
            <img
              src="/images/fabien.jpg"
              alt="Fabien, photographe professionnel"
              className="object-cover w-full h-full rounded-sm shadow-xl"
              style={{ objectPosition: "left center" }}
            />
            {/* Dégradé sombre à droite de l'image pour une intégration douce */}
            <div
              className="absolute top-0 right-0 h-full w-2/5 pointer-events-none rounded-r-sm"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(10,10,16,0.8) 100%)",
              }}
            />
          </div>
          {/* Cadre jaune avec texte */}
          <div className="bg-[rgba(10,10,16,0.85)] border gold-border rounded-sm p-8 max-w-3xl text-left animate-fadeInUp flex-1">
            <h2 className="gold-text font-cinzel text-xl mb-4">Mon parcours</h2>
            <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed mb-4">
              Plongé dans l'univers captivant de la photographie depuis mon plus
              jeune âge, je suis un photographe passionné établi à{" "}
              <strong>Pignans dans le Var</strong>.
            </p>
            <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed mb-4">
              Tantôt reporter-photographe, photographe de mode, photographe
              animalier, mon métier recouvre une multitude de possibilités !
            </p>
            <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed mb-4">
              En tant que professionnel, je maîtrise l’art d’immortaliser un
              visage, un sportif en action, une nouvelle marque, un artiste sur
              scène, un événement festif ou politique (concerts, festivals,
              compétitions sportives), ou la découverte de votre commune, sans
              oublier les événements privés (mariage, baptême, repas de famille,
              etc.).
            </p>
            <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed mb-4">
              Je pratique également <strong>la photographie de studio</strong>,
              capturant l'essence d'un portrait seul, d'un duo, ou d'une
              famille, figeant ces moments intimes pour les éterniser. Mon
              studio d'art <strong>(celui-ci étant mobile)</strong> est un lieu
              où la créativité s'épanouit, que ce soit pour des séances de mode,
              des compositions artistiques destinées à l'exposition, des
              packshots produits et bien d'autres projets.
            </p>
            <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed mb-4">
              Chaque instant capturé est une histoire à raconter, une émotion à
              partager. Bienvenue dans mon univers photographique, où la
              diversité de la vie se reflète à travers l'objectif, transformant
              chaque instant en un souvenir inoubliable.
            </p>
            <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed">
              Offrez-vous des impressions uniques en commandant les tirages de
              mes photographies. Le prix englobe non seulement les coûts de
              laboratoire, mais également ma contribution d'artiste,
              garantissant ainsi une œuvre authentique et exclusive à votre
              collection.
            </p>
          </div>
        </div>

        {/* Espace supplémentaire ou ajout de photo/portrait dans le futur */}
      </main>

      <Footer />
    </div>
  );
}
