// Store Zustand pour gérer l'authentification et le choix utilisateur
import { create } from 'zustand';

export interface AuthState {
  email: string | null; // Email de l'utilisateur connecté
  choix: 'photographie' | 'photo-graphiste' | null; // Choix initial
  setEmail: (email: string) => void;
  setChoix: (choix: 'photographie' | 'photo-graphiste') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  choix: null,
  setEmail: (email) => set({ email }),
  setChoix: (choix) => set({ choix }),
  logout: () => set({ email: null, choix: null }),
}));
