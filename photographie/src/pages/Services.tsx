import { useState, useEffect } from "react";
import axios from "axios";
import { Service } from "../types/service";
import { ContactModal } from "../components/services/ContactModal";
import PageTitle from "../components/ui/PageTitle";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { API_URL as BASE_API_URL } from "../config/api";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = `${BASE_API_URL}/api/services`;

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
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30">
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="max-w-7xl mx-auto py-20 px-6 pt-32 relative z-10">
        {/* Header Cinematic */}
        <PageTitle
          title="Nos Prestations"
          subtitle="Découvrez nos services sur mesure pour capturer vos moments les plus précieux. Mariages, shootings, événements... nous sublimons chaque instant."
          showSeparator
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={service._id || service.id}
              className="group relative bg-[#12121a]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 hover:border-[#ffe992]/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)] flex flex-col"
            >
              {/* Badge Catégorie */}
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-black/60 backdrop-blur-md text-[#ffe992] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#ffe992]/20 shadow-lg">
                  {service.categorie}
                </span>
              </div>

              {/* Image principale */}
              <div className="h-72 overflow-hidden relative">
                <img
                  src={service.images[0] || "/placeholder-service.jpg"}
                  alt={service.titre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-transparent to-transparent opacity-80"></div>
              </div>

              <div className="p-8 flex-1 flex flex-col -mt-12 relative z-10">
                <h3 className="text-2xl font-serif italic text-white mb-3 group-hover:text-[#ffe992] transition-colors">
                  {service.titre}
                </h3>
                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3 font-light leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      À partir de
                    </span>
                    <span className="text-xl font-bold text-[#ffe992]">
                      {service.prix > 0 ? `${service.prix}€` : "Sur devis"}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/services/${service._id || service.id}`}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/5"
                      title="Voir détails"
                    >
                      <ArrowRight
                        size={18}
                        className="-rotate-45 group-hover:rotate-0 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={() => setSelectedService(service)}
                      className="px-5 py-2 bg-[#ffe992] text-black rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,233,146,0.2)]"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
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
