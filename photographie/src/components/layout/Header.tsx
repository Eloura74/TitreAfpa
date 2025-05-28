import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Header dynamique : affiche l'email si connecté, sinon les liens classiques.
 * Utilise Zustand pour l'état global d'authentification.
 */
const Header: React.FC = () => {
  const { email, logout } = useAuthStore();

  return (
    <header className="flex justify-between items-center p-4 border-b border-yellow-900 bg-[#0a0a10]">
      <span className="font-bold text-yellow-400 text-lg">Photographe Pro</span>
      <nav className="flex gap-6 items-center">
        <Link to="/" className="hover:text-yellow-400">
          Accueil
        </Link>
        <Link to="/galerie" className="hover:text-yellow-400">
          Galerie
        </Link>
        <Link to="/evenements" className="hover:text-yellow-400">
          Événements
        </Link>
        <Link to="/a-propos" className="hover:text-yellow-400">
          À propos
        </Link>
        <Link to="/panier" className="hover:text-yellow-400">
          Panier
        </Link>
        {/* Affichage conditionnel selon l'état de connexion */}
        {email ? (
          <div className="flex items-center gap-4">
            <span className="text-yellow-400">{email}</span>
            <button
              onClick={logout}
              className="ml-2 px-3 py-1 rounded bg-yellow-900 text-yellow-400 hover:bg-yellow-700 transition"
              aria-label="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <>
            <Link to="/inscription" className="hover:text-yellow-400">
              Inscription
            </Link>
            <Link to="/connexion" className="hover:text-yellow-400">
              Connexion
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
