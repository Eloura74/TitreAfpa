import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { register, login } from "../services/authService";

const Auth: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (isRegister) {
        const res = await register(email, motdepasse);
        if (res.error) setMessage(res.error);
        else setMessage("Inscription réussie, vous pouvez vous connecter.");
      } else {
        const res = await login(email, motdepasse);
        if (res.error) setMessage(res.error);
        else {
          localStorage.setItem("token", res.token);
          localStorage.setItem("role", res.role);
          setMessage("Connexion réussie !");
        }
      }
    } catch {
      setMessage("Erreur serveur, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-[#181824] p-8 rounded shadow-lg flex flex-col gap-4 w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#ffe992] text-center mb-2">
            {isRegister ? "Inscription" : "Connexion"}
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-2 rounded bg-[#232336] border border-[#d6c487] text-white focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motdepasse}
            onChange={e => setMotdepasse(e.target.value)}
            className="p-2 rounded bg-[#232336] border border-[#d6c487] text-white focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="cart-button bg-transparent border border-[#d6c487] text-[#ffe992] px-4 py-2 rounded-sm transition-all duration-300 hover:bg-[#d6c487] hover:text-black"
          >
            {loading ? "Chargement..." : isRegister ? "S'inscrire" : "Se connecter"}
          </button>
          <button
            type="button"
            className="text-xs underline text-[#ffe992]"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Déjà inscrit ? Se connecter" : "Créer un compte"}
          </button>
          {message && <div className="text-center text-red-400 mt-2">{message}</div>}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
