// Import des fonctions React pour le contexte, l’état local et les types
import { createContext, useContext, useState, ReactNode } from 'react';

/* -------------------------------------------------------------------------
   🧩 Interface représentant un utilisateur
------------------------------------------------------------------------- */
export interface Utilisateur {
  isAuthenticated: boolean; // L'utilisateur est-il connecté ?
  isAdmin: boolean;         // Est-ce un administrateur ?
  nom: string;              // Nom visible dans l'interface
}

/* -------------------------------------------------------------------------
   🧠 Typage du contexte utilisateur (valeur partagée)
------------------------------------------------------------------------- */
interface UserContextType {
  user: Utilisateur;                                             // État utilisateur actuel
  setUser: React.Dispatch<React.SetStateAction<Utilisateur>>;    // Fonction pour le modifier
}

/* -------------------------------------------------------------------------
   🪢 Création du contexte (valeur initiale = undefined)
------------------------------------------------------------------------- */
const UserContext = createContext<UserContextType | undefined>(undefined);

/* -------------------------------------------------------------------------
   🪄 Hook personnalisé : permet d’accéder au contexte partout dans l'app
------------------------------------------------------------------------- */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser doit être utilisé dans UserProvider'); // Sécurité
  return context;
};

/* -------------------------------------------------------------------------
   🌍 Provider global : enveloppe l’application pour partager le contexte
------------------------------------------------------------------------- */
export function UserProvider({ children }: { children: ReactNode }) {
  // Initialisation de l'état utilisateur avec valeurs par défaut
  const [user, setUser] = useState<Utilisateur>({
    isAuthenticated: false,
    isAdmin: false,
    nom: ''
  });

  return (
    // Fournit le contexte à toute la hiérarchie enfant
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
