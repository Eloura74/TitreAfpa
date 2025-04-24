// Importations des modules nécessaires
// React : framework React
// useState : hook React pour la gestion de l'état
// Navbar : composant de navigation
// Footer : composant de footer
// register, login : services d'authentification
import React, { useState } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { register, login } from "../services/authService";

// Fonction principale du composant Auth
const Auth: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false); // État pour le mode d'inscription ou de connexion
  const [email, setEmail] = useState(""); // État pour l'email
  const [motdepasse, setMotdepasse] = useState(""); // État pour le mot de passe
  const [message, setMessage] = useState(""); // État pour afficher les messages
  const [loading, setLoading] = useState(false); // État pour le chargement

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true); // Démarre le chargement
    setMessage(""); // Réinitialise le message
    try {
      if (isRegister) {
        // Si on est en mode inscription
        const res = await register(email, motdepasse); // Appel de l'API d'inscription
        if (res.error) setMessage(res.error); // Gestion des erreurs
        else setMessage("Inscription réussie, vous pouvez vous connecter."); // Message de succès
      } else {
        // Sinon, on est en mode connexion
        const res = await login(email, motdepasse); // Appel de l'API de connexion
        if (res.error) setMessage(res.error); // Gestion des erreurs
        else {
          localStorage.setItem("token", res.token); // Stockage du token
          localStorage.setItem("role", res.role); // Stockage du rôle
          setMessage("Connexion réussie !"); // Message de succès
        }
      }
    } catch {
      setMessage("Erreur serveur, réessayez."); // Gestion des erreurs
    } finally {
      setLoading(false); // Arrête le chargement
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-[#181824] p-8 rounded shadow-lg flex flex-col gap-4 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-[#ffe992] text-center mb-2">
            {isRegister ? "Inscription" : "Connexion"}
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-[#232336] border border-[#d6c487] text-white focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motdepasse}
            onChange={(e) => setMotdepasse(e.target.value)}
            className="p-2 rounded bg-[#232336] border border-[#d6c487] text-white focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
          >
            {loading
              ? "Chargement..."
              : isRegister
              ? "S'inscrire"
              : "Se connecter"}
          </button>
          <button
            type="button"
            className="text-xs underline text-[#ffe992]"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Déjà inscrit ? Se connecter" : "Créer un compte"}
          </button>
          {message && (
            <div className="text-center text-red-400 mt-2">{message}</div>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
