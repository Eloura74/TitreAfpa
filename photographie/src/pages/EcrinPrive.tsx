import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import JSZip from "jszip";
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
  Square,
  CheckSquare,
  Search,
  ShoppingCart,
} from "lucide-react";
import PhotoSortControls, {
  SortOption,
  ViewMode,
} from "../components/common/PhotoSortControls";
import { PhotoOriginale } from "../types/evenement";
import { SelectionFormatModalV2 } from "../components/galerie/SelectionFormatModalV2";
import { usePanier } from "../store/panierContext";
import { useToast } from "../components/Toast";
import { tariffServiceV2 } from "../services/tariffServiceV2";
import { TariffConfigV2 } from "../types/tarifConfigV2";

import Navbar from "../components/layout/navbar"; // Composant cohérence UI
import Footer from "../components/layout/Footer"; // Composant cohérence UI

interface AccesInfo {
  _id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  image?: string;
  photos: unknown[];
  photosOriginales: PhotoOriginale[];
  allowDownload?: boolean;
  allowPrint?: boolean;
  availableTariffIds?: string[];
  typeValidite: "permanent" | "temporaire";
  dateExpiration?: string;
  typeLimiteTelechargement: "illimite" | "par_photo" | "total";
  maxTelechargementParPhoto?: number;
  maxTelechargementTotal?: number;
  nbTelechargementTotal: number;
  defaultSortBy?: SortOption;
}

