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
import { MapPin, Target, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandableCard } from "../components/ui/ExpandableCard";

// Type TypeScript pour sécuriser les objets événements
import type { Evenement } from "../types/evenement";
import PageTitle from "../components/ui/PageTitle";
import { useRef } from "react";

// ============================================================================
// � COMPOSANT CARTE ÉVÉNEMENT
// ============================================================================
interface EventCardProps {
  event: Evenement;
  onExpand: (
    event: Evenement,
    position: { top: number; left: number; width: number; height: number },
  ) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onExpand }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onExpand(event, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      }}
      viewport={{ once: true }}
      layout
      className="group relative flex flex-col h-full"
    >
      <div className="h-full block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 transition-all duration-500 hover:bg-white/10 hover:border-[#ffe992]/30 hover:shadow-[0_0_30px_rgba(255,233,146,0.1)]">
        {/* Image Section avec Overlay */}
        <div className="relative overflow-hidden aspect-[3/4] mb-6 rounded-xl">
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
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
            <p className="text-white/90 text-xs font-light tracking-widest leading-relaxed line-clamp-4">
              {event.description}
            </p>
          </div>
        </div>

        {/* Content Section - Épuré */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-serif text-[#ffe992] tracking-wide group-hover:text-white transition-colors duration-300">
              {event.titre}
            </h3>
            <div className="flex flex-wrap justify-center gap-3 text-white/60 text-[10px] tracking-[0.2em] uppercase">
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-[#ffe992]" />
                <span>{event.lieu || "Lieu non renseigné"}</span>
              </div>
              {event.theme && (
                <div className="flex items-center gap-1">
                  <Target size={12} className="text-[#ffe992]" />
                  <span>{event.theme}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-12 h-[1px] bg-white/10 group-hover:bg-[#ffe992]/50 transition-colors duration-500" />

          <span className="text-white/40 text-xs font-light tracking-widest">
            {new Date(event.dateDebut).toLocaleDateString()}
          </span>

          {/* Bouton Voir plus */}
          <button
            onClick={handleExpand}
            className="mt-4 w-full bg-gradient-to-r from-[#ffe992]/20 to-[#ffe992]/30 hover:from-[#ffe992]/30 hover:to-[#ffe992]/40 text-[#ffe992] text-xs font-bold uppercase tracking-wider py-2 rounded-lg border border-[#ffe992]/40 hover:border-[#ffe992]/70 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Voir plus</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// � COMPOSANT PRINCIPAL DE LA PAGE ÉVÉNEMENTS
// ============================================================================
export default function Evenements() {
  // ----------------------------------------------------------------------------
  // 🧠 ÉTATS LOCAUX
  // ----------------------------------------------------------------------------
  const [evenements, setEvenements] = useState<Evenement[]>([]); // Liste des événements récupérés
  const [filter, setFilter] = useState<"à venir" | "passé" | "tous">("tous"); // Filtre actif
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<Evenement | null>(null);
  const [cardPosition, setCardPosition] = useState<
    { top: number; left: number; width: number; height: number } | undefined
  >();

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
        const events: Evenement[] = data.map(
          (ev: {
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
          }),
        );

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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  // ----------------------------------------------------------------------------
  // 🎨 AFFICHAGE JSX
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30">
      {/* --- Barre de navigation globale --- */}
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* --- Contenu principal --- */}
      <main className="max-w-[1800px] mx-auto px-6 md:px-8 pb-32 pt-32 relative z-10">
        {/* 🔤 Titre principal + séparateur */}
        <PageTitle title="Événements" />

        {/* 🔘 Filtres par type d’événements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex justify-center mb-12"
        >
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            {["tous", "à venir", "passé"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as "à venir" | "passé" | "tous")}
                className={`relative text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-300 px-4 py-2 rounded-full ${
                  filter === cat
                    ? "text-[#ffe992] font-medium bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
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
              Array(5)
                .fill(0)
                .map((_, i) => (
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
                <EventCard
                  key={event.id}
                  event={event}
                  onExpand={(evt, pos) => {
                    setCardPosition(pos);
                    setExpandedEvent(evt);
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Modal d'expansion */}
      {expandedEvent && (
        <ExpandableCard
          isExpanded={expandedEvent !== null}
          onClose={() => setExpandedEvent(null)}
          cardPosition={cardPosition}
        >
          {/* Effets lumineux */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#ffe992]/15 via-[#ffe992]/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffe992] to-transparent pointer-events-none" />

          <div className="relative flex flex-col md:flex-row gap-8 h-full">
            {/* Image Section */}
            <div className="md:w-1/2 flex flex-col gap-4">
              {expandedEvent.image ? (
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <img
                    src={expandedEvent.image}
                    alt={expandedEvent.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
                  <MapPin className="text-white/20 w-24 h-24" />
                </div>
              )}
              {expandedEvent.photos && expandedEvent.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {expandedEvent.photos.slice(0, 3).map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video overflow-hidden rounded-lg"
                    >
                      <img
                        src={photo}
                        alt={`${expandedEvent.titre} ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 flex flex-col">
              {/* Titre avec séparateur */}
              <div className="mb-6 pb-4 border-b border-[#ffe992]/30">
                <h3 className="text-3xl font-serif font-bold text-[#ffe992] drop-shadow-[0_0_15px_rgba(255,233,146,0.8)] text-center uppercase tracking-wider mb-3">
                  {expandedEvent.titre}
                </h3>
                <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#ffe992]" />
                    <span>{expandedEvent.lieu || "Lieu non renseigné"}</span>
                  </div>
                  {expandedEvent.theme && (
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-[#ffe992]" />
                      <span>{expandedEvent.theme}</span>
                    </div>
                  )}
                </div>
                <p className="text-center text-white/60 text-sm mt-3">
                  Du {new Date(expandedEvent.dateDebut).toLocaleDateString()}
                  {expandedEvent.dateFin &&
                    ` au ${new Date(expandedEvent.dateFin).toLocaleDateString()}`}
                </p>
              </div>

              {/* Description complète avec scroll */}
              <div className="flex-1 overflow-y-auto mb-6 pr-2">
                <p className="text-base text-gray-200 leading-relaxed text-justify whitespace-pre-line">
                  {expandedEvent.description ||
                    "Aucune description disponible."}
                </p>
              </div>
            </div>
          </div>
        </ExpandableCard>
      )}

      {/* --- Pied de page --- */}
      <Footer />
    </div>
  );
}
