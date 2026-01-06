import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Service } from "../types/service";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { ContactModal } from "../components/services/ContactModal";
import { API_URL as BASE_API_URL } from "../config/api";
import { Helmet } from "react-helmet-async";

const API_URL = `${BASE_API_URL}/api/services`;

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_URL}`) // On récupère tout pour filtrer (ou on pourrait faire un endpoint getById)
      .then((r) => {
        if (Array.isArray(r.data)) {
          const found = r.data.find((s) => (s._id || s.id) === id);
          if (found) setService(found);
          else navigate("/services"); // Redirection si non trouvé
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-yellow-500/30">
      <Helmet>
        <title>{service.titre} | Fabien Licata</title>
        <meta
          name="description"
          content={service.description.substring(0, 150)}
        />
      </Helmet>

      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* En-tête du service */}
        <div className="flex flex-col md:flex-row gap-12 mb-20">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold text-[#ffe992] mb-6 leading-tight">
              {service.titre}
            </h1>
            <div className="w-20 h-1 bg-yellow-500/50 mb-8"></div>
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line mb-8">
              {service.description}
            </p>
            <div className="flex items-center gap-6">
              <span className="text-2xl font-light text-white">
                {service.prix > 0
                  ? `À partir de ${service.prix}€`
                  : "Sur devis"}
              </span>
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-[#ffe992] text-black px-8 py-3 rounded font-bold hover:bg-[#d6c487] transition transform hover:scale-105"
              >
                Réserver / Contacter
              </button>
            </div>
          </div>

          {/* Image de couverture (la première) */}
          <div className="md:w-1/2">
            {service.images.length > 0 && (
              <img
                src={service.images[0]}
                alt={service.titre}
                className="w-full h-[400px] md:h-[500px] object-cover rounded-xl shadow-2xl border border-white/5"
              />
            )}
          </div>
        </div>

        {/* Galerie photos */}
        {service.images.length > 1 && (
          <section>
            <h2 className="text-3xl font-light uppercase tracking-widest text-center mb-12 text-white/80">
              Galerie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group overflow-hidden rounded-lg cursor-pointer aspect-[3/4]"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${service.titre} ${idx + 1}`}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-500"></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Modal Contact */}
      {showContactModal && (
        <ContactModal
          service={service}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {/* Lightbox Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Zoom"
            className="max-w-full max-h-[90vh] rounded shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white/50 hover:text-white text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
