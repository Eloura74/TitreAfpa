import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../config/api";
import {
  Download,
  Lock,
  LogOut,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { PhotoOriginale } from "../types/evenement";

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
  const [codeAcces, setCodeAcces] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [accesInfo, setAccesInfo] = useState<AccesInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ecrin/session`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setIsConnected(true);
        setAccesInfo(res.data.acces);
      }
    } catch (err) {
      setIsConnected(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/ecrin/login`,
        { codeAcces },
        { withCredentials: true },
      );

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
    } catch (err) {
      setError("Erreur lors de la déconnexion");
    }
  };

  const handleDownload = async (photo: PhotoOriginale) => {
    setDownloadingPhotoId(photo._id || "");
    setError(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/ecrin/generate-download-url`,
        { photoId: photo._id },
        { withCredentials: true },
      );

      if (res.data.success) {
        window.open(res.data.url, "_blank");
        setSuccess(`Téléchargement de ${photo.nom} démarré`);
        await checkSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du téléchargement");
    } finally {
      setDownloadingPhotoId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ffe992]/10 rounded-full mb-4">
                <Lock className="text-[#ffe992]" size={32} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#ffe992] mb-2">
                Écrin Privé
              </h1>
              <p className="text-gray-400 text-sm">
                Accédez à vos photos originales haute résolution
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20 flex items-center gap-3"
              >
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/10 text-green-400 p-4 rounded-lg mb-6 border border-green-500/20 flex items-center gap-3"
              >
                <CheckCircle size={20} /> {success}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Code d'accès
                </label>
                <input
                  type="text"
                  value={codeAcces}
                  onChange={(e) => setCodeAcces(e.target.value.toUpperCase())}
                  placeholder="SHOOTING-2024-ABC123"
                  className="w-full bg-[#232336] border border-white/10 rounded-lg px-4 py-3 text-white uppercase tracking-wider focus:border-[#ffe992] outline-none transition-all placeholder-gray-600"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffe992] hover:bg-[#d6c487] text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ffe992]/20"
              >
                {loading ? "Connexion..." : "Accéder à mes photos"}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              Vous avez reçu votre code d'accès par email
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12121a]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#ffe992] mb-2">
                {accesInfo?.titre}
              </h1>
              <p className="text-gray-400 mb-4">{accesInfo?.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    {accesInfo?.dateDebut && formatDate(accesInfo.dateDebut)} -{" "}
                    {accesInfo?.dateFin && formatDate(accesInfo.dateFin)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  <span>
                    {accesInfo?.photosOriginales?.length || 0} photos originales
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>

          {accesInfo?.typeValidite === "temporaire" &&
            accesInfo?.dateExpiration && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm">
                  ⏰ Accès valide jusqu'au{" "}
                  {formatDate(accesInfo.dateExpiration)}
                </p>
              </div>
            )}

          {accesInfo?.typeLimiteTelechargement !== "illimite" && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                {accesInfo?.typeLimiteTelechargement === "total" && (
                  <>
                    📊 Téléchargements : {accesInfo?.nbTelechargementTotal} /{" "}
                    {accesInfo?.maxTelechargementTotal}
                  </>
                )}
                {accesInfo?.typeLimiteTelechargement === "par_photo" && (
                  <>
                    📊 Limite : {accesInfo?.maxTelechargementParPhoto}{" "}
                    téléchargements par photo
                  </>
                )}
              </p>
            </div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20 flex items-center gap-3"
          >
            <AlertCircle size={20} /> {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-500/10 text-green-400 p-4 rounded-lg mb-6 border border-green-500/20 flex items-center gap-3"
          >
            <CheckCircle size={20} /> {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {accesInfo?.photosOriginales?.map((photo, index) => (
              <motion.div
                key={photo._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#12121a]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-[#ffe992]/30 transition-all group"
              >
                {photo.miniature && (
                  <div className="relative aspect-video overflow-hidden bg-black/20">
                    <img
                      src={photo.miniature}
                      alt={photo.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                      {photo.format}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1 truncate">
                        {photo.nom}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {photo.format} • {formatFileSize(photo.taille)}
                      </p>
                    </div>
                  </div>

                  {photo.nbTelechargements && photo.nbTelechargements > 0 && (
                    <div className="text-xs text-gray-500 mb-4">
                      Téléchargé {photo.nbTelechargements} fois
                    </div>
                  )}

                  <button
                    onClick={() => handleDownload(photo)}
                    disabled={downloadingPhotoId === photo._id}
                    className="w-full bg-[#ffe992] hover:bg-[#d6c487] text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#ffe992]/10"
                  >
                    <Download size={18} />
                    {downloadingPhotoId === photo._id
                      ? "Génération..."
                      : "Télécharger l'original"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {(!accesInfo?.photosOriginales ||
          accesInfo.photosOriginales.length === 0) && (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">
              Aucune photo originale disponible pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
