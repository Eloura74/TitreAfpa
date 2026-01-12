// === Importation des styles CSS spécifiques au footer ===
// Cela permet d’appliquer les classes définies dans "footer.css" à ce composant
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
        {/* 
          Affiche le symbole © suivi de l’année actuelle (calculée dynamiquement),
          puis le nom du site ou de la marque (ici “Photographe Pro”) et une mention légale.
        */}
        &copy; {new Date().getFullYear()} | <span className="footer-logo">Photographe Pro</span> - Tous droits réservés.
      </div>

    </footer>
  );
}
