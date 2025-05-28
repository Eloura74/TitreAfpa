// Import de base
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from '../../context/UserContext';
// Import des styles
import "../../styles/navbar.css";

// Navbar component
export default function Navbar() {
  const location = useLocation();
  // On détecte si on est dans l'univers graphisme ou sur la galerie graphique unique
  const isGraphisme = location.pathname.startsWith("/graphisme") || location.pathname === "/galerie-graphique";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo et nom du site */}
        <Link to="/" className="navbar-brand">
          Photographe Pro
        </Link>

        {/* Bouton menu mobile */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu de navigation"
        >
          ☰
        </button>

        {/* Menu de navigation */}
        <ul className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Accueil
            </Link>
          </li>
          {/* Lien galerie dynamique selon l'univers */}
          <li className="nav-item">
            {isGraphisme ? (
              <Link to="/galerie-graphique" className="nav-link">
                Galerie graphique
              </Link>
            ) : (
              <Link to="/galerie" className="nav-link">
                Galerie
              </Link>
            )}
          </li>
          <li className="nav-item">
            <Link to="/evenements" className="nav-link">
              Événements
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              A Propos
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/panier" className="nav-link">
              Panier
            </Link>
          </li>
          <li className="nav-item">
            {/* Correction : redirige vers /connexion pour éviter l'erreur 404, la page Auth gère les deux modes */}
<Link to="/connexion" className="nav-link">
  Inscription/Connexion
</Link>
          </li>
          {user.isAuthenticated && user.isAdmin && (
            <li className="nav-item">
              <Link to="/admin/gestion-galerie" className="nav-link">
                Gestion Galerie
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Élément décoratif */}
      <div className="navbar-accent"></div>
    </nav>
  );
}
