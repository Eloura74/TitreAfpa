// ==============================
//  Importations des modules et ressources
// ==============================

// React et ses hooks pour gérer l'état (useState) et le cycle de vie du composant (useEffect)
import { useState, useEffect } from "react";

// Importation des composants de layout
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

// Importation des fichiers de styles globaux et spécifiques à la galerie
import "../styles/globals.css";
import "../styles/galerie.css";

// Importation du contexte personnalisé pour gérer le panier (state global)
import { usePanier } from "../store/panierContext";

// Importation des données locales de la galerie (JSON statique)
import galerieData from "../config/galerie.json";


// ==============================
//  Définition de l'interface TypeScript pour typer les objets "Photo"
// ==============================
interface Photo {
  id?: number;      // ID local optionnel (pour les données statiques)
  _id?: string;     // ID MongoDB optionnel (pour les données issues de la base)
  src: string;      // Chemin ou URL de l'image
  alt: string;      // Texte alternatif pour l'accessibilité
  titre: string;    // Titre de la photo
  description: string; // Description détaillée
  prix: number;     // Prix en euros
  categorie: string; // Catégorie de la photo
}


// ==============================
//  Composant principal : Galerie
// ==============================
export default function Galerie() {
  // Gestion des états avec useState :
  const [photos, setPhotos] = useState<Photo[]>([]);           // Stocke toutes les photos (locales + MongoDB)
  const [notification, setNotification] = useState<string | null>(null);  // Message temporaire pour feedback utilisateur
  const [categorieActive, setCategorieActive] = useState<string>("Toutes"); // Catégorie actuellement sélectionnée

  // Récupération de la fonction "ajouterArticle" via le contexte panier
  const { ajouterArticle } = usePanier();


  // ==============================
  //  useEffect : Chargement des données au montage du composant
  // ==============================
  useEffect(() => {
    // 1️⃣ Chargement des données locales depuis le fichier JSON
    const photosLocales: Photo[] = galerieData;

    // 2️⃣ Récupération des photos stockées sur le serveur (MongoDB)
    fetch("http://localhost:5001/api/galerie")
      .then((res) => res.json())   // Conversion de la réponse en JSON
      .then((data: Photo[]) => {
        // Transformation des données pour corriger le chemin des images issues du serveur
        const photosServeur = data.map((photo) => ({
          ...photo,
          src: `http://localhost:5001${photo.src}`,  // On complète le chemin relatif
        }));

        // 3️⃣ Fusion des deux sources (locales + serveur) et mise à jour de l'état
        setPhotos([...photosLocales, ...photosServeur]);
      })
      .catch((err) => {
        // En cas d'erreur (ex : serveur hors ligne), fallback sur les données locales uniquement
        console.error("Erreur chargement MongoDB:", err);
        setPhotos(photosLocales);
      });
  }, []);  // [] signifie que ce code ne s'exécute qu'une seule fois (au montage)


  // ==============================
  //  Fonction : Ajouter une photo au panier
  // ==============================
  const ajouterAuPanier = (photo: Photo) => {
    try {
      console.log("Tentative d'ajout au panier", photo);

      // Appel de la fonction du contexte pour ajouter l'article au panier
      ajouterArticle({
        id: String(photo._id || photo.id),  // On s'assure que l'ID est une chaîne de caractères
        nom: photo.titre,
        prix: photo.prix,
        quantite: 1,
        image: photo.src,   // On stocke aussi l'image pour l'affichage dans le panier
      });

      // Affichage d'une notification temporaire de succès
      setNotification(`${photo.titre} ajouté au panier`);
      setTimeout(() => setNotification(null), 3000);  // Disparition après 3 secondes

    } catch (e) {
      console.error("Erreur lors de l'ajout au panier:", e);
      setNotification("Erreur lors de l'ajout au panier");
    }
  };


  // ==============================
  //  Génération dynamique des catégories à partir des photos chargées
  // ==============================
  const categories = [
    "Toutes",  // Option par défaut pour afficher toutes les photos
    ...Array.from(new Set(photos.map((photo) => photo.categorie)))  // Extraction unique des catégories existantes
  ];


  // ==============================
  //  Filtrage des photos selon la catégorie sélectionnée
  // ==============================
  const photosFiltered =
    categorieActive === "Toutes"
      ? photos    // Si "Toutes" est sélectionné, on affiche toutes les photos
      : photos.filter((photo) => photo.categorie === categorieActive);  // Sinon, filtre par catégorie


  // ==============================
  //  Affichage de la galerie
  // ==============================
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
