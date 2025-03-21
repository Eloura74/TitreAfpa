import { useEffect } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css"; // Import de tes styles globaux
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    document.title = "Photographe Professionnel | Accueil";
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-9 00 text-white min-h-screen">
      {/* ******************* */}
      {/* Navigation */}
      {/* ******************* */}
      <Navbar />

      {/* ******************* */}
      {/* Hero Section */}
      {/* ******************* */}
      <section
        className="relative w-full h-screen flex items-center justify-end overflow-hidden pr-16 pt-16"
        aria-labelledby="hero-title"
      >
        {/* ******************* */}
        {/* Image de fond */}
        {/* ******************* */}
        <img
          src="/images/photo3.jpg"
          alt="Arrière-plan photographe"
          className="absolute w-full h-full object-cover"
        />

        {/* ******************* */}
        {/* Fondu à gauche */}
        {/* ******************* */}
        <div className="pointer-events-none absolute top-0 left-0 bottom-0 w-1/4 bg-gradient-to-r from-gray-900/90 to-transparent z-0"></div>
        {/* ******************* */}
        {/* Fondu à droite */}
        {/* ******************* */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-l from-gray-900/100 to-transparent z-0"></div>
        {/* ******************* */}
        {/* Contenu du Hero */}
        {/* ******************* */}
        <div className="z-10 max-w-4xl mb-140 mr-30">
          <h1 id="hero-title" className="titre-degrade">
            Capturez l’instant avec{" "}
            <span className="titre-degrade">élégance</span>
          </h1>
          <p className="sous-titre mt-4 ml-60">
            Photographe professionnel spécialisé dans les événements, portraits
            et galeries artistiques. Transformez vos souvenirs en véritables
            œuvres d'art.
          </p>
        </div>
      </section>

      {/* ******************* */}
      {/* Sections */}
      {/* ******************* */}
      <section className="py-20 px-8 md:px-20 my-gradient-text">
        <h2 className="text-5xl font-bold text-center mb-10">Nos services</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Galerie */}
          <div className="bg-gray-800/40 rounded-lg p-6 shadow-lg hover:bg-gray-800/60 hover:scale-105 transition-all duration-300">
            <Link to="/galerie">
              <h3 className="text-2xl font-bold mb-4 text-center ">Galerie</h3>
              <p className="text-gray-400 text-center">
                Explorez mes œuvres et laissez-vous inspirer.
              </p>
            </Link>
          </div>

          {/* Événements */}
          <div className="bg-gray-800/40 rounded-lg p-6 shadow-lg hover:bg-gray-800/60 hover:scale-105 transition-all duration-300">
            <Link to="/evenements">
              <h3 className="text-2xl font-bold mb-4 text-center">
                Événements
              </h3>
              <p className="text-gray-400 text-center">
                Immortalisez vos souvenirs avec des clichés uniques.
              </p>
            </Link>
          </div>

          {/* Contact */}
          <div className="bg-gray-800/40 rounded-lg p-6 shadow-lg hover:bg-gray-800/60 hover:scale-105 transition-all duration-300">
            <Link to="/about">
              <h3 className="text-2xl font-bold mb-4 text-center">Contact</h3>
              <p className="text-gray-400 text-center">
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
