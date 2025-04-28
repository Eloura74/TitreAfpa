import React, { useState } from "react";
import GestionEvenements from "./GestionEvenements";
import GestionPaiements from "./GestionPaiements";
import GestionPaniers from "./GestionPaniers";

const onglets = [
  { label: "Événements", Component: GestionEvenements },
  { label: "Paiements", Component: GestionPaiements },
  { label: "Paniers", Component: GestionPaniers },
];

export default function OngletsGestionGalerie() {
  const [actif, setActif] = useState(0);
  const OngletActif = onglets[actif].Component;

  return (
    <div>
      <div className="flex border-b mb-4">
        {onglets.map((onglet, idx) => (
          <button
            key={onglet.label}
            className={`px-6 py-2 font-medium border-b-2 transition-colors ${
              actif === idx
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setActif(idx)}
          >
            {onglet.label}
          </button>
        ))}
      </div>
      <div>
        <OngletActif />
      </div>
    </div>
  );
}
