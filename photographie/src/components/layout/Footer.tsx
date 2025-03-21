// Import de base
import { useState } from "react";
import { Link } from "react-router-dom";

// Import des styles
import "../../styles/footer.css";

// Footer component
export default function Footer() {
  return (
    <footer className="footer py-4">
      &copy; {new Date().getFullYear()} | Photographe Pro - Tous droits
      réservés.
    </footer>
  );
}
