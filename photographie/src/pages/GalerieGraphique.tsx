// ================================
// 🎨 Composant : GalerieGraphique.tsx
// Affiche une galerie d'œuvres graphiques récupérées via API
// ================================

// 📦 Import des modules React (hooks) et composants
import { useEffect, useState } from "react";
import { usePanier } from "../store/panierContext"; // Hook pour le panier
import Navbar from "../components/layout/navbar"; // Barre de navigation
import Footer from "../components/layout/Footer"; // Pied de page
import "../styles/galerie.css"; // Styles spécifiques à la galerie
import { API_URL } from "../config/api";

// 🎯 Interface TypeScript pour définir la forme d'une œuvre graphique
interface OeuvreGraphique {
  id: string;
  titre: string;
  image: string;
  prix: number;
  description?: string;
}

// 📸 Composant principal exporté
export default function GalerieGraphique() {
  // 🧠 États React pour gérer les données et l'affichage
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]); // Liste des œuvres
  const [loading, setLoading] = useState(true); // État de chargement
  const [erreur, setErreur] = useState<string | null>(null); // Message d'erreur éventuel
  const [notification, setNotification] = useState<string | null>(null); // Notification ajout panier

  const { ajouterArticle } = usePanier(); // Accès au contexte panier

  const handleAjouterAuPanier = (oeuvre: OeuvreGraphique) => {
    ajouterArticle({
      id: crypto.randomUUID(), // ID local unique
      photoId: oeuvre.id, // ID MongoDB
      nom: `${oeuvre.titre} (Oeuvre Graphique)`,
      prix: oeuvre.prix,
      quantite: 1,
      image: oeuvre.image,
    });
    setNotification(`${oeuvre.titre} ajouté au panier !`);
    setTimeout(() => setNotification(null), 3000);
  };

  // 🔄 useEffect : s'exécute au chargement du composant
  useEffect(() => {
    // Appel à l'API pour récupérer les œuvres graphiques
    fetch(`${API_URL}/api/oeuvres-graphique`)
      .then((res) => {
        // Si la réponse n'est pas OK, on lève une erreur
        if (!res.ok) throw new Error("Erreur réseau ou API");
        return res.json(); // On convertit la réponse en JSON
      })
      .then((data: any[]) => {
        // On reformate les données reçues
        const oeuvresFormatees = data.map((oeuvre) => ({
          id: oeuvre._id || oeuvre.id,
          titre: oeuvre.titre,
          image:
            oeuvre.image && oeuvre.image.startsWith("/uploads/")
              ? `${API_URL}${oeuvre.image}`
              : `/images/placeholder.jpg`, // Fallback si l'image est absente
          prix: oeuvre.prix,
          description: oeuvre.description,
        }));
        // On stocke les données dans le state et on arrête le chargement
        setOeuvres(oeuvresFormatees);
        setLoading(false);
      })
      .catch(() => {
        // Si erreur, on affiche un message utilisateur
        setErreur(
          "Impossible de charger les œuvres graphiques. Vérifiez l’API ou la connexion serveur."
        );
        setLoading(false);
      });
  }, []); // Le tableau vide signifie que ce code ne s'exécute qu'une fois au début

  // 🖼️ Rendu HTML du composant
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      {/* ✅ Barre de navigation en haut */}
      <Navbar />

      {/* 🧾 En-tête de la galerie */}
      <div className="galerie-header">
        <h1 className="galerie-title">Galerie Graphique – Œuvres Uniques</h1>
        <p className="galerie-description">
          Découvrez une sélection d’œuvres graphiques uniques, réalisées par
          Fabien. Chaque création est proposée à un prix individuel et n’existe
          qu’en un seul exemplaire.
        </p>
      </div>

      {/* ⏳ Message de chargement */}
      {loading && (
        <div className="text-center text-yellow-300 py-12 text-lg animate-pulse">
          Chargement des œuvres graphiques…
        </div>
      )}

      {/* ❌ Message d'erreur si échec du chargement */}
      {erreur && !loading && (
        <div className="text-center text-red-400 py-12 text-lg">{erreur}</div>
      )}

      {/* 🖼️ Grille des œuvres graphiques si chargement réussi */}
      {!loading && !erreur && (
        <div className="galerie-grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* On parcourt la liste des œuvres */}
            {oeuvres.map((oeuvre) => (
              <div
                key={oeuvre.id}
                className="photo-card group relative bg-[#151520] rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#d6c48733] flex flex-col items-center"
              >
                {/* 🖼️ Image de l'œuvre */}
                <div className="h-64 overflow-hidden w-full">
                  {/* Affichage robuste de l'image + fallback local si erreur */}
                  <img
                    // Affichage de l'image avec la même logique que la galerie photo
                    src={
                      (() => {
                        // Debug : affiche l'URL image reçue
                        console.log("Image graphique reçue:", oeuvre.image);
                        if (oeuvre.image && oeuvre.image.startsWith("http")) {
                          return oeuvre.image;
                        } else if (oeuvre.image && oeuvre.image.startsWith("/uploads/")) {
                          return `${API_URL}${oeuvre.image}`;
                        } else if (oeuvre.image && oeuvre.image.startsWith("/images/")) {
                          return oeuvre.image;
                        } else if (oeuvre.image) {
                          return `/images/${oeuvre.image}`;
                        } else {
                          return "/images/placeholder.jpg";
                        }
                      })()
                    }
                    alt={oeuvre.titre || "Œuvre graphique"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      // Empêche la boucle infinie si le placeholder échoue aussi
                      if (!e.currentTarget.src.endsWith("/images/placeholder.jpg")) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/placeholder.jpg";
                      }
                    }}
                  />
                </div>

                {/* 📋 Détails de l'œuvre */}
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

                  {/* 🛒 Bouton pour acheter ou en savoir plus */}
                  {/* 🛒 Bouton pour acheter */}
                  <button
                    onClick={() => handleAjouterAuPanier(oeuvre)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-300 transition relative z-10"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification d'ajout au panier */}
      {notification && (
        <div className="notification fixed bottom-8 right-8 bg-[#d6c487] text-black px-6 py-3 rounded-sm shadow-lg z-50">
          {notification}
        </div>
      )}

      {/* ✅ Pied de page */}
      <Footer />
    </div>
  );
}
