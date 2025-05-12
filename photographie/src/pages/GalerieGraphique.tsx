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
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    // Utilisation de l'URL complète avec le domaine comme dans Galerie.tsx
    fetch("http://localhost:5001/api/oeuvres-graphique")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau ou API");
        return res.json();
      })
      .then((data: any[]) => {
        // Mapping avec correction des chemins d'images (ajout du domaine)
        const oeuvresFormatees = data.map((oeuvre) => ({
          id: oeuvre._id || oeuvre.id,
          titre: oeuvre.titre,
          image:
            oeuvre.image && oeuvre.image.startsWith("/uploads/")
              ? `http://localhost:5001${oeuvre.image}`
              : `/uploads/placeholder.jpg`,
          prix: oeuvre.prix,
          description: oeuvre.description,
        }));
        setOeuvres(oeuvresFormatees);
        setLoading(false);
      })
      .catch((err) => {
        setErreur(
          "Impossible de charger les œuvres graphiques. Vérifiez l’API ou la connexion serveur."
        );
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      {/* Barre de navigation principale */}
      <Navbar />

      {/* En-tête de la galerie graphique unique */}
      <div className="galerie-header">
        <h1 className="galerie-title">Galerie Graphique – Œuvres Uniques</h1>
        <p className="galerie-description">
          Découvrez une sélection d’œuvres graphiques uniques, réalisées par
          Fabien. Chaque création est proposée à un prix individuel et n’existe
          qu’en un seul exemplaire.
        </p>
      </div>

      {/* Affichage du chargement ou des erreurs */}
      {loading && (
        <div className="text-center text-yellow-300 py-12 text-lg animate-pulse">
          Chargement des œuvres graphiques…
        </div>
      )}
      {erreur && !loading && (
        <div className="text-center text-red-400 py-12 text-lg">{erreur}</div>
      )}

      {/* Grille des œuvres graphiques */}
      {!loading && !erreur && (
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
                    alt={oeuvre.titre || "Œuvre graphique"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/uploads/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="p-6 w-full flex flex-col items-center">
                  <h2 className="photo-title mb-2 text-xl font-semibold">
                    {oeuvre.titre}
                  </h2>
                  <p className="text-yellow-400 text-lg font-bold mb-2">
                    {oeuvre.prix} €
                  </p>
                  <p className="text-gray-300 text-center mb-4">
                    {oeuvre.description}
                  </p>
                  <button className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300 transition">
                    Acheter / En savoir +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
