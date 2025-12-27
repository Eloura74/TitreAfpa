// =======================
// 📦 Import des modules
// =======================
import { useState, useEffect } from "react"; // Hooks pour gérer l'état et les effets
import axios from "axios"; // Librairie pour les requêtes HTTP

/* -------------------------------------------------------------------------
   🧩 Type TypeScript représentant un paiement
------------------------------------------------------------------------- */
interface Paiement {
  _id?: string;
  montant: number;
  date: string;
  utilisateur?: string; // ID User (optionnel)
  nomClient?: string; // Nom client (PayPal/Invité)
  emailClient?: string; // Email client
  source?: "manuel" | "paypal" | "stripe";
  transactionId?: string;
  statut?: string;
}

// URL de l’API, configurée via la variable d’environnement
import { API_URL as BASE_API_URL } from "../config/api";
const API_URL = `${BASE_API_URL}/api/paiements`;

// =====================================================================
// 🎯 Composant principal de gestion des paiements
// =====================================================================
export default function GestionPaiements() {
  // === États React ===
  const [paiements, setPaiements] = useState<Paiement[]>([]); // Liste complète
  const [form, setForm] = useState<Paiement>({
    montant: 0,
    date: new Date().toISOString().split("T")[0],
    nomClient: "",
    source: "manuel",
  }); // Formulaire actif
  const [editId, setEditId] = useState<string | null>(null); // Mode édition ?
  const [loading, setLoading] = useState(false); // Chargement en cours ?
  const [error, setError] = useState<string | null>(null); // Message d’erreur ?

  // =====================================================
  // 🔁 Chargement initial des paiements à l’ouverture
  // =====================================================
  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = () => {
    setLoading(true);
    axios
      .get(API_URL, {
        withCredentials: true,
      })
      .then((r) => {
        setPaiements(Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => {
        setError(
          e?.response?.data?.message ||
            "Erreur lors du chargement des paiements."
        );
        setPaiements([]);
      })
      .finally(() => setLoading(false));
  };

  // =====================================================
  // 📝 Gestion dynamique des champs du formulaire
  // =====================================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Remise à zéro du formulaire et sortie du mode édition
  const resetForm = () => {
    setForm({
      montant: 0,
      date: new Date().toISOString().split("T")[0],
      nomClient: "",
      source: "manuel",
    });
    setEditId(null);
  };

  // =====================================================
  // ✅ Soumission du formulaire (création ou modification)
  // =====================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true);
    setError(null);

    try {
      if (editId) {
        // 🔁 Modification d’un paiement existant
        await axios.put(`${API_URL}/${editId}`, form, {
          withCredentials: true,
        });
      } else {
        // ➕ Création d’un nouveau paiement
        await axios.post(API_URL, form, {
          withCredentials: true,
        });
      }

      // 🔄 Rafraîchissement de la liste
      fetchPaiements();
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message ||
          "Erreur lors de l'enregistrement du paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ✏️ Pré-remplissage du formulaire pour l’édition
  // =====================================================
  const handleEdit = (p: Paiement) => {
    setForm({
      ...p,
      date: p.date ? new Date(p.date).toISOString().split("T")[0] : "",
    });
    setEditId(p._id || null);
  };

  // =====================================================
  // ❌ Suppression d’un paiement
  // =====================================================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce paiement ?")) return;

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true,
      });

      // Mise à jour de la liste localement
      setPaiements(paiements.filter((p) => p._id !== id));
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message ||
          "Erreur lors de la suppression du paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 🖥️ Rendu visuel du formulaire + tableau des paiements
  // =====================================================
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-yellow-400">
          Historique des Paiements
        </h2>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Total CA
          </span>
          <div className="text-xl font-bold text-white">
            {paiements
              .reduce((acc, p) => acc + (p.montant || 0), 0)
              .toFixed(2)}{" "}
            €
          </div>
        </div>
      </div>

      {/* Affichage d’un message d’erreur si besoin */}
      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* Formulaire de saisie MANUELLE */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">
          {editId ? "Modifier un paiement" : "Ajout manuel (Hors PayPal)"}
        </h3>
        <form className="flex flex-wrap gap-4 items-end" onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label text-xs">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="input input-bordered input-sm"
              required
            />
          </div>
          <div className="form-control">
            <label className="label text-xs">Montant (€)</label>
            <input
              name="montant"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.montant}
              onChange={handleChange}
              className="input input-bordered input-sm w-24"
              required
            />
          </div>
          <div className="form-control flex-grow">
            <label className="label text-xs">Client / Motif</label>
            <input
              name="nomClient"
              placeholder="Ex: Chèque Mme Dupont"
              value={form.nomClient}
              onChange={handleChange}
              className="input input-bordered input-sm w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label text-xs">Source</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className="select select-bordered select-sm"
            >
              <option value="manuel">Manuel</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={loading}
            >
              {editId ? "Mettre à jour" : "Ajouter"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={resetForm}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tableau récapitulatif */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow border border-gray-700">
        <table className="table w-full">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Client</th>
              <th>Détails</th>
              <th>Montant</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <span className="loading loading-spinner"></span>
                </td>
              </tr>
            ) : paiements.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Aucun historique de paiement.
                </td>
              </tr>
            ) : (
              paiements.map((p) => (
                <tr key={p._id} className="hover:bg-gray-700/50">
                  <td className="whitespace-nowrap">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td>
                    {p.source === "paypal" ? (
                      <span className="badge badge-info gap-1 text-xs">
                        PayPal
                      </span>
                    ) : p.source === "stripe" ? (
                      <span className="badge badge-primary gap-1 text-xs">
                        Stripe
                      </span>
                    ) : (
                      <span className="badge badge-ghost gap-1 text-xs">
                        Manuel
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="font-bold text-white">
                      {p.nomClient || p.utilisateur || "Inconnu"}
                    </div>
                    {p.emailClient && (
                      <div className="text-xs text-gray-500">
                        {p.emailClient}
                      </div>
                    )}
                  </td>
                  <td className="text-xs font-mono text-gray-400">
                    {p.transactionId || "-"}
                  </td>
                  <td className="font-bold text-yellow-400">
                    {p.montant?.toFixed(2)} €
                  </td>
                  <td className="text-right">
                    <button
                      className="btn btn-xs btn-square btn-ghost hover:text-blue-400"
                      onClick={() => handleEdit(p)}
                      title="Éditer"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-xs btn-square btn-ghost hover:text-red-400"
                      onClick={() => p._id && handleDelete(p._id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
