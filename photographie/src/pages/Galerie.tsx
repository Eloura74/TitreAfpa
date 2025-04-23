import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css";
import "../styles/galerie.css";
import { usePanier } from "../store/panierContext";

// Données locales
import galerieData from "../config/galerie.json";

// Créer un type pour nos photos
interface Photo {
  id?: number; // facultatif pour celles de Mongo
  _id?: string; // ID Mongo
  src: string;
  alt: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
}

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [categorieActive, setCategorieActive] = useState<string>("Toutes");
  const { ajouterArticle } = usePanier(); // Hook panier

  useEffect(() => {
    // 1. Données locales
    const photosLocales: Photo[] = galerieData;

    // 2. Données MongoDB (images uploadées)
    fetch("http://localhost:5000/api/galerie")
      .then((res) => res.json())
      .then((data: Photo[]) => {
        const photosServeur = data.map((photo) => ({
          ...photo,
          src: `http://localhost:5000${photo.src}`, // chemin complet
        }));

        // 3. Fusion des deux sources
        setPhotos([...photosLocales, ...photosServeur]);
      })
      .catch((err) => {
        console.error("Erreur chargement MongoDB:", err);
        setPhotos(photosLocales); // fallback uniquement local
      });
  }, []);

  // Ajout d'un article au panier
  const ajouterAuPanier = (photo: Photo) => {
    try {
      console.log("Tentative d'ajout au panier", photo);
      ajouterArticle({
        id: String(photo._id || photo.id),
        nom: photo.titre,
        prix: photo.prix,
        quantite: 1,
        image: photo.src, // Ajout automatique de la prévisualisation
      });
      setNotification(`${photo.titre} ajouté au panier`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error("Erreur lors de l'ajout au panier:", e);
      setNotification("Erreur lors de l'ajout au panier");
    }
  };

  const categories = [
    "Toutes",
    ...Array.from(new Set(photos.map((photo) => photo.categorie))),
  ];

  const photosFiltered =
    categorieActive === "Toutes"
      ? photos
      : photos.filter((photo) => photo.categorie === categorieActive);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      <Navbar />

      <div className="galerie-header">
        <h1 className="galerie-title">Notre Galerie Photo</h1>
        <p className="galerie-description">
          Découvrez notre collection de photographies artistiques disponibles à
          l'achat.
        </p>
      </div>

      {/* Filtres */}
      <div className="category-filters">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((categorie) => (
            <button
              key={categorie}
              onClick={() => setCategorieActive(categorie)}
              className={`filter-button px-4 py-2 rounded-sm transition-all duration-300 ${
                categorieActive === categorie
                  ? "active bg-gradient-to-r from-[#d6c487] to-[#ffe992] text-black font-semibold"
                  : "bg-[#1a1a20] text-gray-300 hover:bg-[#252530]"
              }`}
            >
              {categorie}
            </button>
          ))}
        </div>
      </div>

      {/* Galerie */}
      <div className="galerie-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photosFiltered.map((photo) => (
            <div
              key={photo._id || photo.id}
              className="photo-card group relative bg-[#151520] rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#d6c48733]"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-xs px-3 py-1 rounded-sm">
                {photo.categorie}
              </div>
              <div className="p-6">
                <h3 className="photo-title mb-2">{photo.titre}</h3>
                <p className="photo-description text-gray-400 mb-4 h-12">
                  {photo.description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="photo-price text-[#ffe992] text-xl">
                    {photo.prix}€
                  </span>
                  <button
                    onClick={() => ajouterAuPanier(photo)}
                    className="cart-button bg-transparent z-50 border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {notification && (
        <div className="notification fixed bottom-8 right-8 bg-[#d6c487] text-black px-6 py-3 rounded-sm shadow-lg">
          {notification}
        </div>
      )}

      <Footer />
    </div>
  );
}
