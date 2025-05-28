// Store Zustand pour gérer l'authentification et le choix utilisateur
import { create } from "zustand";

// -------------------------------
// Hydratation initiale du store depuis le localStorage
// On vérifie si on est dans un environnement navigateur (window défini)
// -------------------------------
const initialEmail =
  typeof window !== "undefined" ? localStorage.getItem("email") : null;
const initialIsAdmin =
  typeof window !== "undefined"
    ? localStorage.getItem("isAdmin") === "true"
    : false;

// -------------------------------
// Définition du type TypeScript pour l'état du store
// -------------------------------
export interface AuthState {
  email: string | null; // Email de l'utilisateur connecté ou null si non connecté
  isAdmin: boolean; // Rôle administrateur (true/false)
  choix: "photographie" | "photo-graphiste" | null; // Choix utilisateur entre deux univers

  // Fonctions pour modifier l'état
  setEmail: (email: string | null) => void; // Met à jour l'email (ou le supprime si null)
  setIsAdmin: (isAdmin: boolean) => void; // Met à jour le rôle admin
  setChoix: (choix: "photographie" | "photo-graphiste") => void; // Met à jour le choix utilisateur
  logout: () => void; // Réinitialise tout en vidant le localStorage
}

// -------------------------------
// Création du store Zustand
// -------------------------------
export const useAuthStore = create<AuthState>((set) => ({
  // Initialisation avec les valeurs récupérées du localStorage
  email: initialEmail,
  isAdmin: initialIsAdmin, // Par défaut, non administrateur
  choix: null, // Aucun choix au départ

  // Setter pour l'email : met à jour localStorage et store
  setEmail: (email) => {
    if (email !== null) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }
    set({ email });
  },

  // Setter pour le rôle admin : met à jour localStorage et store
  setIsAdmin: (isAdmin) => {
    localStorage.setItem("isAdmin", String(isAdmin));
    set({ isAdmin });
  },

  // Setter pour le choix utilisateur (photographie ou photo-graphiste)
  setChoix: (choix) => set({ choix }),

  // Fonction pour déconnexion : supprime les infos en localStorage et reset le store
  logout: () => {
    localStorage.removeItem("email");
    localStorage.removeItem("isAdmin");
    set({ email: null, isAdmin: false, choix: null });
  },
}));

// -------------------------------
// Hook utilitaire pour synchroniser Zustand avec localStorage
// Permet de garder l'état à jour même si localStorage change dans un autre onglet
// -------------------------------
import { useEffect } from "react";
export function useAuthSync() {
  const setEmail = useAuthStore((s) => s.setEmail);
  const setIsAdmin = useAuthStore((s) => s.setIsAdmin);

  useEffect(() => {
    // Fonction appelée à chaque changement du localStorage dans un autre onglet/fenêtre
    const sync = () => {
      const email = localStorage.getItem("email");
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      setEmail(email || null);
      setIsAdmin(isAdmin);
    };
    // Ajout de l'écouteur d'événement "storage"
    window.addEventListener("storage", sync);

    // Nettoyage à la destruction du hook
    return () => window.removeEventListener("storage", sync);
  }, [setEmail, setIsAdmin]);
}
