// Import de base
import { useState } from "react";
import { Link } from "react-router-dom";
// Import des styles
import "../../styles/navbar.css";

// Navbar component
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // Navbar collée en haut, fond semi-transparent, légère blur pour un effet moderne
    <nav className=" backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Branding */}
        <Link to="/" className="text-3xl font-bold gradient-brand">
          Photographe Pro
        </Link>

        {/* Burger menu pour mobile */}
        <button
          className="md:hidden focus:outline-none text-2xl text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>

        {/* Menu principal */}
        <ul
          className={`
            md:flex gap-6 text-lg font-medium 
            transition-all duration-300 
            ${isMenuOpen ? "block" : "hidden"}
          `}
        >
          <li>
            <Link to="/" className="nav-link">
              Accueil
            </Link>
          </li>
          <li>
            <Link to="/galerie" className="nav-link">
              Galerie
            </Link>
          </li>
          <li>
            <Link to="/evenements" className="nav-link">
              Événements
            </Link>
          </li>
          <li>
            <Link to="/about" className="nav-link">
              Contact
            </Link>
          </li>
          <li>
            <Link to="/pannier" className="nav-link">
              Panier
            </Link>
          </li>
          <li>
            <Link to="/inscription" className="nav-link">
              Inscription/Connexion
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
