// Import des styles
import "../../styles/footer.css";

// Footer component
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-accent"></div>
      <div className="footer-content">
        &copy; {new Date().getFullYear()} | <span className="footer-logo">Photographe Pro</span> - Tous droits réservés.
      </div>
    </footer>
  );
}
