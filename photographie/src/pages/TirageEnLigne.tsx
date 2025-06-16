// ==============================
//  Importations des modules et composants nécessaires
// ==============================

// React et ses hooks pour gérer les effets de cycle de vie (useEffect) et l'état local (useState)
import React, { useEffect, useState } from "react";

// Composants communs du projet pour la navigation et le pied de page
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

// Import des styles globaux et spécifiques à la page tirage
import "../styles/home.css"; // Styles généraux (ex : grille, typographie)
import "../styles/tirage.css"; // Styles spécifiques au tirage en ligne (à créer ou adapter)

// Pour la navigation interne sans rechargement de la page
import { Link } from "react-router-dom";

// Composant modal de commande tirage, gérant l'upload, sélection de format, quantité, ajout panier
import { ModalTirage, FormatOption } from "../components/tirage/ModalTirage";

// ==============================
//  Données des offres principales avec images, titres, description et prix affichés
// ==============================
const offres = [
  // Note : Les images doivent être placées dans le dossier /public/images/
  {
    titre: "Tirages",
    description: "formats standards",
    prix: "à partir de 0,22 €",
    image: "/static/tirages.png",
  },
  {
    titre: "Posters",
    description: "et agrandissements",
    prix: "à partir de 8,02 €",
    image: "/static/poster.png",
  },
  {
    titre: "Toile",
    description: "sur châssis bois",
    prix: "à partir de 39,16 €",
    image: "/static/toile.png",
  },
  {
    titre: "Cartes postales",
    description: "10 x 15 cm",
    prix: "à partir de 10,75 €",
    image: "/static/cartes.png",
  },
];

// ==============================
//  Formats et tarifs par offre, pour la sélection dans la modale
// ==============================
const FORMATS_PAR_OFFRE: Record<string, FormatOption[]> = {
  Tirages: [
    { label: "10x15 cm (standard)", value: "10x15", prix: 0.22 },
    { label: "13x18 cm", value: "13x18", prix: 0.39 },
    { label: "15x21 cm", value: "15x21", prix: 0.65 },
  ],
  Posters: [
    { label: "30x40 cm", value: "30x40", prix: 8.02 },
    { label: "40x60 cm", value: "40x60", prix: 12.99 },
  ],
  Toile: [
    { label: "30x40 cm sur châssis", value: "30x40", prix: 39.16 },
    { label: "50x70 cm sur châssis", value: "50x70", prix: 59.99 },
  ],
  "Cartes postales": [
    { label: "10 cartes 10x15 cm", value: "10x15", prix: 10.75 },
    { label: "20 cartes 10x15 cm", value: "20x15", prix: 19.99 },
  ],
};

// ==============================
//  Données statiques des tarifs affichés sous forme d'accordéon
//  (à compléter ou modifier selon besoins spécifiques)
// ==============================
const tarifs = [
  {
    categorie: "Tirages papier",
    produits: [
      { nom: "Tirages", prix: "0,22 € ttc" },
      { nom: "Posters", prix: "8,02 € ttc" },
    ],
  },
  {
    categorie: "Posters",
    produits: [{ nom: "Posters", prix: "8,02 € ttc" }],
  },
  {
    categorie: "Toile",
    produits: [{ nom: "Toile", prix: "39,16 € ttc" }],
  },
  {
    categorie: "Cartes postales",
    produits: [
      { nom: "10 cartes postales", prix: "10,75 € ttc" },
      { nom: "10 cartes évènement + enveloppes", prix: "17,81 € ttc" },
    ],
  },
];

