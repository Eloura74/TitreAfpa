import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../config/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Lock,
  LogOut,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PhotoOriginale } from "../types/evenement";

import Navbar from "../components/layout/navbar"; // Composant cohérence UI
import Footer from "../components/layout/Footer"; // Composant cohérence UI

interface AccesInfo {
  id: string;
  titre: string;
  description: string;
  client: {
    nom: string;
    prenom: string;
    email: string;
  };
  dateDebut: string;
  dateFin: string;
  image?: string;
  photos: any[];
  photosOriginales: PhotoOriginale[];
  typeValidite: "permanent" | "temporaire";
  dateExpiration?: string;
  typeLimiteTelechargement: "illimite" | "par_photo" | "total";
  maxTelechargementParPhoto?: number;
  maxTelechargementTotal?: number;
  nbTelechargementTotal: number;
}

export default function EcrinPrive() {
  const { codeAcces: codeAccesFromUrl } = useParams<{ codeAcces: string }>();
  const navigate = useNavigate();

  const [codeAcces, setCodeAcces] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [accesInfo, setAccesInfo] = useState<AccesInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null,
  );

  // Infos publiques récupérées via le slug d'URL
  const [publicInfo, setPublicInfo] = useState<{
    titre: string;
    image?: string;
  } | null>(null);

  // --- Nouveaux états Lightbox ---
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    checkSession();
  }, []);

  // Chargement des informations publiques si un slug est dans l'URL
  useEffect(() => {
    if (codeAccesFromUrl && !isConnected && !loading) {
      axios
        .get(`${API_URL}/api/ecrin/info/${codeAccesFromUrl}`)
        .then((res) => {
          if (res.data.success) setPublicInfo(res.data.acces);
        })
        .catch(() => console.error("Info publique non trouvée"));
    }
  }, [codeAccesFromUrl, isConnected]);

  const checkSession = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ecrin/session`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setIsConnected(true);
        setAccesInfo(res.data.acces);
        // Synchroniser l'URL avec le slug actuel si nécessaire
      }
    } catch {
      setIsConnected(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = codeAccesFromUrl
        ? { codeAcces, slug: codeAccesFromUrl }
        : { codeAcces };
      const res = await axios.post(`${API_URL}/api/ecrin/login`, payload, {
        withCredentials: true,
      });

      if (res.data.success) {
        setIsConnected(true);
        setSuccess("Connexion réussie ! Chargement de vos photos...");
        await checkSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Code d'accès invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/ecrin/logout`,
        {},
        { withCredentials: true },
      );
      setIsConnected(false);
      setAccesInfo(null);
      setCodeAcces("");
      setSuccess("Déconnexion réussie");
      navigate("/ecrin-prive", { replace: true });
    } catch {
      setError("Erreur lors de la déconnexion");
    }
  };

  const handleDownload = async (photo: PhotoOriginale) => {
    setDownloadingPhotoId(photo._id || "");
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/ecrin/generate-download-url`,
        { photoId: photo._id },
        { withCredentials: true },
      );

      if (res.data.success) {
        // Déclencher le téléchargement via un anchor virtuel pour masquer le nouvel onglet si possible
        const link = document.createElement("a");
        link.href = res.data.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = photo.nom; // Tente de forcer le DL direct
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSuccess(`Le téléchargement de ${photo.nom} a démarré.`);
        await checkSession(); // Maj des limites et stats
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du téléchargement");
    } finally {
      setDownloadingPhotoId(null);
    }
  };

  // --- Gestion Lightbox ---
  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const nextPhoto = () => {
    if (!accesInfo?.photosOriginales) return;
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === accesInfo.photosOriginales.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevPhoto = () => {
    if (!accesInfo?.photosOriginales) return;
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? accesInfo.photosOriginales.length - 1 : prevIndex - 1,
    );
  };

  // Fermer la lightbox avec la touche Echappement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Bloquer le scroll du fond
    if (isLightboxOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- ECRAN DE CONNEXION ---
  if (!isConnected) {
    return (
      <div className="home-page min-h-screen flex flex-col bg-[#0a0a10]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 60 }}
            className="w-full max-w-lg"
          >
            {/* Boite Glassmorphism premium */}
            <div className="relative backdrop-blur-md bg-[#12121a]/60 border border-[#ffe992]/20 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {/* Effet d'aura dorée douce derrière le formulaire */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffe992]/10 to-transparent blur-2xl rounded-3xl -z-10" />

              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black/40 border border-[#ffe992]/30 rounded-full mb-6 shadow-[0_0_20px_rgba(255,233,146,0.15)]">
                  <Lock className="text-[#ffe992]" size={28} />
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair-sc uppercase tracking-[0.1em] text-[#ffe992] mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {publicInfo ? publicInfo.titre : "Écrin Privé"}
                </h1>
                <p className="text-gray-300 font-light tracking-wide text-sm leading-relaxed max-w-sm mx-auto">
                  {publicInfo
                    ? `Saisissez la clé confidentielle qui vous a été remise pour accéder à vos photographies HD.`
                    : `Accédez à votre galerie photographique sécurisée et téléchargez vos œuvres en haute définition.`}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-900/30 text-red-200 p-4 rounded-xl mb-6 border border-red-500/30 flex items-start gap-3 text-sm backdrop-blur-sm"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#ffe992]/70 uppercase tracking-widest mb-3">
                    Votre Clé Sécurisée
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={codeAcces}
                      onChange={(e) =>
                        setCodeAcces(e.target.value.toUpperCase().trim())
                      }
                      placeholder="Ex: MARIAGE-JULIE-123"
                      className="w-full bg-black/40 border border-[#ffe992]/20 rounded-xl px-5 py-4 text-white text-lg uppercase tracking-wider focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992]/50 outline-none transition-all placeholder-white/20 text-center"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative overflow-hidden group bg-[#ffe992] text-black font-semibold uppercase tracking-widest py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(255,233,146,0.2)] hover:shadow-[0_6px_25px_rgba(255,233,146,0.3)] hover:-translate-y-1"
                  >
                    {/* Effet brillance au survol sur le bouton */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Déverrouillage...
                        </>
                      ) : (
                        "Accéder à la Galerie"
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ECRAN GALERIE (CONNECTE) ---
  const currentPhoto = accesInfo?.photosOriginales?.[currentPhotoIndex];

  return (
    <div className="home-page min-h-screen flex flex-col bg-[#0a0a10]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto pt-24 pb-20 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* En-tête de la Galerie Privée */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12121a] to-[#1a1a24] border border-[#ffe992]/20 p-8 lg:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8 shadow-2xl"
        >
          {/* Décoration background header */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#ffe992]/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-[#ffe992]/10 border border-[#ffe992]/30 rounded-full text-[#ffe992] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} />
                Accès Confidentiel
              </span>
              {accesInfo?.typeValidite === "temporaire" &&
                accesInfo?.dateExpiration && (
                  <span className="px-3 py-1 bg-red-900/40 border border-red-500/30 rounded-full text-red-300 text-xs font-bold uppercase tracking-widest">
                    Expirera le {formatDate(accesInfo.dateExpiration)}
                  </span>
                )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-playfair-sc text-white capitalize drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-4">
              {accesInfo?.titre}
            </h1>

            <p className="text-gray-300 text-lg max-w-2xl font-light leading-relaxed mb-6">
              {accesInfo?.description}
            </p>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="text-[#ffe992]" size={18} />
                <span>
                  {accesInfo?.dateDebut && formatDate(accesInfo.dateDebut)}
                  {accesInfo?.dateFin &&
                    accesInfo.dateDebut !== accesInfo.dateFin &&
                    ` - ${formatDate(accesInfo.dateFin)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="text-[#ffe992]" size={18} />
                <span>
                  {accesInfo?.photosOriginales?.length || 0} originaux HD
                </span>
              </div>
              {accesInfo?.typeLimiteTelechargement !== "illimite" && (
                <div className="flex items-center gap-2 text-blue-300">
                  <Download size={18} />
                  <span>
                    {accesInfo?.typeLimiteTelechargement === "total"
                      ? `${accesInfo?.maxTelechargementTotal} downloads restants`
                      : `${accesInfo?.maxTelechargementParPhoto} downloads max / photo`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-red-500/50 rounded-xl text-white hover:text-red-400 transition-all shadow-lg"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm uppercase tracking-wider font-semibold">
                Quitter l'écrin
              </span>
            </button>
          </div>
        </motion.header>

        {/* Notifications (Success / Error) */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-green-900/40 text-green-300 p-4 rounded-xl border border-green-500/30 flex items-center justify-between gap-3 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} /> {success}
                </div>
                <button
                  onClick={() => setSuccess(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-red-900/40 text-red-300 p-4 rounded-xl border border-red-500/30 flex items-center justify-between gap-3 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grille Masonry Tailwind CSS Only */}
        {!accesInfo?.photosOriginales ||
        accesInfo.photosOriginales.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
            <ImageIcon
              className="mx-auto text-gray-500 mb-6"
              size={64}
              opacity={0.5}
            />
            <p className="text-xl text-gray-400 font-light mb-2">
              Le traitement de vos photos HD est en cours.
            </p>
            <p className="text-gray-500 text-sm">
              Elles apparaîtront ici très prochainement.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {accesInfo.photosOriginales.map((photo, index) => (
              <motion.div
                key={photo._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-lg"
              >
                {/* Image miniature avec effet de chargement/skeleton si pas d'image - mais R2/Cloudflare garantit normalement l'img */}
                <div
                  className="relative w-full overflow-hidden cursor-zoom-in group-hover:shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] transition-all"
                  onClick={() => openLightbox(index)}
                  title="Cliquez pour agrandir"
                >
                  <img
                    src={photo.miniature || photo.fichierR2} // Fallback si Cloudinary echoue
                    alt={photo.nom}
                    loading="lazy"
                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700 ease-in-out"
                    style={{ minHeight: "200px" }} // Evite un saut visuel
                    // Si Cloudinary échoue silencieusement
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder-image.png";
                    }}
                  />

                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <h3 className="text-white font-medium truncate mb-1 text-sm">
                      {photo.nom}
                    </h3>
                    <p className="text-xs text-[#ffe992] uppercase tracking-wider mb-4">
                      {photo.format} • {formatFileSize(photo.taille)}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Empeche d'ouvrir la lightbox si on click pour DL
                        handleDownload(photo);
                      }}
                      disabled={downloadingPhotoId === photo._id}
                      className="w-full relative overflow-hidden bg-white/10 hover:bg-[#ffe992] text-white hover:text-black border border-white/20 hover:border-transparent backdrop-blur-md transition-all duration-300 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm uppercase tracking-wide disabled:opacity-50"
                    >
                      {downloadingPhotoId === photo._id ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Obtenir l'Original
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* --- LIGHTBOX (PLEIN ECRAN) --- */}
      <AnimatePresence>
        {isLightboxOpen && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
          >
            {/* Bouton Fermer */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-[60] p-3 bg-white/10 hover:bg-white/20 hover:scale-110 text-white rounded-full backdrop-blur-md transition-all"
            >
              <X size={24} />
            </button>

            {/* Navigation Precedent */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 sm:left-10 z-[60] p-4 bg-black/50 hover:bg-[#ffe992] text-white hover:text-black rounded-full backdrop-blur-md transition-all border border-white/10 group"
            >
              <ChevronLeft
                size={32}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>

            {/* Conteneur Image Centrale */}
            <div className="relative w-full max-w-6xl h-full max-h-[85vh] flex flex-col items-center justify-center">
              <motion.img
                key={currentPhoto._id || currentPhotoIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                src={currentPhoto.miniature || currentPhoto.fichierR2} // La miniature Cloudinary est souvent de grande taille (~800px) ce qui suffit pour du prev
                alt={currentPhoto.nom}
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              />

              {/* Informations et bouton DL fixés en bas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 sm:-bottom-12 w-full max-w-2xl px-6 py-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-white font-medium text-lg truncate">
                    {currentPhoto.nom}
                  </h4>
                  <p className="text-[#ffe992] text-sm uppercase tracking-wider">
                    {currentPhoto.format} —{" "}
                    {formatFileSize(currentPhoto.taille)}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(currentPhoto)}
                  disabled={downloadingPhotoId === currentPhoto._id}
                  className="shrink-0 bg-[#ffe992] hover:bg-white text-black font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,233,146,0.3)]"
                >
                  {downloadingPhotoId === currentPhoto._id ? (
                    <>
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Préparation...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Télécharger HD
                    </>
                  )}
                </button>
              </motion.div>
            </div>

            {/* Navigation Suivant */}
            <button
              onClick={nextPhoto}
              className="absolute right-4 sm:right-10 z-[60] p-4 bg-black/50 hover:bg-[#ffe992] text-white hover:text-black rounded-full backdrop-blur-md transition-all border border-white/10 group"
            >
              <ChevronRight
                size={32}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
