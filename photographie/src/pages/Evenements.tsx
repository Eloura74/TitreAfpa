import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import "react-calendar/dist/Calendar.css";
import "../styles/globals.css";
import "../styles/evenements.css";
import { CalendarDays, MapPin, Target } from "lucide-react";
import type { Evenement } from "../types/evenement";

// ------------------------------------------------------------
// Composant principal de la page des événements
// ------------------------------------------------------------
export default function Evenements() {
  // Liste des événements récupérée via l'API
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  // État du filtre ("tous" | "à venir" | "passé")
  const [filter, setFilter] = useState<"à venir" | "passé" | "tous">("tous");

  // ----------------------------------------------------------
  // Récupération asynchrone des événements au montage du composant
  // ----------------------------------------------------------
  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/evenements`
        );
        const data = res.data;
        // Normalisation des champs pour le front
        const events: Evenement[] = data.map((ev: any) => ({
          ...ev,
          id: ev._id || ev.id,
          lieu: ev.lieu || ev.location || ev.place || "",
        }));
        setEvenements(events);
      } catch (error) {
        // Gestion d’erreur simple
        console.error("Erreur lors de la récupération des événements :", error);
        setEvenements([]);
      }
    };
    fetchEvenements();
  }, []);

  // Date du jour au format AAAA-MM-JJ
  const today = new Date().toISOString().split("T")[0];

  // Filtrage dynamique des événements selon le filtre choisi
  const filteredEvents: Evenement[] = evenements.filter((event: Evenement) => {
    if (filter === "à venir") return event.date >= today;
    if (filter === "passé") return event.date < today;
    return true;
  });

  // ----------------------------------------------------------
  // Rendu principal de la page
  // ----------------------------------------------------------
  return (
    <div className="page-container min-h-screen flex flex-col">
      {/* Barre de navigation */}
      <Navbar />

      {/* Contenu principal centré, largeur limitée (gérée par .main-content) */}
      <main className="main-content flex-1 flex flex-col p-0">
        {/* Titre et sous-titre responsives */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#ffe992] text-center leading-tight break-words">
          ÉVÉNEMENTS
        </h1>
        <div className="evenements-titre-divider mx-auto my-2 w-20 h-1 bg-[#ffe992] rounded"></div>
        <p className="evenements-subtitle text-center text-base text-white/80 mb-4">
          Retrouvez ici les prochains événements à venir :
        </p>

        {/* Filtres full width mobile, gap réduit */}
        <div className="flex flex-row gap-2 w-full px-2 mb-4">
          {["tous", "à venir", "passé"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as "à venir" | "passé" | "tous")}
              className={`flex-1 py-2 rounded font-semibold transition-colors duration-150 border border-[#ffe992]/20
                ${
                  filter === cat
                    ? "bg-[#ffe992] text-black"
                    : "bg-[#232336] text-[#ffe992] hover:bg-[#ffe992]/30"
                }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Grille responsive mobile-first */}
        <div className="w-full flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {filteredEvents.length === 0 ? (
              <p className="text-gray-400 text-center col-span-full">
                Aucun événement trouvé.
              </p>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-black/90 rounded-xl shadow-lg overflow-hidden flex flex-col w-full min-w-0"
                >
                  {/* Image de l’événement (fallback si image absente) */}
                  <img
                    src={event.urlAffiche || ""}
                    alt={event.titre || "Affiche événement"}
                    className="w-full h-40 sm:h-56 object-cover object-center bg-gray-900"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.classList.add("bg-gray-800");
                    }}
                  />
                  {/* Infos principales de l'événement */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#ffe992]">
                      {event.titre}
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm">
                      {event.description}
                    </p>
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="flex items-center gap-2 text-[#d6c487] text-xs sm:text-sm">
                        <CalendarDays size={16} className="text-[#d6c487]" />
                        Du {event.dateDebut || "-"} au {event.dateFin || "-"}
                      </span>
                      <span className="flex items-center gap-2 text-[#d6c487] text-xs sm:text-sm">
                        <MapPin size={16} className="text-[#d6c487]" />
                        {event.lieu ? (
                          event.lieu
                        ) : (
                          <span className="italic text-gray-500">
                            Lieu non renseigné
                          </span>
                        )}
                      </span>
                      {event.theme && (
                        <span className="flex items-center gap-2 text-[#d6c487] text-xs sm:text-sm">
                          <Target size={16} className="text-[#d6c487]" />
                          {event.theme}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer collé en bas */}
      <Footer />
    </div>
  );
}
