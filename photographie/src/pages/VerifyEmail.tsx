import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { API_URL } from "../config/api";
import { useUser } from "../context/UserContext";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { setEmail: setEmailAuth, setIsAdmin: setIsAdminAuth } = useAuthStore();

  const token = searchParams.get("token");
  const processedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Validation de votre compte...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide.");
      return;
    }

    if (processedRef.current) return;
    processedRef.current = true;

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Compte validé ! Redirection...");

          // Mise à jour du contexte utilisateur (Auto-login)
          if (data.user) {
            setUser({
              isAuthenticated: true,
              isAdmin: data.user.role === "admin",
              nom: data.user.nom,
              prenom: data.user.prenom,
              telephone: data.user.telephone,
              adresse: data.user.adresse,
            });
            setEmailAuth(data.user.email);
            setIsAdminAuth(data.user.role === "admin");
          }

          // Redirection immédiate vers l'accueil
          setTimeout(() => navigate("/"), 1500);
        } else {
          setStatus("error");
          setMessage(data.error || "Lien expiré.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Erreur de connexion.");
      }
    };

    verify();
  }, [token, navigate, setUser, setEmailAuth, setIsAdminAuth]);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a1a20] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <Loader2 size={48} className="text-[#ffe992] animate-spin" />
            )}
            {status === "success" && (
              <Loader2 size={48} className="text-green-500 animate-spin" />
            )}
            {status === "error" && (
              <div className="text-yellow-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-serif font-bold mb-4">
            {status === "loading" && "Validation..."}
            {status === "success" && "Succès !"}
            {status === "error" && "Lien expiré"}
          </h1>

          <p className="text-gray-400 mb-8">{message}</p>

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Il est possible que votre compte soit déjà vérifié. Essayez de
                vous connecter.
              </p>
              <button
                onClick={() => navigate("/connexion")}
                className="w-full bg-[#ffe992] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-[#d6c487] transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-white/10 text-white font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
