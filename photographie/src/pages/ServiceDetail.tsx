import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Service } from "../types/service";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { ContactModal } from "../components/services/ContactModal";
import { API_URL as BASE_API_URL } from "../config/api";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, X, Camera } from "lucide-react";
import { motion } from "framer-motion";

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
      .get(`${API_URL}`)
      .then((r) => {
        if (Array.isArray(r.data)) {
          const found = r.data.find((s) => (s._id || s.id) === id);
          if (found) setService(found);
          else navigate("/services");
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#ffe992]"></span>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30">
      <Helmet>
        <title>{service.titre} | Fabien Licata</title>
        <meta
          name="description"
          content={service.description.substring(0, 150)}
        />
      </Helmet>

      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <button
          onClick={() => navigate("/services")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#ffe992] transition-colors mb-8 group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm uppercase tracking-wider">
            Retour aux services
          </span>
        </button>

        {/* En-tête du service */}
        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#ffe992]/30 bg-[#ffe992]/10 text-[#ffe992] text-xs font-bold uppercase tracking-widest mb-6">
                {service.categorie}
              </span>

              <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-8 leading-tight">
                {service.titre}
              </h1>

              <div className="prose prose-invert max-w-none text-gray-300 font-light leading-relaxed mb-10">
                <p className="whitespace-pre-line text-lg">
                  {service.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-8 border-t border-white/10">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                    Tarif
                  </p>
                  <p className="text-3xl font-bold text-[#ffe992]">
                    {service.prix > 0 ? `${service.prix}€` : "Sur devis"}
                    {service.prix > 0 && (
                      <span className="text-sm font-normal text-gray-400 ml-2">
                        / prestation
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-8 py-4 bg-[#ffe992] text-black rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(255,233,146,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transform hover:-translate-y-1"
                >
                  Réserver ce service
                </button>
              </div>
            </motion.div>
          </div>

          {/* Image de couverture */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
            >
              {service.images.length > 0 && (
                <img
                  src={service.images[0]}
                  alt={service.titre}
                  className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10]/60 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* Galerie photos */}
        {service.images.length > 1 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-white/10" />
              <h2 className="text-2xl font-serif italic text-[#ffe992]">
                Galerie du service
              </h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.images.map((img, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="relative group overflow-hidden rounded-xl cursor-pointer aspect-video border border-white/5 bg-black"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${service.titre} ${idx + 1}`}
                    className="w-full h-full object-contain transition duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                </motion.div>
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
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage}
            alt="Zoom"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10"
          />
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
