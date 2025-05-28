// Store Zustand pour gérer l'authentification et le choix utilisateur
import { create } from 'zustand';

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
  email: null,
  isAdmin: false, // Par défaut non admin
  choix: null,
  setEmail: (email) => set({ email }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setChoix: (choix) => set({ choix }),
  logout: () => set({ email: null, isAdmin: false, choix: null }),
}));
