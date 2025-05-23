// Page TirageEnLigne.tsx : page moderne, claire, et conforme à la charte du projet
import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "../styles/home.css"; // Pour la grille et le style général
import "../styles/tirage.css"; // (À créer/adapter si besoin pour affiner le style tirage)
import { Link } from "react-router-dom";
import { ModalTirage, FormatOption } from "../components/tirage/ModalTirage";

// Données typées pour les offres principales
const offres = [
  // Les images doivent être dans /public/images/ et accessibles via "/images/..."
  // (évite d'utiliser "../public/..." qui ne fonctionne pas en prod Vite)
  {
    titre: "Tirages",
    description: "formats standards",
    prix: "à partir de 0,22 €",
    image: "/images/tirages.png",
  },
  {
    titre: "Posters",
    description: "et agrandissements",
    prix: "à partir de 8,02 €",
    image: "/images/poster.png",
  },
  {
    titre: "Toile",
    description: "sur châssis bois",
    prix: "à partir de 39,16 €",
    image: "/images/toile.png",
  },
  {
    titre: "Cartes postales",
    description: "10 x 15 cm",
    prix: "à partir de 10,75 €",
    image: "/images/cartes.png",
  },
];

// Formats/supports proposés par offre (clé = titre de l'offre)
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

// Données typées pour les tarifs (à compléter selon besoins)
const tarifs = [
  {
    categorie: "Tirages papier",
    produits: [
      { nom: "Tirages", prix: "0,22 € ttc" },
      { nom: "Posters", prix: "8,02 € ttc" },
    ],
  },
  // poster
  {
    categorie: "Posters",
    produits: [{ nom: "Posters", prix: "8,02 € ttc" }],
  },
  // Toile
  {
    categorie: "Toile",
    produits: [{ nom: "Toile", prix: "39,16 € ttc" }],
  },
  // Cartes postales
  {
    categorie: "Cartes postales",
    produits: [
      { nom: "10 cartes postales", prix: "10,75 € ttc" },
      { nom: "10 cartes évènement + enveloppes", prix: "17,81 € ttc" },
    ],
  },
  // Ajoute les autres catégories ici...
];

const TirageEnLigne: React.FC = () => {
  // État pour gérer l'ouverture du modal et l'offre sélectionnée
  const [modalOpen, setModalOpen] = useState(false);
  const [offreActive, setOffreActive] = useState<typeof offres[0] | null>(null);

  useEffect(() => {
    document.title = "Tirage en ligne | Fabien Photographie";
  }, []);

  // Fonction pour ouvrir le modal avec l'offre sélectionnée
  const handleOpenModal = (offre: typeof offres[0]) => {
    setOffreActive(offre);
    setModalOpen(true);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setOffreActive(null);
  };

  return (
    <div className="home-page min-h-screen flex flex-col bg-neutral-900">
      <Navbar />
      <main className="flex flex-col items-center flex-1 w-full pt-28 pb-16 relative z-10">
        <h1 className="hero-title mb-8 mt-8 md:mt-12">
          <span className="hero-title-gradient">Tirage en ligne</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center">
          Importez vos photos à imprimer sur supports professionnels : tirages,
          posters, toiles, cartes et plus encore.
          <br />
          <span className="block mt-2 text-base text-white/70">
            Simple, rapide, livraison à domicile.
          </span>
        </p>
        {/* Grille des offres */}
        {/* Grille des offres principales (clic = ouverture du modal de commande) */}
        <section className="services-grid mb-12">
          {offres.map((offre) => (
            <div
              key={offre.titre}
              className="service-card group cursor-pointer"
              onClick={() => handleOpenModal(offre)}
              tabIndex={0}
              role="button"
              aria-label={`Commander ${offre.titre}`}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleOpenModal(offre)}
            >
              <img
                src={offre.image}
                alt={offre.titre}
                className="w-28 h-28 object-cover rounded-lg mx-auto mb-3 shadow group-hover:scale-105 transition-transform"
              />
              <h3 className="service-title">{offre.titre}</h3>
              <p className="service-description">{offre.description}</p>
              <span className="block mt-2 text-yellow-400 font-semibold">
                {offre.prix}
              </span>
            </div>
          ))}
        </section>

        {/* Modal de commande tirage/poster/toile/carte postale */}
        {modalOpen && offreActive && (
          <ModalTirage
            open={modalOpen}
            onClose={handleCloseModal}
            offre={{
              ...offreActive,
              formats: FORMATS_PAR_OFFRE[offreActive.titre as keyof typeof FORMATS_PAR_OFFRE] || [],
            }}
          />
        )}

        {/* Étapes du process */}
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
            <Link to="/auth" className="btn-main">
              Envoyez vos photos
            </Link>
          </div>
        </section>

        {/* Tableau des tarifs */}
        <section className="max-w-3xl w-full mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-300">Tarifs</h2>
          <div className="tarifs-accordion">
            {tarifs.map((cat, idx) => (
              <details
                key={cat.categorie}
                className="tarif-category mb-2 bg-[#232336] rounded overflow-hidden"
              >
                <summary className="font-semibold px-4 py-3 cursor-pointer select-none text-yellow-200 text-lg">
                  {cat.categorie}
                </summary>
                <ul className="pl-6 pr-4 pb-3">
                  {cat.produits.map((prod) => (
                    <li
                      key={prod.nom}
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
      <Footer />
    </div>
  );
};

export default TirageEnLigne;
