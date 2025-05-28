// =======================
// 📦 Import des modules
// =======================
import { useState, useEffect } from "react"; // Hooks pour gérer l'état et les effets
import axios from "axios"; // Librairie pour les requêtes HTTP

/* -------------------------------------------------------------------------
   🧩 Type TypeScript représentant un paiement
------------------------------------------------------------------------- */
interface Paiement {
  _id?: string; // ID unique généré par MongoDB (optionnel pour le formulaire)
  montant: number; // Montant du paiement
  date: string; // Date du paiement (format YYYY-MM-DD)
  utilisateur: string; // Nom de l’utilisateur qui a payé
}

// URL de l’API, configurée via la variable d’environnement
const API_URL = `${import.meta.env.VITE_API_URL}/api/paiements`;

// =====================================================================
// 🎯 Composant principal de gestion des paiements
// =====================================================================
export default function GestionPaiements() {
  // === États React ===
  const [paiements, setPaiements] = useState<Paiement[]>([]); // Liste complète
  const [form, setForm] = useState<Paiement>({
    montant: 0,
    date: "",
    utilisateur: "",
  }); // Formulaire actif
  const [editId, setEditId] = useState<string | null>(null); // Mode édition ?
  const [loading, setLoading] = useState(false); // Chargement en cours ?
  const [error, setError] = useState<string | null>(null); // Message d’erreur ?

  // =====================================================
  // 🔁 Chargement initial des paiements à l’ouverture
  // =====================================================
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
  }, []);

  // =====================================================
  // 📝 Gestion dynamique des champs du formulaire
  // =====================================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Remise à zéro du formulaire et sortie du mode édition
  const resetForm = () => {
    setForm({ montant: 0, date: "", utilisateur: "" });
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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // ➕ Création d’un nouveau paiement
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // 🔄 Rafraîchissement de la liste
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaiements(Array.isArray(res.data) ? res.data : []);
      resetForm();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
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
    setForm(p);
    setEditId(p._id || null);
  };

  // =====================================================
  // ❌ Suppression d’un paiement
  // =====================================================
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Mise à jour de la liste localement
      setPaiements(paiements.filter((p) => p._id !== id));
      resetForm();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
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
    <div>
      {/* Affichage d’un message d’erreur si besoin */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Formulaire de saisie ou de modification */}
      <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
        <input
          name="montant"
          type="number"
          placeholder="Montant"
          value={form.montant}
          onChange={handleChange}
          className="input input-bordered"
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="input input-bordered"
          required
        />
        <input
          name="utilisateur"
          placeholder="Utilisateur"
          value={form.utilisateur}
          onChange={handleChange}
          className="input input-bordered"
          required
        />

        {/* Boutons Ajouter / Modifier + Annuler */}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {editId ? "Modifier" : "Ajouter"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Tableau récapitulatif */}
      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : paiements.length === 0 ? (
        <div className="text-center text-gray-500">Aucun paiement trouvé.</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Montant</th>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map((p) => (
              <tr key={p._id}>
                <td>{p.montant}</td>
                <td>{p.date}</td>
                <td>{p.utilisateur}</td>
                <td>
                  <button
                    className="btn btn-xs btn-warning mr-2"
                    onClick={() => handleEdit(p)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => p._id && handleDelete(p._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
