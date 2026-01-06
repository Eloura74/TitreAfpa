// === Importations de base React et React Router ===
import { useState } from "react"; // Pour gérer l'ouverture/fermeture du menu
import { Link, useLocation, useNavigate } from "react-router-dom"; // Pour naviguer entre les pages sans recharger
import { useAuthStore, useAuthSync } from "../../store/authStore"; // Store Zustand pour gérer l'authentification
import "../../styles/navbar.css"; // Fichier CSS spécifique à la Navbar

// === Composant principal de la barre de navigation ===
export default function Navbar({ variant }: { variant?: "client" }) {
  useAuthSync(); // Synchronisation automatique entre Zustand et le localStorage à chaque rendu

  const location = useLocation(); // Donne accès à l'URL actuelle

  // Détecte si on se trouve dans l'univers "graphisme"
  // On détecte l'univers courant depuis le localStorage (persistant entre les pages)
  const univers =
    localStorage.getItem("univers") ||
    (location.pathname.startsWith("/graphisme") ? "graphisme" : "photographie");
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
          <Link to="/" className="navbar-brand">
            Photographe Pro
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
        <Link to="/" className="navbar-brand">
          Photographe Pro
        </Link>

        {/* === Bouton pour ouvrir/fermer le menu mobile === */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Inverse l'état au clic
          aria-label="Menu de navigation"
        >
          ☰
        </button>

        {/* === Sélecteur d'univers (photographie/graphisme) === */}
        <div className="flex items-center gap-3 mr-4">
          <select
            className="bg-[#232336] border border-[#ffe992]/30 rounded px-2 py-1 text-white"
            value={univers}
            onChange={(e) =>
              handleUniversChange(
                e.target.value as "photographie" | "graphisme"
              )
            }
            aria-label="Changer d'univers"
          >
            <option value="photographie">Photographie</option>
            <option value="graphisme">Graphisme</option>
          </select>
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
