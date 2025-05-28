// Store Zustand pour gérer l'authentification et le choix utilisateur
import { create } from 'zustand';

// Hydratation du store depuis le localStorage au démarrage
const initialEmail = typeof window !== 'undefined' ? localStorage.getItem("email") : null;
const initialIsAdmin = typeof window !== 'undefined' ? localStorage.getItem("isAdmin") === "true" : false;

export interface AuthState {
  email: string | null; // Email de l'utilisateur connecté
  isAdmin: boolean; // Rôle administrateur
  choix: 'photographie' | 'photo-graphiste' | null; // Choix initial
  setEmail: (email: string) => void;
  setIsAdmin: (isAdmin: boolean) => void; // Setter admin
  setChoix: (choix: 'photographie' | 'photo-graphiste') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialise à partir du localStorage
  email: initialEmail,
  isAdmin: initialIsAdmin, // Par défaut non admin
  choix: null,
  setEmail: (email) => {
    localStorage.setItem("email", email);
    set({ email });
  },
  setIsAdmin: (isAdmin) => {
    localStorage.setItem("isAdmin", String(isAdmin));
    set({ isAdmin });
  },
  setChoix: (choix) => set({ choix }),
  logout: () => {
    localStorage.removeItem("email");
    localStorage.removeItem("isAdmin");
    set({ email: null, isAdmin: false, choix: null });
  },
}));
