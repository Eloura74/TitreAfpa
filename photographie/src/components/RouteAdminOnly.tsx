// Import de types et fonctions React
import { ReactNode } from "react";

// Redirection automatique si la route est interdite
import { Navigate } from "react-router-dom";

// Contexte utilisateur personnalisé
import { useUser } from "../context/UserContext";

/* -------------------------------------------------------------------------
   🧩 Props attendues :
   - children : composant(s) enfants à afficher si l'accès est autorisé
------------------------------------------------------------------------- */
interface Props {
  children: ReactNode;
}

/* -------------------------------------------------------------------------
   🔒 Composant de protection d'accès réservé aux administrateurs
------------------------------------------------------------------------- */
export default function RouteAdminOnly({ children }: Props) {
  const { user } = useUser(); // Récupère les infos du contexte utilisateur

  // 🔐 Si l'utilisateur n'est pas authentifié ou pas admin → redirection
  if (!user.isAuthenticated || !user.isAdmin) {
    return <Navigate to="/inscription" replace />;
  }

  // ✅ Accès autorisé → on affiche les enfants (la page protégée)
  return <>{children}</>;
}
