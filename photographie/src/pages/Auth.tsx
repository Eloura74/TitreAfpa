// ==========================================================================
// 📦 IMPORTS ESSENTIELS
// ==========================================================================
import React, { useState } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { useUser } from "../context/UserContext";
import { register, login } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

// ==========================================================================
// 📄 COMPOSANT PRINCIPAL : Formulaire d'inscription et de connexion
// ==========================================================================
const Auth: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const { setEmail: setEmailAuth, setIsAdmin: setIsAdminAuth } = useAuthStore();

  // ------------------------------------------------------------------------
  // 💡 ÉTATS LOCAUX
  // ------------------------------------------------------------------------
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Champs du formulaire
  const [formData, setFormData] = useState({
    email: "",
    motdepasse: "",
    nom: "",
    prenom: "",
    telephone: "",
    rue: "",
    ville: "",
    codePostal: "",
    pays: "France",
  });

  // Gestion des changements dans les inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ------------------------------------------------------------------------
  // 🧾 Fonction de soumission du formulaire
  // ------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isRegister) {
        // 🟢 Mode inscription
        if (formData.motdepasse.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          setLoading(false);
          return;
        }

        const adresse = {
          rue: formData.rue,
          ville: formData.ville,
          codePostal: formData.codePostal,
          pays: formData.pays,
        };

        const res = await register(
          formData.email,
          formData.motdepasse,
          formData.nom,
          formData.prenom,
          formData.telephone,
          adresse
        );

        if (res.error) {
          setError(res.error);
        } else {
          // Succès de l'inscription
          setMessage(
            res.message ||
              "Inscription réussie ! Veuillez vérifier votre email."
          );
          setIsRegister(false); // Revenir au mode connexion pour afficher le message
          // Optionnel : Rediriger vers l'accueil après un délai
          // setTimeout(() => navigate("/"), 3000);
        }
      } else {
        // 🔵 Mode connexion
        const res = await login(formData.email, formData.motdepasse);
        if (res.error) {
          setError(res.error);
        } else {
          handleLoginSuccess(res);
        }
      }
    } catch {
      setError("Erreur serveur, veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  interface LoginResponse {
    token?: string; // Token is now optional (HttpOnly cookie)
    role?: string;
    isAdmin?: boolean;
    nom?: string;
    prenom?: string;
    telephone?: string;
    adresse?: {
      rue: string;
      ville: string;
      codePostal: string;
      pays: string;
    };
    email?: string;
    error?: string;
  }

  const handleLoginSuccess = (res: LoginResponse) => {
    // localStorage.setItem("token", res.token); // Suppression : Token géré par cookie HttpOnly

    setUser({
      isAuthenticated: true, // Si on est ici, c'est que le login a réussi
      isAdmin: res.role === "admin",
      nom: res.nom || "",
      prenom: res.prenom,
      telephone: res.telephone,
      adresse: res.adresse,
    });

    setEmailAuth(res.email || null);
    const isAdmin =
      res.isAdmin !== undefined ? !!res.isAdmin : res.role === "admin";
    setIsAdminAuth(isAdmin);

    setMessage("Connexion réussie !");

    if (res.role === "admin") {
      navigate("/admin/gestion-galerie");
    } else {
      // Redirection vers l'espace client privé
      setTimeout(() => {
        navigate("/mon-compte");
      }, 800);
    }
  };

  // Styles communs pour les inputs
  const inputClassName =
    "input w-full bg-black/40 border border-white/10 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 text-white placeholder-gray-500 transition-all duration-300 backdrop-blur-sm";
  const labelClassName =
    "label-text text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1 block";

  // ------------------------------------------------------------------------
  // 🎨 AFFICHAGE JSX
  // ------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col relative overflow-hidden">
      {/* Éléments de fond décoratifs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-4 mt-16 relative z-10">
        <div className="w-full max-w-2xl bg-[#12121a]/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/5">
          {/* En-tête avec dégradé doré */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm mb-2">
              {isRegister ? "Créer un compte" : "Connexion"}
            </h2>
            <p className="text-gray-400 text-sm">
              {isRegister
                ? "Rejoignez l'univers Fabien Photographie"
                : "Accédez à votre espace personnel"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Section Identifiants */}
            <div className="grid gap-5">
              <div className="form-control">
                <label className={labelClassName}>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName}
                  required
                />
              </div>
              <div className="form-control">
                <label className={labelClassName}>Mot de passe</label>
                <input
                  name="motdepasse"
                  type="password"
                  placeholder="••••••••"
                  value={formData.motdepasse}
                  onChange={handleChange}
                  className={inputClassName}
                  required
                />
                {isRegister && (
                  <span className="text-[10px] text-gray-500 mt-1 ml-1">
                    Minimum 6 caractères
                  </span>
                )}
              </div>
            </div>

            {/* Section Informations Personnelles (Animation fluide) */}
            <div
              className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
                isRegister
                  ? "grid-rows-[1fr] opacity-100 mt-2"
                  : "grid-rows-[0fr] opacity-0 mt-0"
              }`}
            >
              <div className="min-h-0">
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                    Informations
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="form-control">
                    <label className={labelClassName}>Nom</label>
                    <input
                      name="nom"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={inputClassName}
                      required={isRegister}
                    />
                  </div>
                  <div className="form-control">
                    <label className={labelClassName}>Prénom</label>
                    <input
                      name="prenom"
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={inputClassName}
                      required={isRegister}
                    />
                  </div>
                </div>

                <div className="form-control mb-5">
                  <label className={labelClassName}>Téléphone</label>
                  <input
                    name="telephone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={inputClassName}
                    required={isRegister}
                  />
                </div>

                <div className="form-control mb-5">
                  <label className={labelClassName}>Adresse</label>
                  <input
                    name="rue"
                    type="text"
                    placeholder="N° et nom de rue"
                    value={formData.rue}
                    onChange={handleChange}
                    className={inputClassName}
                    required={isRegister}
                  />
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div className="form-control col-span-1">
                    <label className={labelClassName}>Code Postal</label>
                    <input
                      name="codePostal"
                      type="text"
                      placeholder="75000"
                      value={formData.codePostal}
                      onChange={handleChange}
                      className={inputClassName}
                      required={isRegister}
                    />
                  </div>
                  <div className="form-control col-span-2">
                    <label className={labelClassName}>Ville</label>
                    <input
                      name="ville"
                      type="text"
                      placeholder="Paris"
                      value={formData.ville}
                      onChange={handleChange}
                      className={inputClassName}
                      required={isRegister}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 space-y-4">
              <button
                type="submit"
                className={`w-full py-3.5 px-6 rounded-lg font-bold text-black uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-500/20 ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:brightness-110"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Traitement...
                  </span>
                ) : isRegister ? (
                  "Confirmer l'inscription"
                ) : (
                  "Se connecter"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                    setMessage("");
                  }}
                  className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                >
                  {isRegister ? (
                    <span>
                      Déjà membre ?{" "}
                      <span className="text-yellow-400 font-semibold underline decoration-yellow-400/30 underline-offset-4">
                        Connectez-vous
                      </span>
                    </span>
                  ) : (
                    <span>
                      Nouveau client ?{" "}
                      <span className="text-yellow-400 font-semibold underline decoration-yellow-400/30 underline-offset-4">
                        Créer un compte
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* CSS Hack pour l'autofill */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #1a1a24 inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default Auth;
