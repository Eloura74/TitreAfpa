import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Service } from "../types/service";
import { ContactModal } from "../components/services/ContactModal";
import PageTitle from "../components/ui/PageTitle";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { API_URL as BASE_API_URL } from "../config/api";
import { Sparkles, Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";
import { ExpandableCard } from "../components/ui/ExpandableCard";

const API_URL = `${BASE_API_URL}/api/services`;

// Composant ServiceCard avec effet flip
interface ServiceCardProps {
  service: Service;
  index: number;
  onReserve: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index: _index,
  onReserve,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [cardPosition, setCardPosition] = useState<
    | {
        top: number;
        left: number;
        width: number;
        height: number;
      }
    | undefined
  >(undefined);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      setIsExpanded(true);
    }
  };

  // Navigation clavier pour le lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        selectedImageIndex < service.images.length - 1
      ) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, service.images.length]);

  // Récupérer les personnalisations
  const accentColor = service.customization?.accentColor || "#ffe992";
  const badge = service.customization?.badge;
  const titleFont = service.customization?.typography?.titleFont || "default";
  const titleSize = service.customization?.typography?.titleSize || "medium";

  const fontClass = {
    default: "font-playfair-sc",
    playfair: "font-serif",
    cinzel: "font-serif",
    montserrat: "font-sans",
  }[titleFont];

  const sizeClass = {
    small: "text-base",
    medium: "text-lg",
    large: "text-xl",
  }[titleSize];

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ y: 20, opacity: 0 }}
        whileInView={{
          y: 0,
          opacity: 1,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        }}
        viewport={{ once: true }}
        className="group relative"
      >
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/60 via-black/80 to-black/90 border transition-all duration-500 shadow-xl flex flex-col h-full"
          style={{
            borderColor: `${accentColor}20`,
            boxShadow: `0 0 40px ${accentColor}30`,
          }}
        >
          {/* Badge personnalisé */}
          {badge?.text && (
            <div
              className={`absolute ${badge.position === "top-left" ? "top-4 left-4" : "top-4 right-4"} z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}
              style={{
                backgroundColor: `${badge.color}40`,
                color: badge.color,
                border: `1px solid ${badge.color}60`,
              }}
            >
              {badge.text}
            </div>
          )}

          {/* Image */}
          <div className="relative w-full h-64 overflow-hidden bg-black/20">
            <img
              src={service.images[0] || "/placeholder-service.jpg"}
              alt={service.titre}
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>

          {/* Contenu */}
          <div className="relative flex flex-col px-4 py-3 bg-gradient-to-b from-black/30 to-black/40 flex-1">
            <div
              className="absolute inset-0 bg-gradient-to-t via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: `${accentColor}05` }}
            />

            <div className="relative z-10 flex flex-col gap-2 h-full">
              {/* Titre */}
              <h3
                className={`${sizeClass} ${fontClass} uppercase tracking-wider font-bold leading-tight text-center animate-pulse-subtle`}
                style={{
                  color: accentColor,
                  textShadow: `0 0 20px ${accentColor}80`,
                }}
              >
                {service.titre}
              </h3>

              {/* Prix */}
              <div className="text-center mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                  À partir de
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ color: accentColor }}
                >
                  {service.prix > 0 ? `${service.prix}€` : "Sur devis"}
                </span>
              </div>

              {/* Description courte */}
              <p className="text-[10px] text-gray-300 leading-relaxed line-clamp-3 mb-auto">
                {service.description}
              </p>

              {/* Boutons */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleExpand}
                  className="w-full text-xs font-bold uppercase tracking-wider py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(to right, ${accentColor}20, ${accentColor}30)`,
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                  }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir plus</span>
                </button>
                <button
                  onClick={onReserve}
                  className="w-full text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
                    boxShadow: `0 4px 12px ${accentColor}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 6px 16px ${accentColor}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 12px ${accentColor}40`;
                  }}
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded View */}
      <ExpandableCard
        isExpanded={isExpanded}
        onClose={() => setIsExpanded(false)}
        cardPosition={cardPosition}
      >
        {/* Effets lumineux */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#ffe992]/15 via-[#ffe992]/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffe992] to-transparent pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-8 h-full">
          {/* Images Section */}
          <div className="md:w-1/2 flex flex-col gap-4 overflow-y-auto">
            <div
              className="relative w-full h-[400px] overflow-hidden rounded-xl bg-black flex-shrink-0 cursor-pointer group"
              onClick={() => setSelectedImageIndex(0)}
            >
              <img
                src={service.images[0] || "/placeholder-service.jpg"}
                alt={service.titre}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            {service.images.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {service.images.slice(1).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video overflow-hidden rounded-lg bg-black border border-white/10 cursor-pointer group"
                    onClick={() => setSelectedImageIndex(idx + 1)}
                  >
                    <img
                      src={img}
                      alt={`${service.titre} ${idx + 2}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 flex flex-col">
            {/* Titre avec séparateur */}
            <div className="mb-6 pb-4 border-b border-[#ffe992]/30">
              <h3 className="text-3xl font-playfair-sc font-bold text-[#ffe992] drop-shadow-[0_0_15px_rgba(255,233,146,0.8)] text-center uppercase tracking-wider mb-3">
                {service.titre}
              </h3>
              <p className="text-center text-[#ffe992] text-xl font-bold">
                {service.prix > 0
                  ? `À partir de ${service.prix}€`
                  : "Sur devis"}
              </p>
            </div>

            {/* Description complète avec scroll */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              <p className="text-base text-gray-200 leading-relaxed text-justify whitespace-pre-line">
                {service.description || "Aucune description disponible."}
              </p>
            </div>

            {/* Bouton d'action */}
            <button
              onClick={() => {
                setIsExpanded(false);
                onReserve();
              }}
              className="w-full bg-gradient-to-r from-[#ffe992] to-[#f4d677] text-black text-sm font-bold uppercase tracking-wider py-4 rounded-lg hover:from-[#f4d677] hover:to-[#ffe992] transition-all duration-300 shadow-[0_6px_20px_rgba(255,233,146,0.5)] hover:shadow-[0_8px_28px_rgba(255,233,146,0.7)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Réserver maintenant
            </button>
          </div>
        </div>
      </ExpandableCard>

      {/* Lightbox pour les images */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
          style={{ zIndex: 100001 }}
          onClick={() => setSelectedImageIndex(null)}
        >
          <motion.img
            key={selectedImageIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={service.images[selectedImageIndex]}
            alt={`${service.titre} ${selectedImageIndex + 1}`}
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10 object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Bouton Fermer */}
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 backdrop-blur-sm"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X size={24} />
          </button>

          {/* Flèche Gauche */}
          {selectedImageIndex > 0 && (
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex - 1);
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Flèche Droite */}
          {selectedImageIndex < service.images.length - 1 && (
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(selectedImageIndex + 1);
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Compteur */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
            {selectedImageIndex + 1} / {service.images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default function Prestations() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((r) => {
        if (Array.isArray(r.data)) setServices(r.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#ffe992]"></span>
      </div>
    );
  }

  return (
    <div
      role="main"
      className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30"
    >
      <SEO
        title="Prestations Photo - Mariages, Portraits, Événements"
        description="Photographe professionnel à votre service : mariages, baptêmes, shootings corporate, événements d'entreprise. Prestations sur-mesure partout en France. Devis gratuit."
        image="/images/services-preview.jpg"
        type="website"
        keywords={[
          "photographe mariage",
          "photographe événement",
          "portrait professionnel",
          "shooting photo",
          "photographe corporate",
          "prestation photo",
          "Fabien Licata",
        ]}
        schema={{
          ...photographerSchema,
          ...createBreadcrumbSchema([
            { name: "Accueil", url: "https://titre-afpa.vercel.app/" },
            { name: "Services", url: "https://titre-afpa.vercel.app/services" },
            { name: "Prestations", url: "https://titre-afpa.vercel.app/prestations" },
          ]),
        }}
      />
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="max-w-7xl mx-auto py-20 px-6 pt-32 relative z-10">
        {/* Header Cinematic */}
        <PageTitle title="Nos Prestations" showSeparator={false} />

        {/* Description animée style Photographie/Graphisme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl mx-auto mb-12 text-center"
        >
          <div className="relative backdrop-blur-sm bg-black/20 border border-[#ffe992]/15 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden drop-shadow-[0_0_6px_rgba(255,233,146,0.3)]">
            {/* Effet de brillance animée */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
            />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/10 to-transparent" />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe992]/05 to-transparent" />
            <motion.p
              className="text-lg md:text-xl text-white/90 font-light leading-relaxed relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
            >
              Découvrez nos{" "}
              <span className="font-semibold text-[#ffe992] drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">
                services sur mesure
              </span>{" "}
              pour capturer vos moments les plus précieux. Mariages, shootings,
              événements... nous sublimons chaque instant.
            </motion.p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={service._id || service.id}
              service={service}
              index={index}
              onReserve={() => setSelectedService(service)}
            />
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center text-gray-500 py-20 bg-white/5 rounded-2xl border border-white/5 mt-10">
            <Sparkles className="mx-auto mb-4 text-gray-600" size={32} />
            <p>Aucune prestation disponible pour le moment.</p>
          </div>
        )}
      </main>

      {selectedService && (
        <ContactModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
      <Footer />
    </div>
  );
}
