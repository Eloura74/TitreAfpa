import GalerieForm from "./galerie/GalerieForm";
import GestionEvenements from "./GestionEvenements";
import GestionPaiements from "./GestionPaiements";
import GestionPaniers from "./GestionPaniers";
import GestionTarifs from "./GestionTarifs";
import { useState } from "react";

const onglets = [
  { nom: "Galerie", composant: <GalerieForm /> },
  { nom: "Événements", composant: <GestionEvenements /> },
  { nom: "Paiements", composant: <GestionPaiements /> },
  { nom: "Paniers", composant: <GestionPaniers /> },
  { nom: "Tarifs", composant: <GestionTarifs /> },
];

export default function OngletsGestionGalerie() {
  const [actif, setActif] = useState(0);
  return (
    <div>
      <div className="flex border-b mb-4">
        {onglets.map((onglet, i) => (
          <button
            key={onglet.nom}
            className={`px-4 py-2 -mb-px border-b-2 transition-all duration-150 ${
              actif === i
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActif(i)}
          >
            {onglet.nom}
          </button>
        ))}
      </div>
      <div className="bg-none rounded shadow p-4">
        {onglets[actif].composant}
      </div>
    </div>
  );
}
