// === Importations de base React et React Router ===
import { useState } from "react"; // Pour gérer l'ouverture/fermeture du menu
import { Link, useLocation, useNavigate } from "react-router-dom"; // Pour naviguer entre les pages sans recharger
import { useAuthStore, useAuthSync } from "../../store/authStore"; // Store Zustand pour gérer l'authentification
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Camera, Palette } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        <div className="relative mr-4 hidden md:block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all duration-300 hover:border-[#ffe992]/30"
          >
            {univers === "photographie" ? (
              <Camera size={16} className="text-[#ffe992]" />
            ) : (
              <Palette size={16} className="text-[#ffe992]" />
            )}
            <span className="capitalize tracking-wide">
              {univers === "photographie" ? "Photographie" : "Graphisme"}
            </span>
            <ChevronDown
              size={14}
              className={`text-white/50 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a10]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50"
              >
                <div className="p-1">
                  {[
                    { id: "photographie", label: "Photographie", icon: Camera },
                    { id: "graphisme", label: "Graphisme", icon: Palette },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        handleUniversChange(
                          option.id as "photographie" | "graphisme"
                        );
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between rounded-lg transition-all duration-200 ${
                        univers === option.id
                          ? "bg-white/10 text-[#ffe992]"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <option.icon size={16} />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      {univers === option.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Version Mobile du sélecteur (visible uniquement sur mobile) */}
        <div className="md:hidden mr-4">
          <button
            onClick={() =>
              handleUniversChange(
                univers === "photographie" ? "graphisme" : "photographie"
              )
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#ffe992]"
          >
            {univers === "photographie" ? (
              <Camera size={20} />
            ) : (
              <Palette size={20} />
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
