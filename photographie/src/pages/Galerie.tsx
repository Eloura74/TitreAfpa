import { useState, useEffect } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css";
import "../styles/galerie.css";

// Import des images
import photo1 from "../assets/images/photo1.jpg";
import photo2 from "../assets/images/photo2.jpg";
import photo3 from "../assets/images/photo3.jpg";
import photo4 from "../assets/images/photo4.jpg";
import photo5 from "../assets/images/photo5.jpg";
import photo6 from "../assets/images/photo6.jpg";
import photo7 from "../assets/images/photo7.jpg";
import photo8 from "../assets/images/photo8.jpg";
import photo9 from "../assets/images/photo9.jpg";
import photo10 from "../assets/images/photo10.jpg";
import photo11 from "../assets/images/photo11.jpg";
import photo12 from "../assets/images/photo12.jpg";

// Créer un type pour nos photos
interface Photo {
  id: number;
  src: string;
  alt: string;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
}

// Page Galerie
export default function Galerie() {
  // État pour stocker les photos
  const [photos, setPhotos] = useState<Photo[]>([]);
  // État pour stocker les notifications d'ajout au panier
  const [notification, setNotification] = useState<string | null>(null);
  // État pour filtrer les photos par catégorie
  const [categorieActive, setCategorieActive] = useState<string>("Toutes");

  // Préparer les données des photos
  useEffect(() => {
    const photosData: Photo[] = [
      {
        id: 1,
        src: photo1,
        alt: "Portrait artistique en noir et blanc",
        titre: "Regard Profond",
        description:
          "Portrait artistique en noir et blanc capturant l'émotion et la profondeur du regard",
        prix: 120,
        categorie: "Portrait",
      },
      {
        id: 2,
        src: photo2,
        alt: "Paysage naturel au coucher du soleil",
        titre: "Horizon Doré",
        description:
          "Magnifique paysage capturé au moment précis où le soleil touche l'horizon",
        prix: 150,
        categorie: "Paysage",
      },
      {
        id: 3,
        src: photo3,
        alt: "Scène urbaine nocturne",
        titre: "Nuit Urbaine",
        description:
          "Vue artistique d'une rue animée dans une métropole capturée de nuit",
        prix: 135,
        categorie: "Urbain",
      },
      {
        id: 4,
        src: photo4,
        alt: "Macrophotographie de fleur",
        titre: "Pétales de Rosée",
        description:
          "Gros plan sur une fleur délicate avec des gouttes de rosée matinale",
        prix: 95,
        categorie: "Nature",
      },
      {
        id: 5,
        src: photo5,
        alt: "Photo de mariage émotionnelle",
        titre: "Union Éternelle",
        description: "Moment d'émotion capturé lors d'une cérémonie de mariage",
        prix: 180,
        categorie: "Événement",
      },
      {
        id: 6,
        src: photo6,
        alt: "Architecture moderne",
        titre: "Lignes Contemporaines",
        description:
          "Étude géométrique d'un bâtiment à l'architecture avant-gardiste",
        prix: 140,
        categorie: "Architecture",
      },
      {
        id: 7,
        src: photo7,
        alt: "Portrait familial en extérieur",
        titre: "Liens Familiaux",
        description:
          "Portrait de famille capturant la complicité et l'amour entre les membres",
        prix: 160,
        categorie: "Portrait",
      },
      {
        id: 8,
        src: photo8,
        alt: "Paysage montagneux",
        titre: "Sommets Majestueux",
        description:
          "Vue panoramique de montagnes enneigées au lever du soleil",
        prix: 175,
        categorie: "Paysage",
      },
      {
        id: 9,
        src: photo9,
        alt: "Nature sauvage",
        titre: "Faune Sauvage",
        description:
          "Photo animalière capturant un moment rare de la vie sauvage",
        prix: 190,
        categorie: "Nature",
      },
      {
        id: 10,
        src: photo10,
        alt: "Événement culturel",
        titre: "Festival des Lumières",
        description:
          "Ambiance festive et colorée d'un festival culturel nocturne",
        prix: 145,
        categorie: "Événement",
      },
      {
        id: 11,
        src: photo11,
        alt: "Détail architectural historique",
        titre: "Héritage Ancien",
        description:
          "Détail architectural d'un monument historique témoignant du passé",
        prix: 130,
        categorie: "Architecture",
      },
      {
        id: 12,
        src: photo12,
        alt: "Scène de rue urbaine",
        titre: "Rythme Citadin",
        description:
          "Scène de vie quotidienne dans un quartier animé de la ville",
        prix: 110,
        categorie: "Urbain",
      },
    ];

    setPhotos(photosData);
  }, []);

  // Fonction pour ajouter une photo au panier
  const ajouterAuPanier = (photo: Photo) => {
    // Ici, on simule l'ajout au panier
    // Dans une application réelle, il faudrait stocker ces informations dans un état global ou localStorage
    console.log(`Photo ajoutée au panier: ${photo.titre} - ${photo.prix}€`);

    // Afficher une notification
    setNotification(`${photo.titre} ajouté au panier`);

    // Faire disparaître la notification après 3 secondes
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Obtenir les catégories uniques pour le filtre
  const categories = [
    "Toutes",
    ...Array.from(new Set(photos.map((photo) => photo.categorie))),
  ];

  // Filtrer les photos selon la catégorie sélectionnée
  const photosFiltered =
    categorieActive === "Toutes"
      ? photos
      : photos.filter((photo) => photo.categorie === categorieActive);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      {/* Navbar */}
      <Navbar />
      
      {/* En-tête de la galerie */}
      <div className="galerie-header">
        <h1 className="galerie-title">
          Notre Galerie Photo
        </h1>
        <p className="galerie-description">
          Découvrez notre collection de photographies artistiques disponibles à
          l'achat. Chaque image est imprimée sur du papier de haute qualité et
          livrée avec un certificat d'authenticité.
        </p>
      </div>

      {/* Filtres de catégorie */}
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

      {/* Grille de photos */}
      <div className="galerie-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photosFiltered.map((photo) => (
            <div
              key={photo.id}
              className="photo-card group relative bg-[#151520] rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#d6c48733]"
            >
              {/* Image */}
              <div className="h-64 overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Badge catégorie */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-xs px-3 py-1 rounded-sm">
                {photo.categorie}
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="photo-title mb-2">{photo.titre}</h3>
                <p className="photo-description text-gray-400 mb-4 h-12">
                  {photo.description}
                </p>

                {/* Prix et bouton d'action */}
                <div className="flex justify-between items-center mt-4">
                  <span className="photo-price text-[#ffe992] text-xl">
                    {photo.prix}€
                  </span>
                  <button
                    onClick={() => ajouterAuPanier(photo)}
                    className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="notification fixed bottom-8 right-8 bg-[#d6c487] text-black px-6 py-3 rounded-sm shadow-lg">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {notification}
          </p>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
