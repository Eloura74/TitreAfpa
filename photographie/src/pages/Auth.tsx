// ==========================================================================
// 📦 IMPORTS ESSENTIELS
// ==========================================================================
import React, { useState } from "react"; // Import de React + hook useState pour gérer les états locaux
import Navbar from "../components/layout/navbar"; // Composant d'en-tête de navigation
import Footer from "../components/layout/Footer"; // Composant de pied de page

// Fonctions API d'authentification
import { register, login } from "../services/authService";

// Store Zustand pour gérer l'état global d'authentification
import { useAuthStore } from "../store/authStore";

// Hook de navigation (React Router) pour rediriger après login
import { useNavigate } from "react-router-dom";

// ==========================================================================
// 📄 COMPOSANT PRINCIPAL : Formulaire d'inscription et de connexion
// ==========================================================================
const Auth: React.FC = () => {
  // ------------------------------------------------------------------------
  // 💡 ÉTATS LOCAUX
  // ------------------------------------------------------------------------
  const [isRegister, setIsRegister] = useState(false); // Mode actif : inscription ou connexion
  const [email, setEmail] = useState(""); // Saisie de l'email
  const [motdepasse, setMotdepasse] = useState(""); // Saisie du mot de passe
  const [message, setMessage] = useState(""); // Message de retour (succès / erreur)
  const [loading, setLoading] = useState(false); // Indique si une requête est en cours

  // ------------------------------------------------------------------------
  // 🌐 Zustand : récupération des setters depuis le store global
  // ------------------------------------------------------------------------
  const {
    setEmail: setEmailAuth,
    setIsAdmin: setIsAdminAuth,
    choix,
  } = useAuthStore();

  // Navigation programmatique (vers une autre page)
  const navigate = useNavigate();

  // ------------------------------------------------------------------------
  // 🧾 Fonction de soumission du formulaire
  // ------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true); // Active l'état de chargement
    setMessage(""); // Réinitialise le message de retour

    try {
      if (isRegister) {
        // 🟢 Mode inscription
        const res = await register(email, motdepasse); // Appel API
        if (res.error) setMessage(res.error); // Affiche l'erreur renvoyée
        else setMessage("Inscription réussie, vous pouvez vous connecter.");
      } else {
        // 🔵 Mode connexion
        const res = await login(email, motdepasse);
        console.log(res);
        if (res.error) setMessage(res.error); // Erreur côté API
        else {
          // 🔐 Stockage du token JWT dans le navigateur
          localStorage.setItem("token", res.token);

          // ✅ Mise à jour de l'état global (Zustand)
          setEmailAuth(email); // Enregistre l'email
          // Correction : accepte aussi le champ 'role' (string) du backend
          const isAdmin =
            res.isAdmin !== undefined ? !!res.isAdmin : res.role === "admin";
          console.log(isAdmin);
          setIsAdminAuth(isAdmin); // Enregistre si admin ou non (conversion sécurisée)

          setMessage("Connexion réussie !");

          // 🔄 Redirection automatique selon le choix utilisateur
          setTimeout(() => {
            if (choix === "photo-graphiste") {
              navigate("/graphisme");
            } else {
              navigate("/photographie");
            }
          }, 800); // Délai léger pour laisser le message s'afficher
        }
      }
    } catch {
      setMessage("Erreur serveur, réessayez."); // Cas d’erreur inattendue (réseau ou serveur)
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  // ------------------------------------------------------------------------
  // 🎨 AFFICHAGE JSX : formulaire + navbar + footer
  // ------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      {/* Barre de navigation en haut */}
      <Navbar />

      {/* Section principale centrée verticalement */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* FORMULAIRE D'AUTHENTIFICATION */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#181824] p-8 rounded shadow-lg flex flex-col gap-4 w-full max-w-md"
        >
          {/* Titre du formulaire (dynamique selon le mode) */}
          <h2 className="text-2xl font-bold text-[#ffe992] text-center mb-2">
            {isRegister ? "Inscription" : "Connexion"}
          </h2>

          {/* Champ de saisie : email */}
          <input
            id="auth-email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered"
            required
            autoComplete="email"
          />

          {/* Champ de saisie : mot de passe */}
          <input
            id="auth-password"
            name="motdepasse"
            type="password"
            placeholder="Mot de passe"
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            className="input input-bordered"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
          />

          {/* Bouton principal (connexion ou inscription) */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Chargement..."
              : isRegister
              ? "S'inscrire"
              : "Se connecter"}
          </button>

          {/* Bouton secondaire pour changer de mode (inscription <-> connexion) */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Déjà inscrit ? Se connecter"
              : "Pas encore de compte ? S'inscrire"}
          </button>

          {/* Affichage du message (erreur ou succès) */}
          {message && (
            <div className="text-center text-red-400 mt-2">{message}</div>
          )}
        </form>
      </div>

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

// --------------------------------------------------------------------------
// Export du composant
// --------------------------------------------------------------------------
export default Auth;
