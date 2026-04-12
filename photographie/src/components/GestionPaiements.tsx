import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL as BASE_API_URL } from "../config/api";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  CreditCard,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
} from "lucide-react";

const API_URL = `${BASE_API_URL}/api/paiements`;

interface Article {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  format?: string;
  support?: string;
}

interface AdresseLivraison {
  nom?: string;
  prenom?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
}

interface Paiement {
  _id?: string;
  montant: number;
  date: string;
  utilisateur?: string;
  nomClient?: string;
  emailClient?: string;
  source?: "manuel" | "paypal" | "stripe";
  transactionId?: string;
  statut?: string;
  articles?: Article[];
  adresseLivraison?: AdresseLivraison;
}

export default function GestionPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [form, setForm] = useState<Paiement>({
    montant: 0,
    date: new Date().toISOString().split("T")[0],
    nomClient: "",
    source: "manuel",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = () => {
    setLoading(true);
    axios
      .get(API_URL, { withCredentials: true })
      .then((r) => {
        // Backend retourne {status, data} au lieu d'un array direct
        const paiementsData = r.data.data || r.data;
        setPaiements(Array.isArray(paiementsData) ? paiementsData : []);
      })
      .catch((e) => {
        setError(
          e?.response?.data?.message ||
            "Erreur lors du chargement des paiements.",
        );
        setPaiements([]);
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      montant: 0,
      date: new Date().toISOString().split("T")[0],
      nomClient: "",
      source: "manuel",
    });
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form, {
          withCredentials: true,
        });
      } else {
        await axios.post(API_URL, form, { withCredentials: true });
      }
      fetchPaiements();
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message ||
          "Erreur lors de l'enregistrement du paiement.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Paiement) => {
    setForm({
      ...p,
      date: p.date ? new Date(p.date).toISOString().split("T")[0] : "",
    });
    setEditId(p._id || null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce paiement ?")) return;

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setPaiements(paiements.filter((p) => p._id !== id));
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message ||
          "Erreur lors de la suppression du paiement.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Historique des Paiements
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Suivi financier
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
            Total CA
          </span>
          <span className="text-xl font-bold text-white">
            {paiements.reduce((acc, p) => acc + (p.montant || 0), 0).toFixed(2)}{" "}
            €
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20 flex items-center gap-3">
          <X size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE : Formulaire */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 p-6">
            <h3 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider mb-6 flex items-center gap-2">
              {editId ? <Edit size={16} /> : <Plus size={16} />}
              {editId ? "Modifier un paiement" : "Ajout manuel"}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3 text-gray-500"
                    size={16}
                  />
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Montant
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    name="montant"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.montant}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Client / Motif
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-gray-500"
                    size={16}
                  />
                  <input
                    name="nomClient"
                    placeholder="Ex: Chèque Mme Dupont"
                    value={form.nomClient}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-[#ffe992] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Source
                </label>
                <div className="relative">
                  <CreditCard
                    className="absolute left-3 top-3 text-gray-500"
                    size={16}
                  />
                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a20] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#ffe992] focus:outline-none transition-all text-sm appearance-none"
                  >
                    <option value="manuel">Manuel</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 bg-[#ffe992] text-black font-bold uppercase tracking-wider text-sm py-3 rounded-lg hover:bg-white transition-colors shadow-lg shadow-[#ffe992]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading
                    ? "Traitement..."
                    : editId
                      ? "Enregistrer"
                      : "Ajouter"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="px-4 py-3 bg-white/5 text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                    onClick={resetForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* COLONNE DROITE : Liste */}
        <div className="lg:col-span-8">
          <div className="bg-[#0a0a10] rounded-xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Liste des transactions
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1a1a20] text-xs uppercase text-gray-500 font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-4 border-b border-white/5">Date</th>
                    <th className="p-4 border-b border-white/5">Source</th>
                    <th className="p-4 border-b border-white/5">Client</th>
                    <th className="p-4 border-b border-white/5">
                      ID Transaction
                    </th>
                    <th className="p-4 border-b border-white/5 text-right">
                      Montant
                    </th>
                    <th className="p-4 border-b border-white/5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading && !editId ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <span className="loading loading-spinner loading-sm"></span>{" "}
                        Chargement...
                      </td>
                    </tr>
                  ) : paiements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Aucun historique de paiement.
                      </td>
                    </tr>
                  ) : (
                    paiements.map((p) => (
                      <>
                        <tr
                          key={p._id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-4 text-sm text-gray-300">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                                p.source === "paypal"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : p.source === "stripe"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                              }`}
                            >
                              {p.source || "Manuel"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">
                              {p.nomClient || p.utilisateur || "Inconnu"}
                            </div>
                            {p.emailClient && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {p.emailClient}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-xs font-mono text-gray-500">
                            {p.transactionId || "-"}
                          </td>
                          <td className="p-4 text-right font-bold text-[#ffe992]">
                            {p.montant?.toFixed(2)} €
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {(p.articles?.length || p.adresseLivraison) && (
                                <button
                                  className="p-1.5 bg-white/5 hover:bg-[#ffe992] hover:text-black text-gray-300 rounded transition-colors"
                                  onClick={() =>
                                    setExpandedId(
                                      expandedId === p._id
                                        ? null
                                        : p._id || null,
                                    )
                                  }
                                  title="Voir détails"
                                >
                                  {expandedId === p._id ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
                                  )}
                                </button>
                              )}
                              <button
                                className="p-1.5 bg-white/5 hover:bg-[#ffe992] hover:text-black text-gray-300 rounded transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => handleEdit(p)}
                                title="Éditer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="p-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-300 rounded transition-colors opacity-0 group-hover:opacity-100"
                                onClick={() => p._id && handleDelete(p._id)}
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === p._id &&
                          (p.articles?.length || p.adresseLivraison) && (
                            <tr key={`${p._id}-details`}>
                              <td colSpan={6} className="p-0 bg-[#1a1a20]/50">
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Articles commandés */}
                                  {p.articles && p.articles.length > 0 && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider flex items-center gap-2">
                                        <Package size={16} />
                                        Articles commandés
                                      </h4>
                                      <div className="space-y-2">
                                        {p.articles.map((article, idx) => (
                                          <div
                                            key={idx}
                                            className="bg-[#0a0a10] rounded-lg p-3 border border-white/5"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <div className="font-bold text-white text-sm">
                                                  {article.nom}
                                                </div>
                                                {article.format && (
                                                  <div className="text-xs text-gray-500 mt-1">
                                                    Format: {article.format}
                                                  </div>
                                                )}
                                                {article.support && (
                                                  <div className="text-xs text-gray-500">
                                                    Support: {article.support}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="text-right ml-4">
                                                <div className="text-sm text-gray-400">
                                                  x{article.quantite}
                                                </div>
                                                <div className="text-sm font-bold text-[#ffe992]">
                                                  {article.prixUnitaire.toFixed(
                                                    2,
                                                  )}{" "}
                                                  €
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Adresse de livraison */}
                                  {p.adresseLivraison && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-bold text-[#ffe992] uppercase tracking-wider flex items-center gap-2">
                                        <MapPin size={16} />
                                        Adresse de livraison
                                      </h4>
                                      <div className="bg-[#0a0a10] rounded-lg p-4 border border-white/5 space-y-2">
                                        {(p.adresseLivraison.prenom ||
                                          p.adresseLivraison.nom) && (
                                          <div className="font-bold text-white">
                                            {p.adresseLivraison.prenom}{" "}
                                            {p.adresseLivraison.nom}
                                          </div>
                                        )}
                                        {p.adresseLivraison.adresse && (
                                          <div className="text-sm text-gray-300">
                                            {p.adresseLivraison.adresse}
                                          </div>
                                        )}
                                        {(p.adresseLivraison.codePostal ||
                                          p.adresseLivraison.ville) && (
                                          <div className="text-sm text-gray-300">
                                            {p.adresseLivraison.codePostal}{" "}
                                            {p.adresseLivraison.ville}
                                          </div>
                                        )}
                                        {p.adresseLivraison.pays && (
                                          <div className="text-sm text-gray-300">
                                            {p.adresseLivraison.pays}
                                          </div>
                                        )}
                                        {p.adresseLivraison.telephone && (
                                          <div className="text-sm text-gray-400 mt-2">
                                            Tél: {p.adresseLivraison.telephone}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
