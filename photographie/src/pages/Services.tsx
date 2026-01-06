import { useState, useEffect } from "react";
import axios from "axios";
import { Service } from "../types/service";
import { ContactModal } from "../components/services/ContactModal";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { API_URL as BASE_API_URL } from "../config/api";
import { Link } from "react-router-dom";

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
      <div className="text-center text-white py-20">
        Chargement des prestations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold text-center mb-4 text-[#ffe992]">
          Nos Prestations
        </h1>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Découvrez nos services sur mesure pour capturer vos moments les plus
          précieux. Mariages, shootings, événements... nous sommes à votre
          écoute.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service._id || service.id}
              className="bg-[#1e1e2d] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#ffe992]/10 transition duration-300 group flex flex-col relative"
            >
              {/* Badge Catégorie */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-black/60 backdrop-blur-md text-[#ffe992] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#ffe992]/20">
                  {service.categorie}
                </span>
              </div>

              {/* Image principale (première image ou placeholder) */}
              <div className="h-64 overflow-hidden relative">
                <img
                  src={service.images[0] || "/placeholder-service.jpg"}
                  alt={service.titre}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e2d] to-transparent opacity-60"></div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-[#ffe992]">
                  {service.titre}
                </h3>
                <p className="text-gray-400 text-sm mb-4 flex-1 whitespace-pre-line line-clamp-4">
                  {service.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 gap-2">
                  <span className="text-lg font-bold text-white">
                    {service.prix > 0
                      ? `À partir de ${service.prix}€`
                      : "Sur devis"}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/services/${service._id || service.id}`}
                      className="bg-white/10 text-white px-3 py-2 rounded font-semibold hover:bg-white/20 transition text-sm"
                    >
                      Voir détails
                    </Link>
                    <button
                      onClick={() => setSelectedService(service)}
                      className="bg-[#ffe992] text-black px-3 py-2 rounded font-semibold hover:bg-[#d6c487] transition text-sm"
                    >
                      Contacter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Aucune prestation disponible pour le moment.
          </div>
        )}
      </div>

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
