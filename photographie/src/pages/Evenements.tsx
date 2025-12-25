// ============================================================================
// 📦 IMPORTATIONS DES MODULES ET COMPOSANTS
// ============================================================================
import { useState, useEffect } from "react"; // Hooks React : état et effet de cycle de vie
import axios from "axios"; // Librairie HTTP pour appels API
import Navbar from "../components/layout/navbar"; // Barre de navigation
import Footer from "../components/layout/Footer"; // Pied de page
import { API_URL } from "../config/api";

// Styles CSS importés
import "react-calendar/dist/Calendar.css"; // Style de calendrier (non utilisé ici)
import "../styles/globals.css"; // Styles globaux de l'app
import "../styles/evenements.css"; // Styles spécifiques à cette page

// Icônes importées depuis la librairie Lucide
import { MapPin, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Type TypeScript pour sécuriser les objets événements
import type { Evenement } from "../types/evenement";

// ============================================================================
// 📄 COMPOSANT PRINCIPAL DE LA PAGE ÉVÉNEMENTS
// ============================================================================
export default function Evenements() {
  // ----------------------------------------------------------------------------
  // 🧠 ÉTATS LOCAUX
  // ----------------------------------------------------------------------------
  const [evenements, setEvenements] = useState<Evenement[]>([]); // Liste des événements récupérés
  const [filter, setFilter] = useState<"à venir" | "passé" | "tous">("tous"); // Filtre actif
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------------------------
  // 🔁 useEffect : Récupération des données à l’ouverture de la page
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/evenements`);
        const data = res.data;

        // Normalisation : transformation des données brutes pour uniformiser les clés
        const events: Evenement[] = data.map((ev: {
          _id?: string;
          id?: string;
          titre: string;
          description?: string;
          dateDebut: string;
          dateFin: string;
          image?: string;
          lieu?: string;
          location?: string;
          place?: string;
          theme?: string;
          photos?: string[];
        }) => ({
          ...ev,
          id: ev._id || ev.id || "",
          lieu: ev.lieu || ev.location || ev.place || "",
        }));

        setEvenements(events); // Mise à jour de l'état
      } catch (error) {
        // Gestion des erreurs d’API
        console.error("Erreur lors de la récupération des événements :", error);
        setEvenements([]); // État vide si erreur
      } finally {
        setLoading(false);
      }
    };

    fetchEvenements(); // Appel au chargement
  }, []);

  // ----------------------------------------------------------------------------
  // 📅 Date du jour au format "AAAA-MM-JJ"
  // Utilisé pour filtrer les événements selon leur date
  // ----------------------------------------------------------------------------
  const today = new Date().toISOString().split("T")[0];

  // ----------------------------------------------------------------------------
  // 🔎 Filtrage dynamique selon le filtre sélectionné
  // ----------------------------------------------------------------------------
  const filteredEvents: Evenement[] = evenements.filter((event) => {
    if (filter === "à venir") return event.dateDebut >= today;
    if (filter === "passé") return event.dateDebut < today;
    return true;
  });

  // Variants pour les animations (identiques aux galeries)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { scale: 0.98, opacity: 0, transition: { duration: 0.3 } }
  };

  // ----------------------------------------------------------------------------
  // 🎨 AFFICHAGE JSX
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30">
      {/* --- Barre de navigation globale --- */}
      <Navbar />

      {/* --- Contenu principal --- */}
      <main className="max-w-[1800px] mx-auto px-6 md:px-8 pb-32 pt-32">
        {/* 🔤 Titre principal + séparateur */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-thin tracking-[0.2em] text-center uppercase mb-6">
            Événements
          </h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          <p className="mt-6 text-white/60 font-light tracking-widest text-sm md:text-base uppercase text-center max-w-2xl">
            Retrouvez ici les prochaines expositions et rencontres
          </p>
        </motion.div>

        {/* 🔘 Filtres par type d’événements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex justify-center gap-8 mb-16"
        >
          {["tous", "à venir", "passé"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as "à venir" | "passé" | "tous")}
              className={`text-xs md:text-sm uppercase tracking-[0.2em] transition-all duration-500 relative py-2
                ${filter === cat ? "text-yellow-500" : "text-white/40 hover:text-white"}
              `}
            >
              {cat}
              {filter === cat && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-yellow-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* 🧱 Grille responsive pour afficher les cartes d’événements */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Squelettes de chargement
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-white/5 rounded-2xl" />
                  <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-white/5 rounded w-1/2 mx-auto" />
                </div>
              ))
            ) : filteredEvents.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/40 text-center col-span-full py-20 font-light tracking-widest uppercase"
              >
                Aucun événement trouvé pour le moment.
              </motion.p>
            ) : (
              // Cartes événements
              filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={cardVariants}
                  layout
                  className="group relative flex flex-col"
                >
                  {/* Image Section avec Overlay */}
                  <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-[#111] rounded-2xl shadow-lg border border-white/10 group-hover:shadow-2xl group-hover:border-white/20 transition-all duration-500">
                    {event.image ? (
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        src={event.image}
                        alt={event.titre}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <MapPin className="text-white/20 w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                      <p className="text-white/90 text-xs font-light tracking-widest leading-relaxed line-clamp-4">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Content Section - Épuré */}
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="flex flex-col items-center gap-1">
                      <h3 className="text-base md:text-lg font-light text-white tracking-[0.2em] uppercase group-hover:text-yellow-200 transition-colors duration-500">
                        {event.titre}
                      </h3>
                      <div className="flex flex-wrap justify-center gap-3 text-yellow-500/60 text-[10px] tracking-widest uppercase">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{event.lieu || "Lieu non renseigné"}</span>
                        </div>
                        {event.theme && (
                          <div className="flex items-center gap-1">
                            <Target size={12} />
                            <span>{event.theme}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-6 h-[1px] bg-white/5 group-hover:bg-yellow-500/20 transition-colors duration-500 my-2" />

                    <span className="text-white/80 text-xs font-light tracking-widest">
                      {new Date(event.dateDebut).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* --- Pied de page --- */}
      <Footer />
    </div>
  );
}
