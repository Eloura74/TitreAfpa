// ==========================================================================
// 📦 Import des éléments React nécessaires à la création d’un contexte
// ==========================================================================
import { createContext, useContext, useState, ReactNode } from "react";

/* ==========================================================================
   🧩 Interface `Utilisateur` : structure des données utilisateur dans l'application
   - Permet de typer le state utilisateur avec des propriétés claires
========================================================================== */
export interface Utilisateur {
  isAuthenticated: boolean; // ✔️ Indique si l'utilisateur est connecté (authentifié)
  isAdmin: boolean; // 👑 Indique si l'utilisateur possède les droits administrateur
  nom: string; // 🧑 Nom affiché dans l'interface (par exemple en haut de page)
}

/* ==========================================================================
   🧠 Interface `UserContextType` : structure des données partagées dans le contexte
   - Comprend l'utilisateur courant ET une fonction pour le modifier
========================================================================== */
interface UserContextType {
  user: Utilisateur; // ✅ Données utilisateur actuelles
  setUser: React.Dispatch<React.SetStateAction<Utilisateur>>; // 🔁 Fonction permettant de modifier l'utilisateur
}

/* ==========================================================================
   🌐 Création du contexte utilisateur avec valeur initiale "undefined"
   - On utilisera un Provider pour définir sa valeur réelle
========================================================================== */
const UserContext = createContext<UserContextType | undefined>(undefined);

/* ==========================================================================
   🧪 Hook personnalisé `useUser()`
   - Permet d'accéder au contexte utilisateur depuis n’importe quel composant enfant
   - Inclut une vérification de sécurité pour éviter les erreurs d’utilisation
========================================================================== */
export const useUser = () => {
  const context = useContext(UserContext); // Accès au contexte

  // Si le contexte est appelé en dehors du Provider, on lève une erreur explicite
  if (!context) throw new Error("useUser doit être utilisé dans UserProvider");

  return context; // ✅ Sinon on renvoie le contexte utilisateur
};

/* ==========================================================================
   🌍 Composant `UserProvider` : fournisseur global du contexte
   - Ce composant doit envelopper l’ensemble de ton application dans `main.tsx` ou `App.tsx`
   - Il rend les données utilisateur accessibles à toute la hiérarchie de composants
========================================================================== */
export function UserProvider({ children }: { children: ReactNode }) {
  // 📦 Initialisation du state utilisateur
  // - L'utilisateur n'est pas connecté par défaut (isAuthenticated: false)
  // - Pas admin (isAdmin: false), nom vide
  const [user, setUser] = useState<Utilisateur>({
    isAuthenticated: false,
    isAdmin: false,
    nom: "",
  });

  return (
    // Fourniture des données utilisateur et du setter à tous les composants enfants
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
