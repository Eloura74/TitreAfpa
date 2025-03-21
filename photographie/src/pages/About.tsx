import { useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import "../styles/globals.css"; // Import de tes styles globaux

export default function About() {
  useEffect(() => {
    document.title = "Photographe Professionnel | A propos";
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Contenu de la page A propos */}
      <section className="py-20 px-8 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-10">A propos</h2>
        <p className="sous-titre">
          Photographe professionnel spécialisé dans les événements, portraits et
          galeries artistiques. Transformez vos souvenirs en véritables œuvres
          d'art.
        </p>
      </section>
    </div>
  );
}
