// === Importations de base React et React Router ===
import { useState } from "react"; // Pour gérer l'ouverture/fermeture du menu
import { Link, useLocation, useNavigate } from "react-router-dom"; // Pour naviguer entre les pages sans recharger
import { useAuthStore, useAuthSync } from "../../store/authStore"; // Store Zustand pour gérer l'authentification

import { Camera, Palette } from "lucide-react";
import "../../styles/navbar.css"; // Fichier CSS spécifique à la Navbar

// === Composant principal de la barre de navigation ===
export default function Navbar({ variant }: { variant?: "client" }) {
  useAuthSync(); // Synchronisation automatique entre Zustand et le localStorage à chaque rendu

  const location = useLocation(); // Donne accès à l'URL actuelle

  // Détection de l'univers basée sur la page actuelle
  // Si on est sur /graphisme ou /galerie-graphique → univers graphisme
  // Sinon (/, /photographie, etc.) → univers photographie
  const isGraphismePage = 
    location.pathname === "/graphisme" || 
    location.pathname === "/galerie-graphique" ||
    location.pathname.startsWith("/graphisme");
  
  const univers = isGraphismePage ? "graphisme" : "photographie";
  const isGraphisme = univers === "graphisme";

  const navigate = useNavigate();

  // Fonction pour changer d'univers dynamiquement
  const handleUniversChange = (nouvelUnivers: "photographie" | "graphisme") => {
    localStorage.setItem("univers", nouvelUnivers);
    // Redirige vers la page d'accueil de l'univers choisi sans déconnexion
    if (nouvelUnivers === "graphisme") {
      navigate("/graphisme");
    } else {
      navigate("/photographie");
    }
  };

  // État local pour contrôler l'ouverture du menu sur mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Récupération des infos de connexion via Zustand
  const { email, isAdmin, logout } = useAuthStore();

  // Si variant="client", on affiche une navbar simplifiée
  if (variant === "client") {
    return (
      <nav className="navbar-container">
        <div className="navbar-content justify-between">
          <Link to="/" className="navbar-brand flex items-center">
            <img
              src="/images/logoHome.png"
              alt="Fabien Licata"
              className="h-12 md:h-42 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            {email && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-400">{email}</span>
                <button
                  onClick={logout}
                  className="text-xs px-2 py-1 bg-red-600/20 text-red-500 rounded hover:bg-red-600 hover:text-white transition"
                >
                  Déconnexion
                </button>
              </div>
            )}
            <Link to="/panier" className="nav-link">
              Panier
            </Link>
          </div>
        </div>
        <div className="navbar-accent"></div>
      </nav>
    );
  }

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* === Logo / Nom du site à gauche === */}
        <Link to="/" className="navbar-brand flex items-center">
          <img
            src="/images/logoHome.png"
            alt="Fabien Licata"
            className="h-10 md:h-20 w-auto object-contain"
          />
        </Link>

        {/* === Bouton pour ouvrir/fermer le menu mobile === */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Inverse l'état au clic
          aria-label="Menu de navigation"
        >
          ☰
        </button>

        {/* === Bouton Switch Univers (Toggle) === */}
        <div className="relative mr-2 hidden md:block">
          <button
            onClick={() =>
              handleUniversChange(
                univers === "photographie" ? "graphisme" : "photographie"
              )
            }
            className="flex items-center gap-2 px-3 py-1.5 text-[16px] uppercase tracking-[0.12em] text-gray-500/70 hover:text-[#ffe992]/90 transition-all duration-300 group"
          >
            {univers === "photographie" ? (
              <>
                <Palette
                  // # TODO: Ajouter l'icône graphisme
                  size={16} 
                  className="text-gray-600/60 group-hover:text-[#ffe992] transition-colors duration-300"
                />
                <span className="font-normal group-hover:tracking-[0.15em] transition-all duration-300">
                  Graphisme
                </span>
              </>
            ) : (
              <>
                <Camera
                  size={16}
                  className="text-gray-600/60 group-hover:text-[#ffe992] transition-colors duration-300"
                />
                <span className="font-normal group-hover:tracking-[0.15em] transition-all duration-300">
                  Photographie
                </span>
              </>
            )}
          </button>
        </div>

        {/* Version Mobile du sélecteur (visible uniquement sur mobile) */}
        <div className="md:hidden mr-4">
          <button
            onClick={() =>
              handleUniversChange(
                univers === "photographie" ? "graphisme" : "photographie"
              )
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#d6c487] hover:text-[#ffe992] hover:bg-white/10 transition-all duration-300"
          >
            {univers === "photographie" ? (
              <Palette size={20} />
            ) : (
              <Camera size={20} />
            )}
          </button>
        </div>
        {/* === Menu de navigation (visible ou non selon isMenuOpen) === */}
        <ul className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
          {/* Lien vers l'accueil */}
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Accueil
            </Link>
          </li>

          {/* Lien conditionnel : Galerie ou Galerie Graphique selon l'univers courant */}
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

          {/* Lien vers la page Services */}
          <li className="nav-item">
            <Link to="/services" className="nav-link">
              Services
            </Link>
          </li>

          {/* Liens vers autres pages communes */}
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

          {/* === Bloc affiché si l’utilisateur n’est pas connecté === */}
          {!email && (
            <li className="nav-item">
              <Link to="/connexion" className="nav-link">
                Inscription/Connexion
              </Link>
            </li>
          )}

          {/* === Bloc affiché si l’utilisateur est connecté === */}
          {email && (
            <li className="nav-item">
              <div className="flex items-center gap-2">
                {/* Affiche l'email de l'utilisateur connecté avec lien vers Mon Compte */}
                <Link
                  to="/mon-compte"
                  className="nav-link font-semibold text-yellow-400 hover:text-yellow-300 transition"
                >
                  {email}
                </Link>
                {/* Bouton pour se déconnecter */}
                <button
                  onClick={logout}
                  className="nav-link text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  aria-label="Se déconnecter"
                >
                  Déconnexion
                </button>
              </div>
            </li>
          )}

          {/* === Lien d’administration visible uniquement si l’utilisateur est admin === */}
          {isAdmin && (
            <li className="nav-item">
              <Link to="/admin/gestion-galerie" className="nav-link">
                Gestion Galerie
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* === Élément visuel décoratif en bas de la navbar === */}
      <div className="navbar-accent"></div>
    </nav>
  );
}
