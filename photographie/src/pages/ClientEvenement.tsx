import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import axios from "axios";
import { API_URL } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";

// Types
interface Photo {
  _id: string;
  url: string;
  titre?: string;
}

interface Evenement {
  _id: string;
  titre: string;
  description?: string;
  dateDebut: string;
  photos: Photo[];
}

interface PhotoConfig {
  format: string;
  support: string;
  quantite: number;
}

export default function ClientEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configuration par défaut pour la commande
  const [globalConfig, setGlobalConfig] = useState<PhotoConfig>({
    format: "10x15",
    support: "Papier Brillant",
    quantite: 1
  });

  useEffect(() => {
    const fetchEvenement = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/evenements/${id}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        setEvenement(res.data);
      } catch (error) {
        console.error("Erreur chargement événement", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvenement();
  }, [id]);

  const toggleSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleAddToQuote = () => {
    // Ici, on enverrait la demande de devis ou on ajouterait au panier
    // Pour l'instant, on simule une action
    console.log("Commande:", { photos: selectedPhotos, config: globalConfig });
    alert("Votre sélection a été ajoutée à votre demande de devis !");
    setShowConfig(false);
    setSelectedPhotos([]);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center text-yellow-500"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!evenement) return <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center text-white">Événement introuvable</div>;

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      <Navbar variant="client" />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/mon-compte")} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif italic text-[#ffe992]">{evenement.titre}</h1>
            <p className="text-gray-400 text-sm">{new Date(evenement.dateDebut).toLocaleDateString()} • {evenement.photos.length} photos</p>
          </div>
        </div>

        {/* Grid Photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
          {evenement.photos.map((photo) => (
            <div 
              key={photo._id} 
              className={`relative aspect-[2/3] group cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedPhotos.includes(photo._id) ? 'border-yellow-500' : 'border-transparent'}`}
              onClick={() => toggleSelection(photo._id)}
            >
              <img src={photo.url} alt={photo.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              {/* Overlay Selection */}
              <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${selectedPhotos.includes(photo._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedPhotos.includes(photo._id) ? 'bg-yellow-500 text-black scale-100' : 'bg-white/20 text-white scale-90'}`}>
                  <Check size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedPhotos.length > 0 && !showConfig && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-[#12121a] border-t border-yellow-500/20 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="container mx-auto flex justify-between items-center max-w-4xl">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {selectedPhotos.length}
                </div>
                <span className="text-sm uppercase tracking-wider hidden md:inline">Photos sélectionnées</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedPhotos([])}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium transition"
                >
                  Tout désélectionner
                </button>
                <button 
                  onClick={() => setShowConfig(true)}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full text-sm font-bold uppercase tracking-wide transition shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                >
                  Configurer la commande
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a24] w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-serif italic text-[#ffe992]">Configuration de la commande</h3>
                <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                  <div className="bg-yellow-500 text-black font-bold w-10 h-10 rounded-full flex items-center justify-center text-lg">
                    {selectedPhotos.length}
                  </div>
                  <div>
                    <p className="font-medium text-white">Photos sélectionnées</p>
                    <p className="text-sm text-gray-400">Ces options s'appliqueront à toute la sélection</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Format d'impression</label>
                    <select 
                      value={globalConfig.format}
                      onChange={(e) => setGlobalConfig({...globalConfig, format: e.target.value})}
                      className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition"
                    >
                      <option value="10x15">10x15 cm (Standard)</option>
                      <option value="13x18">13x18 cm</option>
                      <option value="20x30">20x30 cm (A4)</option>
                      <option value="30x45">30x45 cm (A3)</option>
                      <option value="Numérique HD">Fichier Numérique HD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Support / Finition</label>
                    <select 
                      value={globalConfig.support}
                      onChange={(e) => setGlobalConfig({...globalConfig, support: e.target.value})}
                      className="w-full bg-[#0a0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition"
                    >
                      <option value="Papier Brillant">Papier Brillant</option>
                      <option value="Papier Mat">Papier Mat</option>
                      <option value="Papier Fine Art">Papier Fine Art (+5€)</option>
                      <option value="Aucun (Numérique)">Aucun (Numérique)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantité par photo</label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setGlobalConfig(prev => ({...prev, quantite: Math.max(1, prev.quantite - 1)}))}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl font-bold"
                      >
                        -
                      </button>
                      <span className="text-xl font-mono w-8 text-center">{globalConfig.quantite}</span>
                      <button 
                        onClick={() => setGlobalConfig(prev => ({...prev, quantite: prev.quantite + 1}))}
                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfig(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddToQuote}
                  className="px-8 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold uppercase tracking-wide transition shadow-lg shadow-yellow-500/20"
                >
                  Valider la demande
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
