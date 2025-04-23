// Import de base
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Import des styles
import "../../styles/navbar.css";

// Navbar component
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("role") === "admin");
  }, []);

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
          <li className="nav-item">
            <Link to="/galerie" className="nav-link">
              Galerie
            </Link>
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
            <Link to="/inscription" className="nav-link">
              Inscription/Connexion
            </Link>
          </li>
          {isAdmin && (
            <li className="nav-item">
              <Link to="/galerie-form" className="nav-link">
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