// ==============================
//  Composant fonctionnel principal de la page Tirage en ligne
// ==============================
const TirageEnLigne: React.FC = () => {
  // États pour contrôler la modale de commande (ouverte/fermée) et l'offre sélectionnée
  const [modalOpen, setModalOpen] = useState(false);
  const [offreActive, setOffreActive] = useState<(typeof offres)[0] | null>(
    null
  );

  // useEffect pour modifier le titre de l’onglet navigateur au chargement de la page
  useEffect(() => {
    document.title = "Tirage en ligne | Fabien Photographie";
  }, []);

  // Fonction appelée quand l’utilisateur clique sur une offre
  // Ouvre la modale et mémorise l'offre choisie
  const handleOpenModal = (offre: (typeof offres)[0]) => {
    setOffreActive(offre);
    setModalOpen(true);
  };

  // Fonction pour fermer la modale et réinitialiser l'offre active
  const handleCloseModal = () => {
    setModalOpen(false);
    setOffreActive(null);
  };

  // ==============================
  //  Rendu JSX du composant
  // ==============================
  return (
    <div className="home-page min-h-screen flex flex-col bg-neutral-900">
      <Navbar /> {/* Barre de navigation */}
      {/* Contenu principal centré */}
      <main className="flex flex-col items-center flex-1 w-full pt-28 pb-16 relative z-10">
        {/* Titre principal avec effet dégradé */}
        <h1 className="hero-title mb-8 mt-8 md:mt-12">
          <span className="hero-title-gradient">Tirage en ligne</span>
        </h1>

        {/* Texte d’introduction, responsive, centré */}
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center">
          Importez vos photos à imprimer sur supports professionnels : tirages,
          posters, toiles, cartes et plus encore.
          <br />
          <span className="block mt-2 text-base text-white/70">
            Simple, rapide, livraison à domicile.
          </span>
        </p>

        {/* Section principale : grille affichant les offres */}
        <section className="services-grid mb-12">
          {offres.map((offre) => (
            <div
              key={offre.titre} // Clé unique pour React
              className="service-card group cursor-pointer"
              onClick={() => handleOpenModal(offre)} // Ouvre la modale au clic
              tabIndex={0} // Permet la navigation clavier
              role="button" // Accessibilité : rôle bouton
              aria-label={`Commander ${offre.titre}`} // Texte d'aide pour lecteurs d'écran
              // Gestion clavier : entrée ou espace déclenche la modale
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleOpenModal(offre)
              }
            >
              {/* Image illustrant l'offre */}
              <img
                src={offre.image}
                alt={offre.titre}
                className="w-28 h-28 object-cover rounded-lg mx-auto mb-3 shadow group-hover:scale-105 transition-transform"
              />
              {/* Titre de l'offre */}
              <h3 className="service-title">{offre.titre}</h3>
              {/* Description courte */}
              <p className="service-description">{offre.description}</p>
              {/* Prix de départ */}
              <span className="block mt-2 text-yellow-400 font-semibold">
                {offre.prix}
              </span>
            </div>
          ))}
        </section>

        {/* Modale de commande, affichée uniquement si ouverte et une offre est sélectionnée */}
        {modalOpen && offreActive && (
          <ModalTirage
            open={modalOpen}
            onClose={handleCloseModal}
            // Passe à la modale l’offre active et les formats disponibles pour cette offre
            offre={{
              ...offreActive,
              formats:
                FORMATS_PAR_OFFRE[
                  offreActive.titre as keyof typeof FORMATS_PAR_OFFRE
                ] || [],
            }}
          />
        )}

        {/* Section explicative sur le déroulement de la commande */}
        <section className="mb-12 max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4 text-yellow-300">
            Comment ça marche&nbsp;?
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-white/90 bg-[#191923] rounded-lg p-6 shadow">
            <li>
              <b>J’accède à mon compte</b> ou je crée mon compte
            </li>
            <li>
              <b>J’envoie mes photos</b>
            </li>
            <li>
              <b>Je choisis mes formats</b> de tirages et supports
            </li>
            <li>
              <b>Je valide ma commande</b> et la reçois à domicile
            </li>
          </ol>
          <div className="flex justify-center mt-6">
            {/* Lien vers la page d’authentification */}
            <Link to="/auth" className="btn-main">
              Envoyez vos photos
            </Link>
          </div>
        </section>

        {/* Section affichage des tarifs en accordéon */}
        <section className="max-w-3xl w-full mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-300">Tarifs</h2>
          <div className="tarifs-accordion">
            {tarifs.map((cat) => (
              <details
                key={cat.categorie} // Clé unique par catégorie
                className="tarif-category mb-2 bg-[#232336] rounded overflow-hidden"
              >
                {/* Titre de la catégorie */}
                <summary className="font-semibold px-4 py-3 cursor-pointer select-none text-yellow-200 text-lg">
                  {cat.categorie}
                </summary>
                {/* Liste des produits dans la catégorie */}
                <ul className="pl-6 pr-4 pb-3">
                  {cat.produits.map((prod) => (
                    <li
                      key={prod.nom} // Clé unique par produit
                      className="flex justify-between py-1 border-b border-[#ffe992]/10 last:border-0 text-white/90"
                    >
                      <span>{prod.nom}</span>
                      <span className="text-yellow-300">{prod.prix}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer /> {/* Pied de page */}
    </div>
  );
};

// Export du composant pour pouvoir l'importer ailleurs
export default TirageEnLigne;
