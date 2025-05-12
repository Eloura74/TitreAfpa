import { useEffect } from "react";
import { Link } from "react-router-dom";
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

      {/* Contenu principal */}
      <main className="flex flex-col items-center justify-center flex-1 relative z-10 pt-28 pb-16">
        <h1 className="hero-title mb-6 mt-16 md:mt-24">
          <span className="hero-title-gradient">Fabien Photographie</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center">
          Bienvenue dans l’univers <b>Photographie</b> de Fabien. Retrouvez ici l’ensemble des services liés à la photo&nbsp;: événements, tirage en ligne, galerie artistique et plus encore.<br />
          <span className="block mt-2 text-base text-white/70">Sélectionnez un menu ci-dessous pour explorer chaque fonctionnalité.</span>
        </p>
        <nav className="services-grid">
          <div className="service-card">
            <Link to="/evenements">
              <h3 className="service-title">Événements</h3>
              <p className="service-description">Tous les événements photo à venir et passés.</p>
            </Link>
          </div>
          <div className="service-card">
            <Link to="/tirage">
              <h3 className="service-title">Tirage en ligne</h3>
              <p className="service-description">Importez vos photos à imprimer sur supports pros.</p>
            </Link>
          </div>
          <div className="service-card">
            <Link to="/galerie">
              <h3 className="service-title">Galerie photo</h3>
              <p className="service-description">Découvrez et achetez les œuvres photographiques.</p>
            </Link>
          </div>
          <div className="service-card">
            <Link to="/panier">
              <h3 className="service-title">Panier</h3>
              <p className="service-description">Gérez vos achats et commandes photo.</p>
            </Link>
          </div>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
