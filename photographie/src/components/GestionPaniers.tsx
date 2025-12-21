// =======================
// 📦 Import des modules
// =======================
import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Mail, ShoppingCart, Image as ImageIcon, Package, Ruler, Layers } from "lucide-react";

// =======================
// 🧩 Interfaces TypeScript
// =======================

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

// URL d’accès à l’API
const API_URL = `${import.meta.env.VITE_API_URL}/api/paniers`;

import { useToast } from "./Toast";

// =====================================================================
// 🎯 Composant principal : Gestion des Paniers (Admin)
// =====================================================================
export default function GestionPaniers() {
  const [paniers, setPaniers] = useState<Panier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // 🔄 Récupération des paniers
  const fetchPaniers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaniers(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors du chargement des paniers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaniers();
  }, []);

  // ❌ Suppression d’un panier
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce panier ?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaniers(paniers.filter((p) => p._id !== id));
      addToast("Panier supprimé avec succès", "success");
    } catch (e: any) {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  // 🧮 Calcul du total d'articles
  const getTotalArticles = (articles: Article[]) => {
    return articles.reduce((acc, item) => acc + item.quantite, 0);
  };

  // 🧮 Calcul du montant total estimé
  const getTotalMontant = (articles: Article[]) => {
    return articles.reduce((acc, item) => acc + (item.prixUnitaire || 0) * item.quantite, 0);
  };

  return (
    <div className="p-6 min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-base-300">
          <div className="p-3 bg-primary/10 rounded-xl">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Gestion des Paniers</h2>
            <p className="text-gray-500">Suivi des commandes en cours et paniers abandonnés</p>
          </div>
        </div>

        {error && <div className="alert alert-error mb-6 shadow-lg">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : paniers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-base-200/50 rounded-2xl border-2 border-dashed border-base-300">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-xl font-medium">Aucun panier actif pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paniers.map((panier) => (
              <div 
                key={panier._id} 
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 flex flex-col h-full"
              >
                {/* 👤 En-tête Carte : Info Client */}
                <div className="card-body p-5 pb-4 bg-base-300/50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title text-xl capitalize text-base-content">
                        {panier.utilisateur?.prenom || "Client"} {panier.utilisateur?.nom || "Inconnu"}
                      </h3>
                      <a 
                        href={`mailto:${panier.utilisateur?.email}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Mail size={12} /> {panier.utilisateur?.email}
                      </a>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="badge badge-primary font-bold">
                        {getTotalArticles(panier.articles)} articles
                      </div>
                      <div className="text-xs font-mono opacity-50">
                        {getTotalMontant(panier.articles) > 0 ? `${getTotalMontant(panier.articles)} €` : "Prix N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📦 Corps Carte : Liste Articles */}
                <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent p-2">
                  {panier.articles.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm italic">
                      Panier vide
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {panier.articles.map((item, index) => (
                        <div key={index} className="flex gap-3 p-3 bg-base-100 rounded-lg border border-base-content/5 hover:border-primary/30 transition-colors">
                          {/* Miniature */}
                          <div className="relative w-24 h-24 rounded-md overflow-hidden bg-base-300 flex-shrink-0">
                            {(item.image || item.photo?.src) ? (
                              <img 
                                src={
                                  (item.image || item.photo?.src || "").startsWith('http') 
                                    ? (item.image || item.photo?.src) 
                                    : `${import.meta.env.VITE_API_URL}${item.image || item.photo?.src}`
                                } 
                                alt={item.titre || item.photo?.titre} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            {/* Fallback icon */}
                            <div className={`absolute inset-0 flex items-center justify-center bg-base-300 text-gray-400 ${(item.image || item.photo?.src) ? 'hidden' : ''}`}>
                              <ImageIcon size={24} />
                            </div>
                          </div>
                          
                          {/* Détails Article */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-bold text-sm truncate text-base-content" title={item.titre || item.photo?.titre}>
                                {item.titre || item.photo?.titre || "Article sans titre"}
                              </h4>
                              {/* Détails techniques */}
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1 bg-base-200 px-1.5 py-0.5 rounded">
                                  <Ruler size={10} /> {item.format || "Standard"}
                                </span>
                                <span className="flex items-center gap-1 bg-base-200 px-1.5 py-0.5 rounded">
                                  <Layers size={10} /> {item.support || "Papier"}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-end mt-2">
                              <span className="badge badge-sm badge-ghost gap-1">
                                <Package size={10} /> Qté: {item.quantite}
                              </span>
                              <span className="font-mono text-sm font-bold text-primary">
                                {item.prixUnitaire ? `${item.prixUnitaire} €` : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ⚙️ Pied de Carte : Actions */}
                <div className="p-4 bg-base-300/30 border-t border-base-300 flex justify-between items-center mt-auto rounded-b-xl">
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {panier._id.slice(-6)}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${panier.utilisateur?.email}`}
                      className="btn btn-sm btn-info btn-outline gap-2"
                      title="Envoyer un email"
                    >
                      <Mail size={16} />
                      <span className="hidden sm:inline">Contacter</span>
                    </a>
                    <button
                      onClick={() => handleDelete(panier._id)}
                      className="btn btn-sm btn-error btn-outline btn-square"
                      title="Supprimer le panier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
