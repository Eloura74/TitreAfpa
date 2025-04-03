import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/globals.css";
import "../styles/evenements.css"; // Import des styles spécifiques à la page Événements

export default function Evenements() {
  const allEvents = [
    {
      date: "2025-06-02",
      label: "DU LUNDI 02/06/2025",
      description: "Début de l'événement photo",
    },
    {
      date: "2025-06-06",
      label: "AU VENDREDI 06/06/2025",
      description: "Fin de l'événement photo",
    },
    {
      date: "2025-06-06",
      label: "AU VENDREDI 06/06/2025",
      description: "Clôture et remise des prix",
    },
  ];

  const [filter, setFilter] = useState<"à venir" | "passé" | "tous">("tous");
  const today = new Date().toISOString().split("T")[0];

  const filteredEvents = allEvents.filter((event) => {
    if (filter === "à venir") return event.date >= today;
    if (filter === "passé") return event.date < today;
    return true;
  });

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content evenements-container">
        {/* Titre centré avec trait doré en dessous */}
        <h1 className="evenements-titre">
          ÉVÉNEMENTS
        </h1>
        <div className="evenements-titre-divider"></div>

        {/* Sous-titre centré */}
        <p className="evenements-subtitle">
          Retrouvez ici les prochains événements à venir :
        </p>

        {/* Filtres centrés */}
        <div className="evenements-filtres">
          <button
            onClick={() => setFilter("tous")}
            className={`evenements-filtre-btn px-4 py-2 rounded-sm transition-all duration-300 ${
              filter === "tous" ? "active" : ""
            }`}
          >
            TOUS
          </button>
          <button
            onClick={() => setFilter("à venir")}
            className={`evenements-filtre-btn px-4 py-2 rounded-sm transition-all duration-300 ${
              filter === "à venir" ? "active" : ""
            }`}
          >
            À VENIR
          </button>
          <button
            onClick={() => setFilter("passé")}
            className={`evenements-filtre-btn px-4 py-2 rounded-sm transition-all duration-300 ${
              filter === "passé" ? "active" : ""
            }`}
          >
            PASSÉS
          </button>
        </div>

        {/* Container des événements */}
        <div className="evenements-liste">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-400 text-center">Aucun événement trouvé.</p>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event, index) => (
                <div
                  key={index}
                  className="evenement-carte animate-fadeIn"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="evenement-contenu">
                    <div className="evenement-indicateur"></div>
                    <div>
                      <h2 className="evenement-titre">
                        {event.label}
                      </h2>
                      <p className="evenement-description">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
