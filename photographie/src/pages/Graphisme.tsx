import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/navbar";
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
        <nav className="services-grid">
          <div className="service-card">
            <Link to="/evenements">
              <h3 className="service-title">Événements</h3>
              <p className="service-description">
                Ateliers et événements graphiques à venir.
              </p>
            </Link>
          </div>

          <div className="service-card">
            <Link to="/galerie">
              <h3 className="service-title">Galerie graphique</h3>
              <p className="service-description">
                Œuvres graphiques originales, prix fixes.
              </p>
            </Link>
          </div>
          <div className="service-card">
            <Link to="/panier">
              <h3 className="service-title">Panier</h3>
              <p className="service-description">
                Gérez vos achats graphiques.
              </p>
            </Link>
          </div>
          <div className="service-card">
            <Link to="/about">
              <h3 className="service-title">A propos</h3>
              <p className="service-description">
                Plus d’informations sur moi.
              </p>
            </Link>
          </div>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
