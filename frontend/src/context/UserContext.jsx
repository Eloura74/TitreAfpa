import { createContext, useContext, useState } from 'react';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  // Par défaut, non connecté et non admin
  const [user, setUser] = useState({ isAuthenticated: false, isAdmin: false, nom: '' });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
