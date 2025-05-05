// Import des hooks React nécessaires et de la bibliothèque Axios pour les requêtes HTTP
import { useState, useEffect } from "react";
import axios from "axios";

/* -------------------------------------------------------------------------
   🧩 Interface TypeScript : structure d’un paiement
   - "_id" est optionnel car généré côté backend
------------------------------------------------------------------------- */
interface Paiement {
  _id?: string;
  montant: number;
  date: string;
  utilisateur: string;
}

// URL de l'API REST pour accéder aux paiements
const API_URL = "http://localhost:5001/api/paiements";

export default function GestionPaiements() {
  /* -------------------------------------------------------------------------
     🧠 États React pour la gestion du CRUD
  ------------------------------------------------------------------------- */
  const [paiements, setPaiements] = useState<Paiement[]>([]); // Liste des paiements récupérés
  const [form, setForm] = useState<Paiement>({
    montant: 0,
    date: "",
    utilisateur: "",
  }); // Formulaire
  const [editId, setEditId] = useState<string | null>(null); // ID du paiement en cours de modification
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState<string | null>(null); // Message d'erreur éventuel

  /* -------------------------------------------------------------------------
     📦 Chargement initial des paiements à la première ouverture du composant
  ------------------------------------------------------------------------- */
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Auth via token localStorage
      })
      .then((r) => {
        if (Array.isArray(r.data)) setPaiements(r.data);
        else setPaiements([]);
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

  /* -------------------------------------------------------------------------
     📝 Mise à jour des champs du formulaire lors de la saisie
  ------------------------------------------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Réinitialisation du formulaire et sortie du mode édition
  const resetForm = () => {
    setForm({ montant: 0, date: "", utilisateur: "" });
    setEditId(null);
  };

  /* -------------------------------------------------------------------------
     ✅ Soumission du formulaire : ajout ou modification
  ------------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editId) {
        // Modification d’un paiement existant
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // Création d’un nouveau paiement
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      // Rechargement de la liste après modification
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaiements(Array.isArray(res.data) ? res.data : []);
      resetForm(); // Vide le formulaire
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Erreur lors de l'enregistrement du paiement."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------
     ✏️ Préparation de l’édition d’un paiement (remplit le formulaire)
  ------------------------------------------------------------------------- */
  const handleEdit = (p: Paiement) => {
    setForm(p);
    setEditId(p._id || null);
  };

  /* -------------------------------------------------------------------------
     ❌ Suppression d’un paiement
  ------------------------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Mise à jour locale : filtre le paiement supprimé
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

  /* -------------------------------------------------------------------------
     🎨 Rendu de l’interface utilisateur
  ------------------------------------------------------------------------- */
  return (
    <div>
      {/* Affichage des erreurs éventuelles */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Formulaire de création / modification */}
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

        {/* Boutons d’action du formulaire */}
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

      {/* Tableau des paiements */}
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
