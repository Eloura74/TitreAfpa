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

// Importation de la modale de sélection de format
import { SelectionFormatModal } from "../components/galerie/SelectionFormatModal";

// Interface pour un tarif (format/support/prix) associé à une photo
interface TarifOeuvre {
  id: string;
  format: string;
  support: string;
  prix: number;
}

// Importation du type Tarif
import { Tarif } from "../types/tarif";

// ==============================
//  Définition de l'interface TypeScript pour typer les objets "Photo"
// ==============================
interface Photo {
  id?: number; // ID local optionnel (pour les données statiques)
  _id?: string; // ID MongoDB optionnel (pour les données issues de la base)
  src: string; // Chemin ou URL de l'image
  alt: string; // Texte alternatif pour l'accessibilité
  titre: string; // Titre de la photo
  description: string; // Description détaillée
  prix: number; // Prix en euros
  categorie: string; // Catégorie de la photo
  type: string; // Type de la photo
  tarifs?: TarifOeuvre[]; // Formats/supports/prix personnalisés
}

// ==============================
//  Composant principal : Galerie
// ==============================
export default function Galerie() {
  // Gestion des états avec useState :
  const [photos, setPhotos] = useState<Photo[]>([]); // Stocke toutes les photos (locales + MongoDB)
  const [notification, setNotification] = useState<string | null>(null); // Message temporaire pour feedback utilisateur
  const [categorieActive, setCategorieActive] = useState<string>("Toutes"); // Catégorie actuellement sélectionnée
  const [photoSelectionnee, setPhotoSelectionnee] = useState<Photo | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  // Stocke les tarifs à afficher dans la modale
  const [tarifsPourModale, setTarifsPourModale] = useState<
    (TarifOeuvre | Tarif)[]
  >([]);

  // Récupération de la fonction "ajouterArticle" via le contexte panier
  const { ajouterArticle } = usePanier();

  /**
   * Filtre les tarifs applicables à une photo selon la logique métier
   * Retourne les tarifs dynamiques de la photo (formats/supports/prix)
   * SOLUTION RADICALE : Crée un tarif par défaut si aucun n'est disponible
   */
  function getTarifsPourPhoto(photo: Photo) {
    // Si la photo a des tarifs valides, on les utilise
    if (Array.isArray(photo.tarifs) && photo.tarifs.length > 0) {
      console.log("Tarifs existants trouvés:", photo.tarifs);
      return photo.tarifs;
    }

    // Sinon, on crée un tarif par défaut basé sur le prix de la photo
    console.log("Création d'un tarif par défaut pour", photo.titre);
    const tarifParDefaut = [
      {
        id: `default-${photo._id || photo.id || crypto.randomUUID()}`,
        format: "Standard",
        support: "Papier photo",
        prix: photo.prix || 0,
      },
    ];

    // On modifie la photo pour lui ajouter ce tarif (pour les prochains appels)
    photo.tarifs = tarifParDefaut;
    return tarifParDefaut;
  }

  /**
   * Handler amélioré pour l'ajout au panier depuis la galerie
   * - Crée toujours au moins un tarif par défaut
   * - Ouvre la modale de sélection si plusieurs formats
   * - Ajoute direct si un seul format
   */
  function handleAjouterAuPanier(photo: Photo) {
    // SOLUTION RADICALE : On force la création d'au moins un tarif
    const tarifsDisponibles = getTarifsPourPhoto(photo);
    console.log("Tarifs disponibles (après traitement):", tarifsDisponibles);

    // On est sûr d'avoir au moins un tarif maintenant
    if (tarifsDisponibles.length === 1) {
      // Si un seul tarif, ajout direct au panier
      const tarif = tarifsDisponibles[0];
      ajouterArticle({
        id: crypto.randomUUID(),
        nom: `${photo.titre} (${tarif.format}, ${tarif.support})`,
        prix: tarif.prix,
        quantite: 1,
        image: photo.src,
      });
      setNotification(`${photo.titre} ajouté au panier !`);
    } else {
      // Si plusieurs tarifs, ouvre la modale de sélection
      setTarifsPourModale(tarifsDisponibles);
      setPhotoSelectionnee(photo);
      setModalVisible(true);
    }
  }

  // ==============================
  //  useEffect : Chargement des données au montage du composant
  // ==============================
  useEffect(() => {
    // 1️⃣ Chargement des données locales depuis le fichier JSON
    const photosLocales: Photo[] = galerieData.map((photo) => ({
      ...photo,
      type: "standard", // Assigne simplement une valeur par défaut
    }));

    // 2️⃣ Récupération des photos stockées sur le serveur (MongoDB)
    fetch(`${import.meta.env.VITE_API_URL}/api/galerie`)
      .then((res) => res.json()) // Conversion de la réponse en JSON
      .then((data: Photo[]) => {
        // Vérification des données reçues
        console.log("Données reçues de l'API:", data);

        // Transformation des données pour corriger le chemin des images issues du serveur
        const photosServeur = data.map((photo) => {
          // Vérification des tarifs pour chaque photo
          console.log(`Photo ${photo.titre} - tarifs:`, photo.tarifs);

          // Création d'un nouvel objet avec tous les champs, y compris tarifs
          return {
            ...photo,
            // Correction : ne concatène pas l’URL API si le src est déjà une URL Cloudinary ou un chemin absolu
            src: photo.src.startsWith('http')
                ? photo.src
                : photo.src.startsWith('/images/')
                ? photo.src
                : `/images/${photo.src}`,
            // Assurons-nous que tarifs est bien préservé
            tarifs: Array.isArray(photo.tarifs) ? photo.tarifs : [],
          };
        });

        // 3️⃣ Fusion des deux sources (locales + serveur) et mise à jour de l'état
        setPhotos([...photosLocales, ...photosServeur]);
      })
      .catch((err) => {
        // En cas d'erreur (ex : serveur hors ligne), fallback sur les données locales uniquement
        console.error("Erreur chargement MongoDB:", err);
        setPhotos(photosLocales);
      });
  }, []); // [] signifie que ce code ne s'exécute qu'une seule fois (au montage)

  // ==============================
  //  Fonction : Ajouter une photo au panier
  // ==============================
  // const ajouterAuPanier = (photo: Photo, tarifSelectionne?: Tarif) => {
  //   try {
  //     // Si un tarif est sélectionné (via la modale), on l'utilise pour le prix/support/format
  //     const articlePanier = tarifSelectionne
  //       ? {
  //           id: String(photo._id || photo.id) + "-" + tarifSelectionne.id, // identifiant unique par photo+tarif
  //           nom: `${photo.titre} - ${tarifSelectionne.nom} (${tarifSelectionne.format}, ${tarifSelectionne.support})`,
  //           prix: tarifSelectionne.prix,
  //           quantite: 1,
  //           image: photo.src,
  //         }
  //       : {
  //           id: String(photo._id || photo.id),
  //           nom: photo.titre,
  //           prix: photo.prix,
  //           quantite: 1,
  //           image: photo.src,
  //         };
  //     ajouterArticle(articlePanier);
  //     setNotification(`${articlePanier.nom} ajouté au panier`);
  //     setTimeout(() => setNotification(null), 3000);
  //   } catch (e) {
  //     console.error("Erreur lors de l'ajout au panier:", e);
  //     setNotification("Erreur lors de l'ajout au panier");
  //   }
  //   setModalVisible(false);
  // };

  // ==============================
  //  Handler : sélection d’un format dans la modale
  // ==============================
  const handleSelectFormat = (tarif: TarifOeuvre | Tarif) => {
    if (photoSelectionnee) {
      // Création d'un article panier adapté au type de tarif
      const articlePanier = {
        id: crypto.randomUUID(),
        nom: `${photoSelectionnee.titre} (${
          "format" in tarif ? tarif.format : ""
        }, ${"support" in tarif ? tarif.support : ""})`,
        prix: tarif.prix,
        quantite: 1,
        image: photoSelectionnee.src,
      };

      // Ajout au panier et notification
      ajouterArticle(articlePanier);
      setNotification(`${photoSelectionnee.titre} ajouté au panier !`);
      setTimeout(() => setNotification(null), 3000);

      // Fermeture de la modale
      setPhotoSelectionnee(null);
      setModalVisible(false);
    }
  };

  // ==============================
  //  Génération dynamique des catégories à partir des photos chargées
  // ==============================
  const categories = [
    "Toutes", // Option par défaut pour afficher toutes les photos
    ...Array.from(new Set(photos.map((photo) => photo.categorie))), // Extraction unique des catégories existantes
  ];

  // ==============================
  //  Filtrage des photos selon la catégorie sélectionnée
  // ==============================
  const photosFiltered =
    categorieActive === "Toutes"
      ? photos // Si "Toutes" est sélectionné, on affiche toutes les photos
      : photos.filter((photo) => photo.categorie === categorieActive); // Sinon, filtre par catégorie

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
                  {/* Affichage intelligent : Cloudinary (URL complète) ou fichier local */}
                  <img
                    src={
                      photo.src.startsWith('http')
                        ? photo.src // URL Cloudinary
                        : photo.src.startsWith('/images/')
                        ? photo.src // Chemin déjà correct
                        : `/images/${photo.src}` // Sinon, on préfixe
                    }
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-xs px-3 py-1 rounded-sm">
                {Array.isArray(photo.tarifs) && photo.tarifs.length > 0 ? (
                  <ul className="mt-2">
                    {photo.tarifs.map((tarif) => (
                      <li
                        key={
                          tarif.id ||
                          `${tarif.format}-${tarif.support}-${tarif.prix}`
                        }
                        className="text-yellow-300 text-sm"
                      >
                        <span className="font-bold">{tarif.format}</span> —{" "}
                        {tarif.support} : {tarif.prix}€
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400 text-xs mt-2">
                    Aucun format disponible pour cette photo.
                  </div>
                )}
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
                    onClick={() => handleAjouterAuPanier(photo)}
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

      {modalVisible && photoSelectionnee && (
        <SelectionFormatModal
          tarifs={tarifsPourModale}
          onSelect={handleSelectFormat}
          onClose={() => setModalVisible(false)}
        />
      )}

      <Footer />
    </div>
  );
}
