import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/api";
import {
  Lock,
  Calendar,
  Image as ImageIcon,
  ChevronRight,
  Globe,
} from "lucide-react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

interface Reportage {
  _id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  image?: string;
  slug?: string;
  isPublic: boolean;
  photosOriginales: unknown[];
}

export default function Reportages() {
  const navigate = useNavigate();
  const [reportagesPublics, setReportagesPublics] = useState<Reportage[]>([]);
  const [reportagesPrives, setReportagesPrives] = useState<Reportage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Reportages | Fabien Licata";
    loadReportages();
  }, []);

  const loadReportages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ecrin/all`);
      if (res.data.success) {
        // Filtrer : isPublic === true pour publics, sinon privés (par défaut)
        const publics = res.data.acces.filter(
          (r: Reportage) => r.isPublic === true,
        );
        const prives = res.data.acces.filter(
          (r: Reportage) => r.isPublic !== true,
        );
        setReportagesPublics(publics);
        setReportagesPrives(prives);

        console.log("Reportages publics:", publics.length);
        console.log("Reportages privés:", prives.length);
      }
    } catch (error) {
      console.error("Erreur chargement reportages:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleReportageClick = (reportage: Reportage) => {
    if (reportage.isPublic) {
      // Rediriger vers la galerie publique du reportage
      navigate(`/reportages/${reportage.slug || reportage._id}`);
    } else {
      // Rediriger vers la page de connexion avec le slug
      navigate(`/ecrin-prive/${reportage.slug || reportage._id}`);
    }
  };

  return (
    <div className="home-page min-h-screen flex flex-col bg-[#0a0a10]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair-sc uppercase tracking-[0.2em] mb-6">
            <span className="bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,233,146,0.6)]">
              Reportages
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Découvrez nos reportages photographiques publics et accédez à vos
            galeries privées sécurisées.
          </p>
        </motion.header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#ffe992]/20 border-t-[#ffe992] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            {/* SECTION REPORTAGES PUBLICS */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Globe className="text-[#ffe992]" size={28} />
                <h2 className="text-2xl md:text-3xl font-playfair-sc text-white uppercase tracking-wider">
                  Reportages Publics
                </h2>
              </div>

              {reportagesPublics.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Globe
                    className="mx-auto text-gray-500 mb-4"
                    size={48}
                    opacity={0.5}
                  />
                  <p className="text-gray-400 font-light">
                    Aucun reportage public disponible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportagesPublics.map((reportage, index) => (
                    <motion.div
                      key={reportage._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleReportageClick(reportage)}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-[#ffe992]/50 bg-black/40 cursor-pointer transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.2)] h-full flex flex-col"
                    >
                      {/* Badge Public */}
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                        <Globe size={12} />
                        Public
                      </div>

                      {/* Image de couverture */}
                      <div className="relative h-56 overflow-hidden flex-shrink-0">
                        {reportage.image ? (
                          <img
                            src={reportage.image}
                            alt={reportage.titre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-black/80 to-[#12121a] flex items-center justify-center">
                            <ImageIcon size={64} className="text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      </div>

                      {/* Contenu */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-playfair-sc text-white mb-2 group-hover:text-[#ffe992] transition-colors">
                          {reportage.titre}
                        </h3>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
                          {reportage.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#ffe992]" />
                            <span>{formatDate(reportage.dateDebut)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-[#ffe992]" />
                            <span>
                              {reportage.photosOriginales?.length || 0} photos
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#ffe992] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Voir le reportage</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION REPORTAGES PRIVÉS */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Lock className="text-[#ffe992]" size={28} />
                <h2 className="text-2xl md:text-3xl font-playfair-sc text-white uppercase tracking-wider">
                  Reportages Privés
                </h2>
              </div>

              {reportagesPrives.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Lock
                    className="mx-auto text-gray-500 mb-4"
                    size={48}
                    opacity={0.5}
                  />
                  <p className="text-gray-400 font-light">
                    Aucun reportage privé disponible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportagesPrives.map((reportage, index) => (
                    <motion.div
                      key={reportage._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleReportageClick(reportage)}
                      className="group relative overflow-hidden rounded-2xl border border-[#ffe992]/20 bg-black/40 cursor-pointer transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.3)] h-full flex flex-col"
                    >
                      {/* Badge Privé */}
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-[#ffe992]/10 border border-[#ffe992]/30 rounded-full text-[#ffe992] text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                        <Lock size={12} />
                        Privé
                      </div>

                      {/* Image de couverture */}
                      <div className="relative h-56 overflow-hidden flex-shrink-0">
                        {reportage.image ? (
                          <img
                            src={reportage.image}
                            alt={reportage.titre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-black/80 to-[#12121a] flex items-center justify-center">
                            <Lock size={64} className="text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      </div>

                      {/* Contenu */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-playfair-sc text-white mb-2 group-hover:text-[#ffe992] transition-colors">
                          {reportage.titre}
                        </h3>
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
                          {reportage.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#ffe992]" />
                            <span>{formatDate(reportage.dateDebut)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-[#ffe992]" />
                            <span>
                              {reportage.photosOriginales?.length || 0} photos
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#ffe992] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <Lock size={14} />
                          <span>Accéder avec le code</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
