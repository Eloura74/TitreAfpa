import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useUser } from "../context/UserContext";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import axios from "axios";
import { Link } from "react-router-dom";

interface Evenement {
  _id: string;
  montant: number;
  date: string;
  source: string;
  transactionId?: string;
  statut: string;
  articles?: any[]; // Si on veut afficher le détail plus tard
}

export default function MonCompte() {
  const { email } = useAuthStore();
  const { user } = useUser();
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      const token = localStorage.getItem("token");
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/paiements/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setEvenements(res.data);
        })
        .catch((err) => console.error("Erreur chargement événements:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [email]);

  if (!email) {
    return (
      <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
        <Navbar variant="client" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-[#ffe992] mb-4">
            Espace Privé
          </h1>
          <p className="mb-6 text-gray-400">
            Vous devez être connecté pour accéder à votre écrin privé.
          </p>
          <Link to="/connexion" className="px-6 py-2 bg-yellow-500 text-black rounded-full font-bold hover:bg-yellow-400 transition">
            Se connecter
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      <Navbar variant="client" />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* En-tête de l'espace client */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#ffe992] mb-2">L'Écrin Privé</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-wide">
              Bienvenue, <span className="text-white font-medium">{user.prenom} {user.nom}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className="text-xs uppercase tracking-widest text-gray-500">Compte connecté</span>
             <span className="text-sm font-mono text-yellow-500/80">{email}</span>
          </div>
        </div>

        {/* Section Vos Événements */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-white">Vos Événements</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-yellow-500"></span>
            </div>
          ) : evenements.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-400 mb-6 text-lg font-light">
                Aucun événement privé n'est associé à votre compte pour le moment.
              </p>
              <p className="text-sm text-gray-600">
                Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {evenements.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-[#12121a] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                >
                  {/* Image de couverture */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-black">
                    {event.image ? (
                      <img 
                        src={event.image} 
                        alt={event.titre} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <Calendar className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-200 transition-colors">
                        {event.titre}
                      </h3>
                      {event.lieu && (
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <MapPin size={12} className="text-yellow-500" />
                          <span>{event.lieu}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono text-yellow-500/70 bg-yellow-500/10 px-2 py-1 rounded">
                        {new Date(event.dateDebut).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.photos?.length || 0} photos
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-light">
                      {event.description || "Accédez à votre galerie privée pour sélectionner vos photos."}
                    </p>

                    <button 
                      onClick={() => navigate(`/client/evenement/${event._id}`)}
                      className="w-full py-3 bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-yellow-500 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      <span className="text-sm uppercase tracking-wider font-medium">Accéder à la galerie</span>
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
