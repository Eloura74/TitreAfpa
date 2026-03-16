// === Importation des styles CSS spécifiques au footer ===
// Cela permet d’appliquer les classes définies dans "footer.css" à ce composant
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import "../../styles/footer.css";

// === Composant Footer ===
// Ce composant affiche le pied de page (footer) de ton site
export default function Footer() {
  return (
    // Balise <footer> = élément HTML sémantique pour un pied de page
    <footer className="footer" role="contentinfo">
      {/* --- Élément de décoration (accent visuel) --- */}
      <div className="footer-accent"></div>

      {/* --- Contenu principal du footer --- */}
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-copyright">
            {/* 
              Affiche le symbole suivi de l’année actuelle (calculée dynamiquement),
              puis le nom du site ou de la marque (ici “Photographe Pro”) et une mention légale.
            */}
            &copy; {new Date().getFullYear()} |{" "}
            <span className="footer-logo">Photographe Pro</span> - Tous droits
            réservés.
          </div>

          <div className="footer-links">
            <Link to="/mentions-legales" className="footer-link">
              Mentions légales
            </Link>

            <a
              href="https://www.instagram.com/fabien.licata.photographiste/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>

            <a
              href="https://www.facebook.com/FabienLicata"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
