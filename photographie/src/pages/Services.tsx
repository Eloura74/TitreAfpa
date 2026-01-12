import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Service } from "../types/service";
import { ContactModal } from "../components/services/ContactModal";
import PageTitle from "../components/ui/PageTitle";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { API_URL as BASE_API_URL } from "../config/api";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";

const API_URL = `${BASE_API_URL}/api/services`;

// Composant ServiceCard avec effet flip
interface ServiceCardProps {
  service: Service;
  index: number;
  onReserve: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onReserve }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fermer le flip au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFlipped && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsFlipped(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFlipped]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        className="relative w-full h-[550px]"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 45,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FACE AVANT */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
          }}
        >
          <div className="group h-full flex flex-col relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.6)]">
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#ffe992]/5 via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-2 h-full">
                {/* Titre */}
                <h3 className="text-lg font-playfair-sc uppercase tracking-wider text-[#ffe992] font-bold leading-tight text-center drop-shadow-[0_0_20px_rgba(255,233,146,0.8)] animate-pulse-subtle">
                  {service.titre}
                </h3>

                {/* Prix */}
                <div className="text-center mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                    À partir de
                  </span>
                  <span className="text-xl text-[#ffe992] font-bold">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                    className="w-full bg-gradient-to-r from-[#ffe992]/20 to-[#ffe992]/30 hover:from-[#ffe992]/30 hover:to-[#ffe992]/40 text-[#ffe992] text-xs font-bold uppercase tracking-wider py-2 rounded-lg border border-[#ffe992]/40 hover:border-[#ffe992]/70 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Voir plus</span>
                  </button>
                  <button
                    onClick={onReserve}
                    className="w-full bg-gradient-to-r from-[#ffe992] to-[#f4d677] text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:from-[#f4d677] hover:to-[#ffe992] transition-all duration-300 shadow-[0_4px_12px_rgba(255,233,146,0.4)] hover:shadow-[0_6px_16px_rgba(255,233,146,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FACE ARRIÈRE - Description complète */}
        <div
          className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a20] via-black/95 to-[#0f0f14] border-2 border-[#ffe992]/60 shadow-[0_0_40px_rgba(255,233,146,0.6),inset_0_0_30px_rgba(255,233,146,0.1)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
          }}
        >
          {/* Effets lumineux */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#ffe992]/15 via-[#ffe992]/5 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffe992] to-transparent" />

          <div className="relative h-full flex flex-col p-5">
            {/* Titre avec séparateur */}
            <div className="mb-4 pb-3 border-b border-[#ffe992]/30">
              <h3 className="text-xl font-playfair-sc font-bold text-[#ffe992] drop-shadow-[0_0_15px_rgba(255,233,146,0.8)] text-center uppercase tracking-wider">
                {service.titre}
              </h3>
              <p className="text-center text-[#ffe992] text-sm font-bold mt-2">
                {service.prix > 0 ? `À partir de ${service.prix}€` : "Sur devis"}
              </p>
            </div>

            {/* Description complète avec scroll */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-[#ffe992]/40 scrollbar-track-[#ffe992]/10 hover:scrollbar-thumb-[#ffe992]/60">
              <p className="text-sm text-gray-200 leading-relaxed text-justify whitespace-pre-line">
                {service.description || "Aucune description disponible."}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onReserve}
                className="w-full bg-gradient-to-r from-[#ffe992] to-[#f4d677] text-black text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:from-[#f4d677] hover:to-[#ffe992] transition-all duration-300 shadow-[0_6px_20px_rgba(255,233,146,0.5)] hover:shadow-[0_8px_28px_rgba(255,233,146,0.7)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Réserver maintenant
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} className="flex-shrink-0" />
                <span>Retour</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Services() {
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
    <div role="main" className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30">
      <SEO
        title="Services Photo - Mariages, Portraits, Événements"
        description="Photographe professionnel à votre service : mariages, baptêmes, shootings corporate, événements d'entreprise. Prestations sur-mesure partout en France. Devis gratuit."
        image="/images/services-preview.jpg"
        type="website"
        keywords={[
          'photographe mariage',
          'photographe événement',
          'portrait professionnel',
          'shooting photo',
          'photographe corporate',
          'prestation photo',
          'Fabien Licata'
        ]}
        schema={{
          ...photographerSchema,
          ...createBreadcrumbSchema([
            { name: 'Accueil', url: 'https://titre-afpa.vercel.app/' },
            { name: 'Services', url: 'https://titre-afpa.vercel.app/services' }
          ])
        }}
      />
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="max-w-7xl mx-auto py-20 px-6 pt-32 relative z-10">
        {/* Header Cinematic */}
        <PageTitle
          title="Nos Prestations"
          showSeparator={false}
        />
        
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
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
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
              Découvrez nos <span className="font-semibold text-[#ffe992] drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">services sur mesure</span> pour capturer vos moments les plus précieux. Mariages, shootings, événements... nous sublimons chaque instant.
            </motion.p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service._id || service.id} service={service} index={index} onReserve={() => setSelectedService(service)} />
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
