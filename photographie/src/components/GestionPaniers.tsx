import { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  Mail,
  ShoppingCart,
  Image as ImageIcon,
  X,
  Copy,
} from "lucide-react";
import { API_URL as BASE_API_URL } from "../config/api";
import { useToast } from "./Toast";

const API_URL = `${BASE_API_URL}/api/paniers`;

interface User {
  _id: string;
  nom?: string;
  prenom?: string;
  email: string;
}

interface Photo {
  _id: string;
  titre?: string;
  src?: string;
  prix?: number;
}

interface Article {
  photo: Photo;
  quantite: number;
  format?: string;
  support?: string;
  prixUnitaire?: number;
  titre?: string;
  image?: string;
  _id?: string;
}

interface Panier {
  _id: string;
  utilisateur: User;
  articles: Article[];
  dateCreation?: string;
}

export default function GestionPaniers() {
  const [paniers, setPaniers] = useState<Panier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchPaniers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { withCredentials: true });
      setPaniers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message || "Erreur lors du chargement des paniers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaniers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce panier ?"))
      return;

    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setPaniers(paniers.filter((p) => p._id !== id));
      addToast("Panier supprimé avec succès", "success");
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    addToast("Email copié dans le presse-papier", "success");
  };

  const getTotalArticles = (articles: Article[]) => {
    return articles.reduce((acc, item) => acc + item.quantite, 0);
  };

  const getTotalMontant = (articles: Article[]) => {
    return articles.reduce(
      (acc, item) => acc + (item.prixUnitaire || 0) * item.quantite,
      0
    );
  };

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion des Paniers
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Suivi des commandes en cours
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
            Total paniers
          </span>
          <span className="text-xl font-bold text-white">{paniers.length}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20 flex items-center gap-3">
          <X size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
          <span className="loading loading-spinner loading-lg"></span>{" "}
          Chargement...
        </div>
      ) : paniers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
          <ShoppingCart size={32} className="opacity-20" />
          <p>Aucun panier actif pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {paniers.map((panier) => (
            <div
              key={panier._id}
              className="bg-[#0a0a10] rounded-xl border border-white/10 overflow-hidden flex flex-col h-full hover:border-[#ffe992]/30 transition-all group"
            >
              {/* En-tête Carte */}
              <div className="p-5 bg-white/5 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg capitalize group-hover:text-[#ffe992] transition-colors">
                      {panier.utilisateur?.prenom || "Client"}{" "}
                      {panier.utilisateur?.nom || "Inconnu"}
                    </h3>
                    <a
                      href={`mailto:${panier.utilisateur?.email}`}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-1 transition-colors"
                    >
                      <Mail size={12} /> {panier.utilisateur?.email}
                    </a>
                  </div>
                  <div className="text-right">
                    <div className="text-[#ffe992] font-bold text-lg">
                      {getTotalMontant(panier.articles) > 0
                        ? `${getTotalMontant(panier.articles)} €`
                        : "N/A"}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {getTotalArticles(panier.articles)} articles
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste Articles */}
              <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar p-3 space-y-2">
                {panier.articles.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs italic">
                    Panier vide
                  </div>
                ) : (
                  panier.articles.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-2 bg-[#1a1a20] rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Miniature */}
                      <div className="w-16 h-16 rounded bg-black/40 overflow-hidden border border-white/5 flex-shrink-0">
                        {item.image || item.photo?.src ? (
                          <img
                            src={
                              (item.image || item.photo?.src || "").startsWith(
                                "http"
                              )
                                ? item.image || item.photo?.src
                                : `${BASE_API_URL}${
                                    item.image || item.photo?.src
                                  }`
                            }
                            alt={item.titre || item.photo?.titre}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>

                      {/* Détails */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h4
                            className="font-bold text-white text-xs truncate"
                            title={item.titre || item.photo?.titre}
                          >
                            {item.titre ||
                              item.photo?.titre ||
                              "Article sans titre"}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">
                              {item.format || "Standard"}
                            </span>
                            <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">
                              {item.support || "Papier"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-1">
                          <span className="text-[10px] text-gray-500 font-mono">
                            Qté: {item.quantite}
                          </span>
                          <span className="text-xs font-bold text-[#ffe992]">
                            {item.prixUnitaire
                              ? `${item.prixUnitaire} €`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center mt-auto">
                <span className="text-[10px] text-gray-500 font-mono">
                  ID: {panier._id.slice(-6)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyEmail(panier.utilisateur?.email)}
                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-500/20"
                    title="Copier l'email"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={`mailto:${panier.utilisateur?.email}`}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-500/20"
                    title="Contacter"
                  >
                    <Mail size={16} />
                    <span className="text-xs font-medium">Contacter</span>
                  </a>
                  <button
                    onClick={() => handleDelete(panier._id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
