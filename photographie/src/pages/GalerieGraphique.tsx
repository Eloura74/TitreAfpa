import { useEffect, useState } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/galerie.css";

interface OeuvreGraphique {
  id: string;
  titre: string;
  image: string;
  prix: number;
  description?: string;
}

export default function GalerieGraphique() {
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]);

  useEffect(() => {
    // À remplacer par un fetch backend plus tard
    setOeuvres([
      {
        id: "1",
        titre: "Œuvre Unique 1",
        image: "../public/images/oeuvre1.png",
        prix: 350,
        description: "Technique mixte sur toile.",
      },
      {
        id: "2",
        titre: "Œuvre Unique 2",
        image: "../public/images/oeuvre2.png",
        prix: 350,
        description: "Acrylique sur papier texturé.",
      },
      {
        id: "3",
        titre: "Œuvre Unique 3",
        image: "public/images/oeuvre3.png",
        prix: 350,
        description: "Encre et collage.",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      {/* Barre de navigation principale */}
      <Navbar />

      {/* En-tête de la galerie graphique unique */}
      <div className="galerie-header">
        <h1 className="galerie-title">Galerie Graphique – Œuvres Uniques</h1>
        <p className="galerie-description">
          Découvrez une sélection d’œuvres graphiques uniques, réalisées par Fabien. Chaque création est proposée à un prix individuel et n’existe qu’en un seul exemplaire.
        </p>
      </div>

      {/* Grille des œuvres graphiques */}
      <div className="galerie-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {oeuvres.map((oeuvre) => (
            <div
              key={oeuvre.id}
              className="photo-card group relative bg-[#151520] rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#d6c48733] flex flex-col items-center"
            >
              <div className="h-64 overflow-hidden w-full">
                <img
                  src={oeuvre.image}
                  alt={oeuvre.titre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6 w-full flex flex-col items-center">
                <h2 className="photo-title mb-2 text-xl font-semibold">{oeuvre.titre}</h2>
                <p className="text-yellow-400 text-lg font-bold mb-2">{oeuvre.prix} €</p>
                <p className="text-gray-300 text-center mb-4">{oeuvre.description}</p>
                <button className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300 transition">
                  Acheter / En savoir +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
