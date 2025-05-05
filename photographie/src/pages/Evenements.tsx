// Importations des modules nécessaires
// React : framework React
// useState, useEffect : hooks React pour la gestion du cycle de vie et de l'état
// Navbar : composant de navigation
// Footer : composant de footer
// axios : bibliothèque pour les requêtes HTTP
// react-calendar : composant de calendrier
// globals.css, evenements.css : styles globaux et spécifiques
// Calendar : composant de calendrier
// CalendarDays, MapPin, Target : icônes de Lucide
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "react-calendar/dist/Calendar.css";
import "../styles/globals.css";
import "../styles/evenements.css";
import Calendar from "react-calendar";
import { CalendarDays, MapPin, Target } from "lucide-react";

// Fonction principale du composant Evenements
export default function Evenements() {
  const [evenements, setEvenements] = useState([]); // Liste dynamique des événements
  const [filter, setFilter] = useState<"à venir" | "passé" | "tous">("tous"); // État pour le filtre
  const [showCalendarId, setShowCalendarId] = useState<string | null>(null); // État pour le calendrier
  const [hoveredMapId, setHoveredMapId] = useState<string | null>(null); // État pour le map
  const calendarRef = useRef<HTMLDivElement>(null); // Référence au calendrier

  // Récupération des événements via l'API backend
  useEffect(() => {
    axios.get("http://localhost:5001/api/evenements")
      .then(res => setEvenements(res.data))
      .catch(() => setEvenements([]));
  }, []);

  const today = new Date().toISOString().split("T")[0]; // Date actuelle

  // Filtrage dynamique des événements selon le filtre sélectionné
  const filteredEvents = evenements.filter((event: any) => {
    if (filter === "à venir") return event.date >= today;
    if (filter === "passé") return event.date < today;
    return true;
  });

  // Fonction principale du composant Evenements
  return (
    <div className="page-container">
      <Navbar />
      <main className="main-content evenements-container">
        <h1 className="evenements-titre">ÉVÉNEMENTS</h1>
        <div className="evenements-titre-divider"></div>
        <p className="evenements-subtitle">
          Retrouvez ici les prochains événements à venir :
        </p>

        {/* Filtres */}
        <div className="evenements-filtres">
          {["tous", "à venir", "passé"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`evenements-filtre-btn ${
                filter === cat ? "active" : ""
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Liste des événements */}
        <div className="evenements-liste">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun événement trouvé.</p>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="evenement-carte animate-fadeIn">
                <div className="evenement-contenu">
                  {/* Image de l’événement */}
                  <img
                    src={event.urlAffiche}
                    alt={event.titre}
                    className="evenement-affiche"
                  />

                  {/* Informations de l’événement */}
                  <div className="evenement-info">
                    <h2 className="evenement-titre">{event.titre}</h2>
                    <p className="evenement-description">{event.description}</p>

                    <div className="evenement-meta">
                      {/* Affichage calendrier au clic */}
                      <div className="relative">
                        <span
                          className="flex items-center gap-2 cursor-pointer hover:text-yellow-200"
                          onClick={() =>
                            setShowCalendarId(
                              showCalendarId === event.id ? null : event.id
                            )
                          }
                        >
                          <CalendarDays size={16} className="text-yellow-300" />
                          Du {event.dateDebut} au {event.dateFin}
                        </span>

                        {showCalendarId === event.id && (
                          <div
                            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]"
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                setShowCalendarId(null);
                              }
                            }}
                          >
                            <div
                              ref={calendarRef}
                              className="bg-[#1a1a20] border-2 border-[#d6c487] rounded-md p-4 shadow-lg max-w-md mx-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-yellow-300 font-bold">
                                  Dates de l'événement
                                </h3>
                                <button
                                  onClick={() => setShowCalendarId(null)}
                                  className="text-gray-400 hover:text-white text-lg font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                              <Calendar
                                defaultValue={[
                                  new Date(event.dateDebut),
                                  new Date(event.dateFin),
                                ]}
                                selectRange
                                tileDisabled={() => true}
                                className="custom-calendar border-2 border-red-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Affichage Google Maps au survol */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredMapId(event.id)}
                        onMouseLeave={() => setHoveredMapId(null)}
                      >
                        <span className="flex items-center gap-2 cursor-pointer text-blue-300 hover:underline">
                          <MapPin size={16} className="text-yellow-300" />
                          {event.lieu}
                        </span>

                        {hoveredMapId === event.id && (
                          <div className="absolute top-full left-0 mt-2 z-50 w-64 h-40 rounded overflow-hidden shadow-lg border border-[#333]">
                            <iframe
                              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_API_KEY&q=${encodeURIComponent(
                                event.lieu
                              )}`}
                              width="100%"
                              height="100%"
                              loading="lazy"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>

                      {/* Thème de l’événement */}
                      <span className="flex items-center gap-2">
                        <Target size={16} className="text-yellow-300" />
                        Thème : {event.theme}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