export default function EcrinPrive() {
  const { codeAcces: codeAccesFromUrl } = useParams<{ codeAcces: string }>();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();
  const { addToast } = useToast();

  const [codeAcces, setCodeAcces] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [accesInfo, setAccesInfo] = useState<AccesInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null,
  );

  // États pour le panier et la sélection de formats
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoOriginale | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [tariffConfig, setTariffConfig] = useState<TariffConfigV2 | null>(null);

  // Infos publiques récupérées via le slug d'URL
  const [publicInfo, setPublicInfo] = useState<{
    titre: string;
    image?: string;
  } | null>(null);

  // --- Nouveaux états Lightbox ---
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [loadingLightboxImage, setLoadingLightboxImage] = useState(false);

  // --- Nouveaux états Sélection Multiple ---
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDownloadingMultiple, setIsDownloadingMultiple] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // --- Nouveaux états Recherche et Tri ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [displayMode, setDisplayMode] = useState<ViewMode>("grid");

  // Mettre à jour le tri quand accesInfo change (utilise defaultSortBy depuis MongoDB)
  useEffect(() => {
    if (accesInfo?.defaultSortBy) {
      setSortBy(accesInfo.defaultSortBy);
    }
  }, [accesInfo?.defaultSortBy]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ecrin/session`, {
          withCredentials: true,
        });
        if (res.data.success) {
          // Vérifier si le slug correspond
          if (codeAccesFromUrl && res.data.acces) {
            const sessionSlug = res.data.acces.slug || res.data.acces.codeAcces;
            if (sessionSlug !== codeAccesFromUrl) {
              // Slug différent = déconnecter
              await handleLogout(true);
              return;
            }
          }
          setIsConnected(true);
          setAccesInfo(res.data.acces);
        }
      } catch {
        setIsConnected(false);
      }
    };

    initSession();
  }, [codeAccesFromUrl]);

  // Charger la configuration des tarifs
  useEffect(() => {
    const loadTariffs = async () => {
      const config = await tariffServiceV2.getTariffConfig();
      setTariffConfig(config);
    };
    loadTariffs();
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
  }, [codeAccesFromUrl, isConnected, loading]);

  // Forcer le focus sur l'input après l'animation
  useEffect(() => {
    if (!isConnected && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500); // Attendre la fin de l'animation Framer Motion
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const checkSession = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ecrin/session`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setIsConnected(true);
        setAccesInfo(res.data.acces);
      }
    } catch {
      setIsConnected(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation : vérifier que le code n'est pas vide
    if (!codeAcces || codeAcces.trim() === "") {
      setError("Veuillez saisir un code d'accès");
      inputRef.current?.focus();
      return;
    }

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
        setSuccess("Connexion réussie ! Chargement de vos photos...");
        // Attendre que checkSession charge les données complètes avant de connecter
        await checkSession();
        setIsConnected(true);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Code d'accès invalide");
      } else {
        setError("Code d'accès invalide");
      }
      // Refocus sur l'input en cas d'erreur
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (silent = false) => {
    try {
      await axios.post(
        `${API_URL}/api/ecrin/logout`,
        {},
        { withCredentials: true },
      );
      setIsConnected(false);
      setAccesInfo(null);
      setCodeAcces("");
      if (!silent) {
        setSuccess("Déconnexion réussie");
        navigate("/ecrin-prive", { replace: true });
      }
    } catch {
      if (!silent) {
        setError("Erreur lors de la déconnexion");
      }
    }
  };

  const handleAddToCart = useCallback(
    (photo: PhotoOriginale) => {
      if (
        !accesInfo?.availableTariffIds ||
        accesInfo.availableTariffIds.length === 0
      ) {
        addToast("Aucun format disponible pour ce reportage", "error");
        return;
      }

      const photoWithTariffs = {
        ...photo,
        _id: photo._id,
        titre: photo.nom,
        src: photo.miniature || photo.fichierR2,
        availableTariffIds: accesInfo.availableTariffIds,
      } as any;

      setSelectedPhoto(photoWithTariffs);
      setModalVisible(true);
    },
    [accesInfo, addToast],
  );

  const handleSelectFormat = (tarif: any) => {
    if (!selectedPhoto) return;

    const supportValue = tarif.support || "Standard";

    ajouterArticle({
      id: crypto.randomUUID(),
      photoId: selectedPhoto._id,
      nom: selectedPhoto.nom,
      prix: tarif.prix,
      quantite: tarif.quantity || 1,
      image: selectedPhoto.miniature || selectedPhoto.fichierR2,
      format: tarif.format,
      support: supportValue,
    });

    addToast(
      `${selectedPhoto.nom} (${tarif.format}) ajouté au panier`,
      "success",
    );
    setModalVisible(false);
    setSelectedPhoto(null);
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
        const link = document.createElement("a");
        link.href = res.data.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = photo.nom; // Tente de forcer le DL direct

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSuccess(`Le téléchargement de ${photo.nom} est terminé.`);
        await checkSession(); // Maj des limites et stats
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Erreur lors du téléchargement",
        );
      } else {
        setError("Erreur lors du téléchargement");
      }
    } finally {
      setDownloadingPhotoId(null);
    }
  };

  const handleDownloadMultiple = async () => {
    if (selectedPhotos.size === 0) return;
    setIsDownloadingMultiple(true);
    setDownloadProgress({ current: 0, total: selectedPhotos.size });
    setError(null);
    setSuccess(null);

    const photosToDownload =
      accesInfo?.photosOriginales?.filter((p) => selectedPhotos.has(p._id!)) ||
      [];

    try {
      const zip = new JSZip();

      // Télécharger toutes les photos et les ajouter au ZIP
      for (let i = 0; i < photosToDownload.length; i++) {
        const photo = photosToDownload[i];
        try {
          // Générer l'URL de téléchargement
          const res = await axios.post(
            `${API_URL}/api/ecrin/generate-download-url`,
            { photoId: photo._id },
            { withCredentials: true },
          );

          if (res.data.success) {
            // Télécharger le fichier en tant que blob
            const response = await fetch(res.data.url);
            const blob = await response.blob();

            // Ajouter au ZIP avec le nom original
            zip.file(photo.nom, blob);
          }
        } catch (err) {
          console.error("Échec téléchargement pour", photo.nom, err);
        }
        setDownloadProgress((prev) => ({ ...prev, current: i + 1 }));
      }

      // Générer le fichier ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Créer un nom de fichier pour le ZIP
      const zipFileName = `${accesInfo?.titre || "photos"}_${new Date().toISOString().split("T")[0]}.zip`;

      // Télécharger le ZIP
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setSuccess(
        `${photosToDownload.length} photos téléchargées dans ${zipFileName}`,
      );
    } catch (err) {
      console.error("Erreur création ZIP:", err);
      setError("Erreur lors de la création du fichier ZIP");
    }

    setIsDownloadingMultiple(false);
    setSelectedPhotos(new Set());
    checkSession();
  };

  const toggleSelection = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedPhotos);
    if (next.has(photoId)) next.delete(photoId);
    else next.add(photoId);
    setSelectedPhotos(next);
  };

  const toggleSelectAll = () => {
    if (!accesInfo?.photosOriginales) return;
    if (selectedPhotos.size === accesInfo.photosOriginales.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(accesInfo.photosOriginales.map((p) => p._id!)));
    }
  };

  // --- Gestion Lightbox ---
  const openLightbox = async (photoId: string) => {
    // Trouver l'index de la photo dans le tableau original photosOriginales
    const index = accesInfo?.photosOriginales?.findIndex(
      (p) => p._id === photoId,
    );
    if (index === undefined || index === -1) return;

    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
    setLoadingLightboxImage(false);

    const photo = accesInfo?.photosOriginales?.[index];
    if (!photo?._id) return;

    // Essayer d'utiliser l'URL proxy backend pour l'image HD
    // Si ça échoue, la miniature sera affichée via le fallback onError
    const imageUrl = `${API_URL}/api/ecrin/view-photo/${photo._id}`;
    setLightboxImageUrl(imageUrl);
  };

  const nextPhoto = useCallback(() => {
    if (!accesInfo?.photosOriginales) return;
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === accesInfo.photosOriginales.length - 1 ? 0 : prevIndex + 1,
    );
  }, [accesInfo?.photosOriginales]);

  const prevPhoto = useCallback(() => {
    if (!accesInfo?.photosOriginales) return;
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? accesInfo.photosOriginales.length - 1 : prevIndex - 1,
    );
  }, [accesInfo?.photosOriginales]);

  // Recharger l'image HD quand l'index change + précharger les images adjacentes
  useEffect(() => {
    if (!isLightboxOpen || !accesInfo?.photosOriginales) return;

    const photo = accesInfo.photosOriginales[currentPhotoIndex];
    if (!photo?._id) return;

    // Charger l'image actuelle
    const imageUrl = `${API_URL}/api/ecrin/view-photo/${photo._id}`;
    setLightboxImageUrl(imageUrl);

    // Précharger l'image suivante
    if (currentPhotoIndex < accesInfo.photosOriginales.length - 1) {
      const nextPhoto = accesInfo.photosOriginales[currentPhotoIndex + 1];
      if (nextPhoto?._id) {
        const nextImg = new Image();
        nextImg.src = `${API_URL}/api/ecrin/view-photo/${nextPhoto._id}`;
      }
    }

    // Précharger l'image précédente
    if (currentPhotoIndex > 0) {
      const prevPhoto = accesInfo.photosOriginales[currentPhotoIndex - 1];
      if (prevPhoto?._id) {
        const prevImg = new Image();
        prevImg.src = `${API_URL}/api/ecrin/view-photo/${prevPhoto._id}`;
      }
    }
  }, [currentPhotoIndex, isLightboxOpen, accesInfo?.photosOriginales]);

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
  }, [isLightboxOpen, nextPhoto, prevPhoto]);

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
                      ref={inputRef}
                      type="text"
                      value={codeAcces}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setCodeAcces(value);
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData("text");
                        setCodeAcces(pastedText.toUpperCase().trim());
                      }}
                      onClick={() => inputRef.current?.focus()}
                      placeholder="Ex: MARIAGE-JULIE-123"
                      className="w-full bg-black/40 border border-[#ffe992]/20 rounded-xl px-5 py-4 text-white text-lg uppercase tracking-wider focus:border-[#ffe992] focus:ring-1 focus:ring-[#ffe992]/50 outline-none transition-all placeholder-white/20 text-center"
                      required
                      disabled={loading}
                      autoComplete="off"
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
              onClick={() => handleLogout(false)}
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

        {/* Barre de recherche et contrôles */}
        {accesInfo?.photosOriginales &&
          accesInfo.photosOriginales.length > 0 && (
            <div className="space-y-4 mb-6">
              {/* Recherche et tri */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#12121a]/80 backdrop-blur-md border border-[#ffe992]/20 p-4 rounded-2xl shadow-lg">
                {/* Barre de recherche */}
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une photo par nom..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-12 pr-4 py-2.5 text-white text-sm focus:border-[#ffe992] transition-colors outline-none placeholder-gray-500"
                  />
                </div>

                {/* Contrôles de tri et affichage */}
                <PhotoSortControls
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={displayMode}
                  onViewModeChange={setDisplayMode}
                  className=""
                />
              </div>

              {/* Barre d'actions (Sélection Multiple) */}
              <div className="flex items-center justify-between bg-[#12121a]/80 backdrop-blur-md border border-[#ffe992]/20 p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#ffe992] transition-colors"
                    title={
                      selectedPhotos.size === accesInfo.photosOriginales.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"
                    }
                  >
                    {selectedPhotos.size ===
                    accesInfo.photosOriginales.length ? (
                      <CheckSquare size={20} className="text-[#ffe992]" />
                    ) : (
                      <Square size={20} />
                    )}
                    <span className="text-sm tracking-wide font-medium">
                      Tout sélectionner
                    </span>
                  </button>

                  {selectedPhotos.size > 0 && (
                    <span className="text-sm font-semibold text-[#ffe992] bg-[#ffe992]/10 px-3 py-1 rounded-full">
                      {selectedPhotos.size} sélectionnée(s)
                    </span>
                  )}
                </div>

                {selectedPhotos.size > 0 &&
                  accesInfo?.allowDownload !== false && (
                    <button
                      onClick={handleDownloadMultiple}
                      disabled={isDownloadingMultiple}
                      className="flex items-center gap-2 px-6 py-2 bg-[#ffe992] hover:bg-white text-black rounded-lg font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(255,233,146,0.3)] disabled:opacity-50"
                    >
                      {isDownloadingMultiple ? (
                        <>
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          {downloadProgress.current} / {downloadProgress.total}
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Télécharger
                        </>
                      )}
                    </button>
                  )}
              </div>
            </div>
          )}

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
          <div
            className={
              displayMode === "list"
                ? "space-y-4"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            }
          >
            {accesInfo.photosOriginales
              .filter((photo) => {
                if (!searchQuery) return true;
                return photo.nom
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
              })
              .sort((a, b) => {
                switch (sortBy) {
                  case "date-desc":
                    return (b._id || "").localeCompare(a._id || "");
                  case "date-asc":
                    return (a._id || "").localeCompare(b._id || "");
                  case "name-asc":
                    return (a.nom || "").localeCompare(b.nom || "");
                  case "name-desc":
                    return (b.nom || "").localeCompare(a.nom || "");
                  default:
                    return 0;
                }
              })
              .map((photo, index) => {
                const isSelected = selectedPhotos.has(photo._id!);
                return (
                  <motion.div
                    key={photo._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className={`${displayMode === "list" ? "flex items-center gap-4 p-4" : ""} relative group rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isSelected
                        ? "border-[#ffe992] shadow-[0_0_20px_rgba(255,233,146,0.2)]"
                        : "border-white/5 bg-black/40"
                    }`}
                  >
                    {/* Case à cocher pour sélection */}
                    <button
                      onClick={(e) => toggleSelection(photo._id!, e)}
                      className={`absolute top-4 left-4 z-20 p-1.5 rounded-md backdrop-blur-md transition-all ${
                        isSelected
                          ? "bg-[#ffe992] text-black scale-110 shadow-[0_0_10px_rgba(255,233,146,0.5)]"
                          : "bg-black/50 text-white/50 opacity-0 group-hover:opacity-100 hover:text-white border border-white/20"
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>

                    {/* Image miniature avec fallback */}
                    <div
                      className={`relative overflow-hidden group-hover:shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] transition-all ${
                        displayMode === "list"
                          ? "w-32 h-32 flex-shrink-0"
                          : "w-full"
                      }`}
                    >
                      {/* Bouton loupe - toujours visible sur mobile, au survol sur desktop */}
                      <button
                        onClick={() => openLightbox(photo._id!)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-[#ffe992] text-white hover:text-black rounded-full backdrop-blur-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110"
                        title="Agrandir l'image"
                      >
                        <Search size={24} />
                      </button>

                      <div
                        className="cursor-pointer w-full h-full"
                        onClick={() => {
                          if (selectedPhotos.size > 0) {
                            toggleSelection(photo._id!);
                          } else {
                            openLightbox(photo._id!);
                          }
                        }}
                        title={
                          selectedPhotos.size > 0
                            ? "Ajouter à la sélection"
                            : "Cliquez pour agrandir"
                        }
                      >
                        {!photo.miniature ||
                        photo.miniature === "undefined" ||
                        photo.miniature.trim() === "" ||
                        imageErrors.has(photo._id!) ? (
                          <div
                            className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-black/80 to-[#12121a] border border-white/5"
                            style={{ minHeight: "250px" }}
                          >
                            <ImageIcon
                              size={48}
                              className="text-gray-600 mb-3"
                            />
                            <span className="text-xs text-gray-400 truncate max-w-[80%] px-4 py-1 bg-black/50 rounded-full border border-gray-800">
                              {photo.nom}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={photo.miniature}
                            alt={photo.nom}
                            loading="lazy"
                            className={`${displayMode === "list" ? "w-full h-full" : "w-full h-auto"} object-cover transition-all duration-700 ease-in-out ${isSelected ? "opacity-100 scale-[1.03]" : "opacity-80 group-hover:opacity-100 group-hover:scale-[1.03]"}`}
                            style={{
                              minHeight:
                                displayMode === "list" ? "128px" : "200px",
                            }}
                            onError={() =>
                              setImageErrors((prev) =>
                                new Set(prev).add(photo._id!),
                              )
                            }
                          />
                        )}
                      </div>

                      {/* Overlay au survol pour DL Simple */}
                      {!isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                          <h3 className="text-white font-medium truncate mb-1 text-sm">
                            {photo.nom}
                          </h3>
                          <p className="text-xs text-[#ffe992] uppercase tracking-wider mb-2">
                            {photo.format} • {formatFileSize(photo.taille)}
                          </p>

                          {/* Commentaire admin */}
                          {photo.commentaire && (
                            <div className="mb-3 p-2 bg-blue-500/20 border-l-2 border-blue-400 rounded">
                              <p className="text-xs text-blue-200 italic">
                                💬 {photo.commentaire}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            {accesInfo?.allowDownload !== false && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
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
                            )}

                            {accesInfo?.allowPrint !== false && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(photo);
                                }}
                                className="w-full bg-[#ffe992] hover:bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wide transition-all"
                              >
                                <ShoppingCart size={16} />
                                Commander
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl pt-20 pb-4 px-4 sm:px-8"
          >
            {/* Bouton Fermer */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-24 right-6 z-[60] p-3 bg-white/10 hover:bg-white/20 hover:scale-110 text-white rounded-full backdrop-blur-md transition-all shadow-xl"
              title="Fermer (Échap)"
            >
              <X size={28} />
            </button>

            {/* Checkbox Sélection */}
            <button
              onClick={() => toggleSelection(currentPhoto._id || "")}
              className="absolute top-24 left-6 z-[60] px-4 py-3 bg-white/10 hover:bg-white/20 hover:scale-105 text-white rounded-full backdrop-blur-md transition-all flex items-center gap-3 shadow-xl"
              title={
                selectedPhotos.has(currentPhoto._id || "")
                  ? "Désélectionner"
                  : "Sélectionner pour téléchargement multiple"
              }
            >
              <div
                className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-all ${
                  selectedPhotos.has(currentPhoto._id || "")
                    ? "bg-[#ffe992] border-[#ffe992]"
                    : "border-white"
                }`}
              >
                {selectedPhotos.has(currentPhoto._id || "") && (
                  <CheckCircle size={20} className="text-black" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {selectedPhotos.has(currentPhoto._id || "")
                  ? "Sélectionnée"
                  : "Sélectionner"}
              </span>
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
            <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-8 py-12">
              {/* Image principale dans la Lightbox */}
              {loadingLightboxImage ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#ffe992]/20 border-t-[#ffe992] rounded-full animate-spin mb-4" />
                  <p className="text-white text-lg">
                    Chargement de l'image HD...
                  </p>
                </div>
              ) : (
                <motion.img
                  key={currentPhoto._id || currentPhotoIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  src={lightboxImageUrl || currentPhoto.miniature}
                  alt={currentPhoto.nom}
                  className="rounded-lg shadow-2xl"
                  style={{
                    width: "85vw",
                    height: "calc(100vh - 320px)",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    // Si l'image HD échoue, utiliser la miniature
                    if (lightboxImageUrl && currentPhoto.miniature) {
                      setLightboxImageUrl(null);
                      e.currentTarget.src = currentPhoto.miniature;
                    }
                  }}
                />
              )}

              {/* Informations et bouton DL fixés en bas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-8 w-full max-w-2xl px-6 py-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
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

                {accesInfo?.allowDownload !== false && (
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
                )}
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

      {/* Modal de sélection de format */}
      <AnimatePresence>
        {modalVisible && selectedPhoto && tariffConfig && (
          <SelectionFormatModalV2
            photo={selectedPhoto}
            onSelect={handleSelectFormat}
            onClose={() => {
              setModalVisible(false);
              setSelectedPhoto(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
