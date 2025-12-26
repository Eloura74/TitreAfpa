import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import axios from "axios";
import { API_URL } from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";

// Types
interface Tarif {
  _id?: string;
  id?: string;
  format: string;
  support: string;
  prix: number;
}

interface Photo {
  _id: string;
  url: string;
  titre?: string;
  tarifs?: Tarif[];
}

interface Evenement {
  _id: string;
  titre: string;
  description?: string;
  dateDebut: string;
  photos: Photo[];
}



export default function ClientEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  
  // Configuration de la commande
  const [config, setConfig] = useState<{
    [photoId: string]: {
      tarifId: string;
      quantite: number;
    }
  }>({});

  useEffect(() => {
    const fetchEvenement = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/acces-prive/${id}`, {
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
    setSelectedPhotos(prev => {
      const newSelection = prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId];
      
      // Initialiser la config par défaut si nouvelle sélection
      if (!prev.includes(photoId) && evenement) {
        const photo = evenement.photos.find(p => p._id === photoId);
        if (photo && photo.tarifs && photo.tarifs.length > 0) {
          setConfig(curr => ({
            ...curr,
            [photoId]: { tarifId: (photo.tarifs![0]._id || photo.tarifs![0].id) as string, quantite: 1 }
          }));
        }
      }
      return newSelection;
    });
  };

  const handleAddToQuote = () => {
    // Construction du panier
    const items = selectedPhotos.map(photoId => {
      const photo = evenement?.photos.find(p => p._id === photoId);
      const conf = config[photoId];
      const tarif = photo?.tarifs?.find(t => (t._id === conf?.tarifId || t.id === conf?.tarifId));
      
      if (!photo || !tarif) return null;

      return {
        photoId: photo._id,
        photoUrl: photo.url,
        tarifId: tarif._id || tarif.id,
        format: tarif.format,
        support: tarif.support,
        prix: tarif.prix,
        quantite: conf?.quantite || 1
      };
    }).filter(Boolean);

    console.log("Ajout au panier:", items);
    // TODO: Appel API pour ajouter au panier
    alert("Vos photos ont été ajoutées au panier !");
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
              
              {/* Prix à partir de */}
              {photo.tarifs && photo.tarifs.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-center text-gray-300">
                    À partir de <span className="text-white font-bold">{Math.min(...photo.tarifs.map(t => t.prix))}€</span>
                  </p>
                </div>
              )}
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
              className="bg-[#1a1a24] w-full max-w-4xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#12121a]">
                <h3 className="text-xl font-serif italic text-[#ffe992]">Configuration de la commande</h3>
                <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedPhotos.map(photoId => {
                  const photo = evenement?.photos.find(p => p._id === photoId);
                  if (!photo) return null;

                  return (
                    <div key={photoId} className="flex gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                      <img src={photo.url} alt={photo.titre} className="w-24 h-36 object-cover rounded bg-black" />
                      
                      <div className="flex-1 space-y-4">
                        <h4 className="font-bold text-white">{photo.titre}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Format & Support</label>
                            <select 
                              value={config[photoId]?.tarifId || ""}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                [photoId]: { ...prev[photoId], tarifId: e.target.value }
                              }))}
                              className="w-full bg-[#0a0a10] border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-yellow-500 focus:outline-none"
                            >
                              {photo.tarifs?.map((t: any) => (
                                <option key={t._id || t.id} value={t._id || t.id}>
                                  {t.format} - {t.support} ({t.prix}€)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setConfig(prev => ({
                                  ...prev,
                                  [photoId]: { ...prev[photoId], quantite: Math.max(1, (prev[photoId]?.quantite || 1) - 1) }
                                }))}
                                className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono">{config[photoId]?.quantite || 1}</span>
                              <button 
                                onClick={() => setConfig(prev => ({
                                  ...prev,
                                  [photoId]: { ...prev[photoId], quantite: (prev[photoId]?.quantite || 1) + 1 }
                                }))}
                                className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-[#12121a] flex justify-between items-center">
                <div className="text-right flex-1 mr-6">
                  <p className="text-gray-400 text-sm">Total estimé</p>
                  <p className="text-2xl font-bold text-[#ffe992]">
                    {selectedPhotos.reduce((acc, id) => {
                      const photo = evenement?.photos.find(p => p._id === id);
                      const conf = config[id];
                      const tarif = photo?.tarifs?.find(t => (t._id === conf?.tarifId || t.id === conf?.tarifId));
                      return acc + (tarif?.prix || 0) * (conf?.quantite || 1);
                    }, 0).toFixed(2)} €
                  </p>
                </div>
                <button 
                  onClick={handleAddToQuote}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold uppercase tracking-wide transition shadow-lg shadow-yellow-500/20"
                >
                  Ajouter au panier
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
