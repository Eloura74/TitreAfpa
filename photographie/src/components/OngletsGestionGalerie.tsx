import GalerieForm from "./galerie/GalerieForm";
import GestionGalerieGraphique from "./galerie/GestionGalerieGraphique";
import GestionEvenements from "./GestionEvenements";
import GestionPaiements from "./GestionPaiements";
import GestionPaniers from "./GestionPaniers";
import GestionAccesPrive from "./GestionAccesPrive";
import GestionServices from "./GestionServices";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X } from "lucide-react";

import AlbumManager from "./admin/galerie/AlbumManager";
import TarifConfiguratorV2 from "./admin/tarifs/TarifConfiguratorV2";
import GestionAbout from "./GestionAbout"; // Import du nouveau composant

export default function OngletsGestionGalerie() {
  const [actif, setActif] = useState(0);
  const [showAlbumManager, setShowAlbumManager] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAlbumChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const onglets = [
    {
      nom: "Galerie",
      composant: (
        <div className="space-y-8">
          {/* Header avec bouton Gérer les albums */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAlbumManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ffe992]/10 hover:bg-[#ffe992]/20 text-[#ffe992] rounded-lg transition-colors border border-[#ffe992]/20"
            >
              <FolderPlus size={18} />
              Gérer les albums
            </button>
          </div>
          <GalerieForm key={refreshKey} />
        </div>
      ),
    },
    { nom: "Galerie Graphique", composant: <GestionGalerieGraphique /> },
    { nom: "Événements", composant: <GestionEvenements /> },
    { nom: "Paiements", composant: <GestionPaiements /> },
    { nom: "Paniers", composant: <GestionPaniers /> },

    { nom: "Tarifs", composant: <TarifConfiguratorV2 /> },
    { nom: "Accès Privé", composant: <GestionAccesPrive /> },
    { nom: "Services", composant: <GestionServices /> },
    { nom: "À Propos", composant: <GestionAbout /> }, // Nouvel onglet
  ];

  return (
    <div>
      {/* Navigation des onglets - Scroll horizontal sur mobile */}
      <div className="flex gap-2 mb-6 md:mb-8 justify-start md:justify-center overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {onglets.map((onglet, i) => (
          <button
            key={onglet.nom}
            onClick={() => setActif(i)}
            className={`
              relative px-3 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0
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
        className="bg-[#12121a]/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/5 p-4 md:p-6 lg:p-8 shadow-2xl min-h-[400px] md:min-h-[500px]"
      >
        {onglets[actif].composant}
      </motion.div>

      {/* Modal Album Manager */}
      <AnimatePresence>
        {showAlbumManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#12121a] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl relative"
            >
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-[#12121a] border-b border-white/10">
                <h2 className="text-2xl font-bold text-[#ffe992]">
                  Gestion des Albums
                </h2>
                <button
                  onClick={() => setShowAlbumManager(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <AlbumManager onAlbumChange={handleAlbumChange} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
