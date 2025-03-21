import { useEffect } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css";
import "../styles/home.css"; // Nouveaux styles distinctifs
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    document.title = "Photographe Professionnel | Accueil";
  }, []);

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
            src="/images/photo3.jpg"
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
            <Link to="/galerie">
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
