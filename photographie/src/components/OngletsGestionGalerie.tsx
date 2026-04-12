import GalerieForm from "./galerie/GalerieForm";
import GestionGalerieGraphique from "./galerie/GestionGalerieGraphique";
import GestionEvenements from "./GestionEvenements";
import GestionPaiements from "./GestionPaiements";
import GestionPaniers from "./GestionPaniers";
import GestionAccesPrive from "./GestionAccesPrive";
import GestionServices from "./GestionServices";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X, ChevronLeft, ChevronRight } from "lucide-react";

import AlbumManager from "./admin/galerie/AlbumManager";
import TarifConfiguratorV2 from "./admin/tarifs/TarifConfiguratorV2";
import CoefficientGlobalManager from "./admin/tarifs/CoefficientGlobalManager";
import GestionAbout from "./GestionAbout";
import GestionGraphismeShowcase from "./GestionGraphismeShowcase";
import GestionGraphismeDescription from "./GestionGraphismeDescription";
import GestionMentionsLegales from "./GestionMentionsLegales";

export default function OngletsGestionGalerie() {
  const [actif, setActif] = useState(0);
  const [showAlbumManager, setShowAlbumManager] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleAlbumChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleGoToTarifs = () => {
    setActif(5);
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      // Forcer le scroll à gauche au chargement
      container.scrollLeft = 0;
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, []);

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
          <GalerieForm key={refreshKey} onGoToTarifs={handleGoToTarifs} />
        </div>
      ),
    },
    { nom: "Galerie Graphique", composant: <GestionGalerieGraphique /> },
    { nom: "Événements", composant: <GestionEvenements /> },
    { nom: "Paiements", composant: <GestionPaiements /> },
    { nom: "Paniers", composant: <GestionPaniers /> },

    {
      nom: "Tarifs",
      composant: (
        <div className="space-y-8">
          <CoefficientGlobalManager />
          <TarifConfiguratorV2 />
        </div>
      ),
    },
    { nom: "Accès Privé", composant: <GestionAccesPrive /> },
    { nom: "Services", composant: <GestionServices /> },
    { nom: "À Propos", composant: <GestionAbout /> },
    {
      nom: "Présentation Graphisme",
      composant: (
        <div className="space-y-8">
          <GestionGraphismeShowcase />
          <div className="border-t border-white/10 pt-8">
            <GestionGraphismeDescription />
          </div>
        </div>
      ),
    },
    { nom: "Mentions Légales", composant: <GestionMentionsLegales /> },
  ];

  return (
    <div className="-mx-6">
      {/* Navigation des onglets avec scroll horizontal amélioré */}
      <div className="relative mb-6 md:mb-8 overflow-visible px-6">
        {/* Bouton scroll gauche */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-[#0a0a10] via-[#0a0a10] to-transparent pl-2 pr-8 py-2 group"
            aria-label="Défiler vers la gauche"
          >
            <div className="bg-[#ffe992]/10 hover:bg-[#ffe992]/20 border border-[#ffe992]/30 rounded-full p-2 transition-all duration-300 group-hover:scale-110">
              <ChevronLeft size={20} className="text-[#ffe992]" />
            </div>
          </button>
        )}

        {/* Container des onglets avec scroll */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-2 justify-start overflow-x-auto pb-2 scroll-smooth transition-all duration-300 ${
            canScrollLeft ? "pl-16 pr-4 md:pl-20 md:pr-12" : "px-4 md:px-12"
          } ${canScrollRight && !canScrollLeft ? "pr-16 md:pr-20" : ""}`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#ffe992 transparent",
          }}
        >
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

        {/* Bouton scroll droite */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-l from-[#0a0a10] via-[#0a0a10] to-transparent pr-2 pl-8 py-2 group"
            aria-label="Défiler vers la droite"
          >
            <div className="bg-[#ffe992]/10 hover:bg-[#ffe992]/20 border border-[#ffe992]/30 rounded-full p-2 transition-all duration-300 group-hover:scale-110">
              <ChevronRight size={20} className="text-[#ffe992]" />
            </div>
          </button>
        )}
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
