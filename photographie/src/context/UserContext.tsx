// ==========================================================================
// 📦 Import des éléments React nécessaires à la création d’un contexte
// ==========================================================================
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "../config/api";

/* ==========================================================================
   🧩 Interface `Utilisateur` : structure des données utilisateur dans l'application
   - Permet de typer le state utilisateur avec des propriétés claires
========================================================================== */
import { Utilisateur } from "../types/utilisateur";

/* ==========================================================================
   🧠 Interface `UserContextType` : structure des données partagées dans le contexte
   - Comprend l'utilisateur courant ET une fonction pour le modifier
========================================================================== */
interface UserContextType {
  user: Utilisateur; // ✅ Données utilisateur actuelles
  setUser: React.Dispatch<React.SetStateAction<Utilisateur>>; // 🔁 Fonction permettant de modifier l'utilisateur
  isLoading: boolean; // ⏳ État de chargement de la session
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

  // État de chargement pour éviter les redirections prématurées
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Restauration de la session au chargement
  useEffect(() => {
    // Vérification de la session via le cookie HttpOnly
    fetch(`${API_URL}/api/auth/me`, {
      credentials: "include", // Envoie le cookie automatiquement
    })
        .then((res) => {
          if (res.ok) return res.json();
          // Session invalide ou expirée
          throw new Error("Token invalide");
        })
        .then((data) => {
          // Session restaurée avec succès
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
          // Si erreur (session expirée), on nettoie l'état
          setUser({
            isAuthenticated: false,
            isAdmin: false,
            nom: "",
            prenom: "",
            telephone: "",
            adresse: undefined,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
  }, []);

  return (
    // Fourniture des données utilisateur et du setter à tous les composants enfants
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
