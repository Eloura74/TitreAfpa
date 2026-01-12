// ==========================================================================
// 📦 Import des types et fonctions nécessaires depuis React
// ==========================================================================
import { ReactNode } from "react"; // Type utilisé pour typer les composants enfants

// 🔁 Import de `Navigate` pour faire des redirections conditionnelles
import { Navigate } from "react-router-dom";

// 📦 Import du hook personnalisé pour accéder aux données utilisateur (authentification, rôle)
import { useUser } from "../context/UserContext";

/* ==========================================================================
   🧩 Interface des props :
   - `children` représente le ou les composants enfants à afficher si l'accès est autorisé.
   - Il peut s’agir d’un composant JSX ou de plusieurs enfants imbriqués.
========================================================================== */
interface Props {
  children: ReactNode; // Type natif React pour représenter un ou plusieurs éléments JSX
}

/* ==========================================================================
   🔐 Composant `RouteAdminOnly` :
   - Sert à restreindre l'accès à une route uniquement aux utilisateurs administrateurs.
   - Utilisé comme wrapper autour des pages ou composants sensibles.
========================================================================== */
export default function RouteAdminOnly({ children }: Props) {
  // 📥 Récupération de l'état utilisateur depuis le contexte global
  const { user, isLoading } = useUser(); // `user` contient des infos comme : isAuthenticated, isAdmin, email, etc.

  // ⏳ Si la session est en cours de chargement, on affiche un loader ou rien
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a10]">
        <span className="loading loading-spinner loading-lg text-yellow-500"></span>
      </div>
    );
  }

  /* -------------------------------------------------------------------------
     🚫 Vérification des autorisations :
     - Si l'utilisateur n'est pas connecté OU n'est pas admin
     - Alors on le redirige vers la page d’inscription
     - `replace` remplace l’entrée actuelle dans l’historique pour éviter de revenir sur une page interdite
  ------------------------------------------------------------------------- */
  if (!user.isAuthenticated || !user.isAdmin) {
    return <Navigate to="/inscription" replace />;
  }

  /* -------------------------------------------------------------------------
     ✅ L'utilisateur est connecté ET a les droits admin :
     - On autorise l’accès en affichant les enfants (page protégée)
     - Les enfants sont rendus tels quels dans le DOM
  ------------------------------------------------------------------------- */
  return <>{children}</>;
}
