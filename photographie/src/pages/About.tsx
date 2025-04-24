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

        {/* Bloc biographie stylisé */}
        <div className="bg-[rgba(10,10,16,0.85)] border gold-border rounded-sm p-8 max-w-3xl text-left animate-fadeInUp">
          <h2 className="gold-text font-cinzel text-xl mb-4">Mon parcours</h2>
          <p className="text-[var(--photo-gray-300)] font-syncopate text-sm leading-relaxed">
            Passionné par l'art visuel depuis mon plus jeune âge, j'ai développé
            une approche photographique centrée sur l'émotion et l'authenticité.
            Chaque cliché raconte une histoire, chaque lumière révèle une
            intention. De la photographie de mariage aux portraits intimistes en
            passant par des projets artistiques contemporains, je cherche à
            capturer la beauté brute du moment.
          </p>
        </div>

        {/* Espace supplémentaire ou ajout de photo/portrait dans le futur */}
      </main>

      <Footer />
    </div>
  );
}
