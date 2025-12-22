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

  // ----------------------------------------------------------------------------
  // 🔁 useEffect : Récupération des données à l’ouverture de la page
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/evenements`
        );
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

  // ----------------------------------------------------------------------------
  // 🎨 AFFICHAGE JSX
  // ----------------------------------------------------------------------------
  return (
    <div className="page-container min-h-screen flex flex-col">
      {/* --- Barre de navigation globale --- */}
      <Navbar />

      {/* --- Contenu principal --- */}
      <main className="main-content flex-1 flex flex-col p-0">
        {/* 🔤 Titre principal + séparateur */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#ffe992] text-center">
          ÉVÉNEMENTS
        </h1>
        <div className="evenements-titre-divider mx-auto my-2 w-20 h-1 bg-[#ffe992] rounded"></div>
        <p className="evenements-subtitle text-center text-base text-white/80 mb-4">
          Retrouvez ici les prochains événements à venir :
        </p>

        {/* 🔘 Filtres par type d’événements */}
        <div className="flex flex-row gap-2 w-full px-2 mb-4">
          {["tous", "à venir", "passé"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as "à venir" | "passé" | "tous")}
              className={`flex-1 py-2 rounded font-semibold transition-colors duration-150 border border-[#ffe992]/20
                ${
                  filter === cat
                    ? "bg-[#ffe992] text-black" // Actif
                    : "bg-[#232336] text-[#ffe992] hover:bg-[#ffe992]/30" // Inactif
                }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 🧱 Grille responsive pour afficher les cartes d’événements */}
        <div className="w-full flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {/* Cas : aucun événement à afficher */}
            {filteredEvents.length === 0 ? (
              <p className="text-gray-400 text-center col-span-full">
                Aucun événement trouvé.
              </p>
            ) : (
              // Sinon on affiche les cartes une à une
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-black/90 rounded-xl shadow-lg overflow-hidden flex flex-col"
                >
                  {/* 🖼️ Image d’affiche (avec fallback si absente) */}
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.titre}
                      className="w-full h-32 object-cover rounded-t"
                    />
                  )}

                  {/* 📋 Détails de l’événement (titre, description, date, lieu, thème) */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#ffe992]">
                      {event.titre}
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm">
                      {event.description}
                    </p>
                    <div className="flex flex-col gap-1 mt-2">
                      {/* 🗓 Dates de début/fin */}
                      <span className="text-xs text-gray-400">
                        Du {event.dateDebut} au {event.dateFin}
                      </span>

                      {/* 📍 Lieu */}
                      <span className="flex items-center gap-2 text-[#d6c487] text-xs sm:text-sm">
                        <MapPin size={16} />
                        {event.lieu || (
                          <span className="italic text-gray-500">
                            Lieu non renseigné
                          </span>
                        )}
                      </span>

                      {/* 🎯 Thème (si présent) */}
                      {event.theme && (
                        <span className="flex items-center gap-2 text-[#d6c487] text-xs sm:text-sm">
                          <Target size={16} />
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

      {/* --- Pied de page --- */}
      <Footer />
    </div>
  );
}
