// Import des hooks React et de la bibliothèque Axios pour les appels HTTP
import { useState, useEffect } from "react";
import axios from "axios";

/* -------------------------------------------------------------------------
   🧩 Définition du type Panier (structure d’un panier)
------------------------------------------------------------------------- */
interface Panier {
  _id?: string; // ID généré par la BDD (optionnel avant création)
  utilisateur: string;
  articles: string; // Chaîne représentant les articles (à remplacer par un tableau dans une version avancée)
  total: number; // Montant total du panier
}

// URL de l'API REST côté serveur
// const API_URL = "http://localhost:5001/api/paniers";
const API_URL = `${import.meta.env.VITE_API_URL}/api/paniers`;

/* -------------------------------------------------------------------------
   📦 Composant principal : gestion des paniers (CRUD complet)
------------------------------------------------------------------------- */
export default function GestionPaniers() {
  /* 🌐 États pour la gestion */
  const [paniers, setPaniers] = useState<Panier[]>([]); // Liste des paniers
  const [form, setForm] = useState<Panier>({
    utilisateur: "",
    articles: "",
    total: 0,
  }); // Données du formulaire
  const [editId, setEditId] = useState<string | null>(null); // ID du panier à modifier (null = ajout)
  const [loading, setLoading] = useState(false); // État de chargement
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs

  /* -------------------------------------------------------------------------
     🔃 Chargement initial des paniers à l'ouverture du composant
  ------------------------------------------------------------------------- */
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Authentification via token
      })
      .then((r) => {
        if (Array.isArray(r.data)) setPaniers(r.data);
        else setPaniers([]);
      })
      .catch((e) => {
        setError(
          e?.response?.data?.message || "Erreur lors du chargement des paniers."
        );
        setPaniers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* -------------------------------------------------------------------------
     📝 Gestion des champs du formulaire
  ------------------------------------------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Réinitialise le formulaire et désactive le mode édition
  const resetForm = () => {
    setForm({ utilisateur: "", articles: "", total: 0 });
    setEditId(null);
  };

  /* -------------------------------------------------------------------------
     ✅ Soumission du formulaire (ajout ou modification)
  ------------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editId) {
        // Mise à jour d’un panier existant
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // Création d’un nouveau panier
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // Rafraîchissement des paniers après l’opération
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaniers(Array.isArray(res.data) ? res.data : []);
      resetForm(); // Vide le formulaire après enregistrement
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Erreur lors de l'enregistrement du panier."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------
     ✏️ Préparer la modification d’un panier
  ------------------------------------------------------------------------- */
  const handleEdit = (p: Panier) => {
    setForm(p);
    setEditId(p._id || null);
  };

  /* -------------------------------------------------------------------------
     ❌ Supprimer un panier existant
  ------------------------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaniers(paniers.filter((p) => p._id !== id));
      resetForm();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "Erreur lors de la suppression du panier."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------
     🎨 Affichage du formulaire et du tableau
  ------------------------------------------------------------------------- */
  return (
    <div>
      {/* Affichage des erreurs éventuelles */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Formulaire de création / modification de panier */}
      <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
        <input
          name="utilisateur"
          placeholder="Utilisateur"
          value={form.utilisateur}
          onChange={handleChange}
          className="input input-bordered"
          required
        />
        <input
          name="articles"
          placeholder="Articles"
          value={form.articles}
          onChange={handleChange}
          className="input input-bordered"
          required
        />
        <input
          name="total"
          type="number"
          placeholder="Total"
          value={form.total}
          onChange={handleChange}
          className="input input-bordered"
          required
        />
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

      {/* Affichage du tableau des paniers */}
      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : paniers.length === 0 ? (
        <div className="text-center text-gray-500">Aucun panier trouvé.</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Articles</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paniers.map((p) => (
              <tr key={p._id}>
                <td>{p.utilisateur}</td>
                <td>{p.articles}</td>
                <td>{p.total}</td>
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
