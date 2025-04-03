// import de base
import { useEffect } from "react";
// import des composants
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
// import des styles
import "../styles/globals.css";
import "../styles/home.css";
// import des images
import homeImages from "../config/images.json";
// import des routes
import { Link } from "react-router-dom";

// ***************************************************************************
//
// function Home qui retourne le composant
export default function Home() {
  // useEffect pour mettre le titre de la page
  useEffect(() => {
    document.title = "Photographe Professionnel | Accueil";
  }, []);

  // return le composant
  return (
    <div className="home-page">
      {/* ******************* */}
      {/* Navigation */}
      {/* ******************* */}
      <Navbar />

      {/* ******************* */}
      {/* Section Hero avec design unique */}
      {/* ******************* */}
      <section className="hero-container" aria-labelledby="hero-title">
        {/* ******************* */}
        {/* Container d'image avec effet de masque */}
        {/* ******************* */}
        <div className="hero-image-container">
          <img
            src={homeImages.hero}
            alt="Photographe professionnel"
            className="hero-image"
          />
        </div>

        {/* ******************* */}
        {/* Éléments géométriques décoratifs */}
        {/* ******************* */}
        <div className="geometric-accent"></div>
        <div className="diagonal-line"></div>

        {/* ******************* */}
        {/* Contenu texte du Hero */}
        {/* ******************* */}
        <div className="hero-content">
          <h1 id="hero-title" className="hero-title">
            <span className="hero-title-gradient ">
              Capturez l'instant avec élégance
            </span>
          </h1>
          <p className="hero-subtitle">
            Photographe professionnel spécialisé dans les événements, portraits
            et galeries artistiques. Transformez vos souvenirs en véritables
            œuvres d'art.
          </p>
        </div>
      </section>

      {/* ******************* */}
      {/* Section Services avec style distinctif */}
      {/* ******************* */}
      <section className="services-section">
        <h2 className="services-title">
          <span className="services-title-text">Nos services</span>
        </h2>

        <div className="services-grid">
          {/* ******************* */}
          {/* Galerie */}
          {/* ******************* */}
          <div className="service-card">
            <Link to="/Galerie">
              <h3 className="service-title">Galerie</h3>
              <p className="service-description">
                Explorez mes œuvres et laissez-vous inspirer.
              </p>
            </Link>
          </div>

          {/* ******************* */}
          {/* Événements */}
          {/* ******************* */}
          <div className="service-card">
            <Link to="/evenements">
              <h3 className="service-title">Événements</h3>
              <p className="service-description">
                Immortalisez vos souvenirs avec des clichés uniques.
              </p>
            </Link>
          </div>

          {/* ******************* */}
          {/* Contact */}
          {/* ******************* */}
          <div className="service-card">
            <Link to="/about">
              <h3 className="service-title">Contact</h3>
              <p className="service-description">
                Prenez rendez-vous pour discuter de vos projets photo.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ******************* */}
      {/* Footer */}
      {/* ******************* */}
      <Footer />
    </div>
  );
}
