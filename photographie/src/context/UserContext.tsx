// ==========================================================================
// 📦 Import des éléments React nécessaires à la création d’un contexte
// ==========================================================================
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "../config/api";

/* ==========================================================================
   🧩 Interface `Utilisateur` : structure des données utilisateur dans l'application
   - Permet de typer le state utilisateur avec des propriétés claires
========================================================================== */
export interface Utilisateur {
  isAuthenticated: boolean; // ✔️ Indique si l'utilisateur est connecté (authentifié)
  isAdmin: boolean; // 👑 Indique si l'utilisateur possède les droits administrateur
  nom: string; // 🧑 Nom de famille
  prenom?: string; // Prénom
  email?: string; // 📧 Email de l'utilisateur
  telephone?: string; // Téléphone
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
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
  const [user, setUser] = useState<Utilisateur>({
    isAuthenticated: false,
    isAdmin: false,
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: undefined,
  });

  // 🔄 Restauration de la session au chargement
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // On pourrait utiliser axios ici, mais fetch est natif et léger pour ce besoin
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Token invalide");
        })
        .then((data) => {
          // data.user contient les infos de l'utilisateur
          setUser({
            isAuthenticated: true,
            isAdmin: data.user.role === "admin",
            nom: data.user.nom || "",
            prenom: data.user.prenom || "",
            email: data.user.email || "",
            telephone: data.user.telephone || "",
            adresse: data.user.adresse,
          });
        })
        .catch(() => {
          // Si erreur (token expiré par exemple), on nettoie
          localStorage.removeItem("token");
          setUser({
            isAuthenticated: false,
            isAdmin: false,
            nom: "",
            prenom: "",
            telephone: "",
            adresse: undefined,
          });
        });
    }
  }, []);

  return (
    // Fourniture des données utilisateur et du setter à tous les composants enfants
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
