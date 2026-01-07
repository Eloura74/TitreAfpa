import GalerieForm from "./galerie/GalerieForm";
import GestionGalerieGraphique from "./galerie/GestionGalerieGraphique";
import GestionEvenements from "./GestionEvenements";
import GestionPaiements from "./GestionPaiements";
import GestionPaniers from "./GestionPaniers";
import GestionTarifs from "./GestionTarifs";
import GestionAccesPrive from "./GestionAccesPrive";
import GestionServices from "./GestionServices";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const onglets = [
  { nom: "Galerie", composant: <GalerieForm /> },
  { nom: "Galerie Graphique", composant: <GestionGalerieGraphique /> },
  { nom: "Événements", composant: <GestionEvenements /> },
  { nom: "Paiements", composant: <GestionPaiements /> },
  { nom: "Paniers", composant: <GestionPaniers /> },
  { nom: "Tarifs", composant: <GestionTarifs /> },
  { nom: "Accès Privé", composant: <GestionAccesPrive /> },
  { nom: "Services", composant: <GestionServices /> },
];

export default function OngletsGestionGalerie() {
  const [actif, setActif] = useState(0);

  return (
    <div>
      {/* Navigation des onglets */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {onglets.map((onglet, i) => (
          <button
            key={onglet.nom}
            onClick={() => setActif(i)}
            className={`
              relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
              ${
                actif === i
                  ? "text-black shadow-[0_0_20px_rgba(255,233,146,0.4)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            {actif === i && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#ffe992] rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{onglet.nom}</span>
          </button>
        ))}
      </div>

      {/* Zone de contenu */}
      <motion.div
        key={actif}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#12121a]/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl min-h-[500px]"
      >
        {onglets[actif].composant}
      </motion.div>
    </div>
  );
}
