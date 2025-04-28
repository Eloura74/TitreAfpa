import { createContext, useContext, useState, ReactNode } from 'react';

export interface Utilisateur {
  isAuthenticated: boolean;
  isAdmin: boolean;
  nom: string;
}

interface UserContextType {
  user: Utilisateur;
  setUser: React.Dispatch<React.SetStateAction<Utilisateur>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser doit être utilisé dans UserProvider');
  return context;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur>({ isAuthenticated: false, isAdmin: false, nom: '' });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
