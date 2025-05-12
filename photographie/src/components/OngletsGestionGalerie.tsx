// Importation des composants de gestion à afficher dans les onglets
import GalerieForm from "./galerie/GalerieForm";
import GestionGalerieGraphique from "./galerie/GestionGalerieGraphique";
import GestionEvenements from "./GestionEvenements";
import GestionPaiements from "./GestionPaiements";
import GestionPaniers from "./GestionPaniers";
import GestionTarifs from "./GestionTarifs";

import { useState } from "react";

/* -------------------------------------------------------------------------
   📋 Définition des onglets : chaque entrée associe un nom + un composant
------------------------------------------------------------------------- */
const onglets = [
  { nom: "Galerie", composant: <GalerieForm /> },
  { nom: "Galerie Graphique", composant: <GestionGalerieGraphique /> },
  { nom: "Événements", composant: <GestionEvenements /> },
  { nom: "Paiements", composant: <GestionPaiements /> },
  { nom: "Paniers", composant: <GestionPaniers /> },
  { nom: "Tarifs", composant: <GestionTarifs /> },
];

/* -------------------------------------------------------------------------
   📦 Composant principal : gestion des onglets
------------------------------------------------------------------------- */
export default function OngletsGestionGalerie() {
  // État pour suivre l'onglet actif (index dans le tableau "onglets")
  const [actif, setActif] = useState(0);

  return (
    <div>
      {/* Barre d’onglets avec un bouton par vue */}
      <div className="flex border-b mb-4">
        {onglets.map((onglet, i) => (
          <button
            key={onglet.nom} // Clé unique basée sur le nom
            onClick={() => setActif(i)} // Changement d’onglet actif
            className={`
              px-4 py-2 -mb-px border-b-2 transition-all duration-150
              ${
                actif === i
                  ? "border-blue-600 text-blue-600 font-bold" // Style actif
                  : "border-transparent text-gray-500"
              }         // Style inactif
            `}
          >
            {onglet.nom}
          </button>
        ))}
      </div>

      {/* Contenu dynamique affiché selon l'onglet actif */}
      <div className="bg-none rounded shadow p-4">
        {onglets[actif].composant}
      </div>
    </div>
  );
}
