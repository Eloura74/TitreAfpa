import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

interface Event {
  _id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  image?: string;
  slug?: string;
}

export default function EventPromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/evenements`);
        if (!response.ok) return;

        const events = await response.json();
        const now = new Date();

        const upcoming = events
          .filter((event: Event) => new Date(event.dateDebut) > now)
          .sort(
            (a: Event, b: Event) =>
              new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime(),
          )[0];

        if (upcoming) {
          setUpcomingEvent(upcoming);
          setTimeout(() => setIsVisible(true), 2000);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'événement:", error);
      }
    };

    fetchUpcomingEvent();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    if (upcomingEvent?.slug) {
      navigate(`/evenements/${upcomingEvent.slug}`);
    } else {
      navigate("/evenements");
    }
    handleClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!upcomingEvent) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 right-6 z-50 w-[480px] max-w-[calc(100vw-3rem)]"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/20 via-yellow-500/20 to-yellow-400/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-xl rounded-xl border border-yellow-400/20 overflow-hidden shadow-2xl">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-all duration-300"
                aria-label="Fermer"
              >
                <X size={14} />
              </button>

              <div className="flex">
                {/* Image à gauche */}
                <div className="relative w-40 flex-shrink-0 overflow-hidden">
                  {upcomingEvent.image ? (
                    <img
                      src={
                        upcomingEvent.image.startsWith("http")
                          ? upcomingEvent.image
                          : `${API_URL}${upcomingEvent.image}`
                      }
                      alt={upcomingEvent.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-900/20 to-black/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />

                  <div className="absolute top-2 left-2">
                    <span className="inline-block px-2 py-0.5 bg-yellow-400/90 text-black text-[9px] font-bold uppercase tracking-wider rounded-full">
                      À venir
                    </span>
                  </div>
                </div>

                {/* Contenu à droite */}
                <div className="flex-1 p-4">
                  <h3 className="text-sm font-semibold text-white mb-2 line-clamp-1">
                    {upcomingEvent.titre}
                  </h3>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 text-sm text-white/70">
                      <Calendar
                        size={11}
                        className="text-yellow-400 flex-shrink-0"
                      />
                      <span className="text-[10px]">
                        {formatDate(upcomingEvent.dateDebut)}
                      </span>
                    </div>

                    {upcomingEvent.lieu && (
                      <div className="flex items-center gap-1.5 text-sm text-white/70">
                        <MapPin
                          size={11}
                          className="text-yellow-400 flex-shrink-0"
                        />
                        <span className="text-[10px] line-clamp-1">
                          {upcomingEvent.lieu}
                        </span>
                      </div>
                    )}
                  </div>

                  {upcomingEvent.description && (
                    <p className="text-[10px] text-white/60 mb-3 line-clamp-2">
                      {upcomingEvent.description}
                    </p>
                  )}

                  <button
                    onClick={handleClick}
                    className="w-full group/btn relative overflow-hidden rounded-lg py-2 px-3 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 group-hover/btn:from-yellow-400/20 group-hover/btn:to-yellow-500/20 transition-all duration-300" />
                    <div className="absolute inset-0 border border-yellow-400/30 group-hover/btn:border-yellow-400/60 rounded-lg transition-all duration-300" />

                    <span className="relative text-[10px] uppercase tracking-wider font-semibold bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                      Découvrir l'événement
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
