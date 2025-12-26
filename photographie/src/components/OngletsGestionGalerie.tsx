// ==========================================================================
// 📦 Importation des composants de gestion à intégrer dans les différents onglets
// ==========================================================================
import GalerieForm from "./galerie/GalerieForm"; // Formulaire de gestion des images (ajout / modif)
import GestionGalerieGraphique from "./galerie/GestionGalerieGraphique"; // Visualisation graphique (vignettes, tags, etc.)
import GestionEvenements from "./GestionEvenements"; // Gestion CRUD des événements
import GestionPaiements from "./GestionPaiements"; // Gestion CRUD des paiements
import GestionPaniers from "./GestionPaniers"; // Gestion CRUD des paniers
import GestionTarifs from "./GestionTarifs"; // Gestion CRUD des tarifs
import GestionAccesPrive from "./GestionAccesPrive"; // Gestion Accès Privé (Client)

// 📌 Hook de React pour gérer l'état local (ici : l'onglet actif)
import { useState } from "react";

/* ==========================================================================
   🧭 Définition de la liste des onglets (chaque onglet a un nom + un composant à afficher)
   --------------------------------------------------------------------------
   - Le tableau `onglets` contient des objets avec :
     → `nom` : le libellé affiché sur le bouton
     → `composant` : le composant React correspondant à afficher
========================================================================== */
const onglets = [
  { nom: "Galerie", composant: <GalerieForm /> },
  { nom: "Galerie Graphique", composant: <GestionGalerieGraphique /> },
  { nom: "Événements", composant: <GestionEvenements /> },
  { nom: "Paiements", composant: <GestionPaiements /> },
  { nom: "Paniers", composant: <GestionPaniers /> },
  { nom: "Tarifs", composant: <GestionTarifs /> },
  { nom: "Accès Privé", composant: <GestionAccesPrive /> },
];

/* ==========================================================================
   🧩 Composant principal : gestion dynamique d’onglets avec rendu conditionnel
========================================================================== */
export default function OngletsGestionGalerie() {
  // État `actif` : index du tableau `onglets` indiquant quel onglet est actuellement actif
  const [actif, setActif] = useState(0); // Par défaut : 0 = "Galerie"

  return (
    <div>
      {/* ===============================================================
          🔘 Barre horizontale d’onglets (boutons de navigation)
          - Chaque bouton change l’onglet actif en mettant à jour `actif`
          - L'onglet actif est visuellement souligné
      =============================================================== */}
      <div className="flex border-b mb-4">
        {onglets.map((onglet, i) => (
          <button
            key={onglet.nom} // Clé unique basée sur le nom (obligatoire pour le rendu de liste)
            onClick={() => setActif(i)} // Lors du clic : on change l’onglet actif
            className={`
              px-4 py-2 -mb-px border-b-2 transition-all duration-150
              ${
                actif === i
                  ? "border-blue-600 text-blue-600 font-bold" // Style mis en évidence pour l’onglet actif
                  : "border-transparent text-gray-500" // Style atténué pour les onglets inactifs
              }
            `}
          >
            {/* 🏷️ Nom de l’onglet (ex. Galerie, Événements, Paiements...) */}
            {onglet.nom}
          </button>
        ))}
      </div>

      {/* ===============================================================
          🧱 Zone de contenu : affiche dynamiquement le composant
          correspondant à l’onglet actuellement sélectionné
      =============================================================== */}
      <div className="bg-none rounded shadow p-4">
        {/* ⚙️ Affichage conditionnel basé sur l’index actif */}
        {onglets[actif].composant}
      </div>
    </div>
  );
}
