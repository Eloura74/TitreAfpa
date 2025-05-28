// =======================
// 📦 Import des modules
// =======================
import { useState, useEffect } from "react"; // Hooks React
import axios from "axios"; // Librairie pour les appels HTTP

/* -------------------------------------------------------------------------
   🧩 Interface TypeScript : structure d’un panier
------------------------------------------------------------------------- */
interface Panier {
  _id?: string; // Identifiant MongoDB (optionnel dans le formulaire)
  utilisateur: string; // Nom de l'utilisateur associé
  articles: string; // Contenu du panier (simplifié en texte ici)
  total: number; // Montant total du panier
}

// URL d’accès à l’API REST définie dans .env (via Vite)
const API_URL = `${import.meta.env.VITE_API_URL}/api/paniers`;

// =====================================================================
// 🎯 Composant principal : gestion CRUD des paniers
// =====================================================================
export default function GestionPaniers() {
  /* -------------------------------------------------------------------------
     🧠 États utilisés dans le composant
  ------------------------------------------------------------------------- */
  const [paniers, setPaniers] = useState<Panier[]>([]); // Liste globale des paniers
  const [form, setForm] = useState<Panier>({
    utilisateur: "",
    articles: "",
    total: 0,
  }); // Données du formulaire (mode ajout/modif)
  const [editId, setEditId] = useState<string | null>(null); // ID du panier modifié (null = mode ajout)
  const [loading, setLoading] = useState(false); // Booléen : est-ce qu’on charge ?
  const [error, setError] = useState<string | null>(null); // Message d’erreur s’il y a un souci

  /* -------------------------------------------------------------------------
     🔃 Récupération initiale des paniers à l’affichage du composant
  ------------------------------------------------------------------------- */
  useEffect(() => {
    setLoading(true); // Active le mode "chargement"
    axios
      .get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Authentification avec JWT local
        },
      })
      .then((r) => {
        if (Array.isArray(r.data)) setPaniers(r.data); // Stocke les paniers
        else setPaniers([]); // Sûreté si la réponse n’est pas un tableau
      })
      .catch((e) => {
        setError(
          e?.response?.data?.message || "Erreur lors du chargement des paniers."
        );
        setPaniers([]); // Vide la liste si erreur
      })
      .finally(() => setLoading(false)); // On désactive le "loading"
  }, []);

  /* -------------------------------------------------------------------------
     ✏️ Mise à jour des champs lors de la saisie dans le formulaire
  ------------------------------------------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value }); // Mise à jour dynamique
  };

  // 🧼 Réinitialise le formulaire et sort du mode édition
  const resetForm = () => {
    setForm({ utilisateur: "", articles: "", total: 0 });
    setEditId(null);
  };

  /* -------------------------------------------------------------------------
     ✅ Envoi du formulaire : création ou mise à jour selon editId
  ------------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true);
    setError(null);

    try {
      if (editId) {
        // Mode édition → mise à jour (PUT)
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } else {
        // Mode création → ajout (POST)
        await axios.post(API_URL, form, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      // 🔄 Recharge les paniers depuis l'API après modification
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPaniers(Array.isArray(res.data) ? res.data : []);
      resetForm(); // Réinitialise les champs
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
     🖊️ Clique sur le bouton "Modifier" → Pré-remplit le formulaire
  ------------------------------------------------------------------------- */
  const handleEdit = (p: Panier) => {
    setForm(p);
    setEditId(p._id || null);
  };

  /* -------------------------------------------------------------------------
     ❌ Suppression d’un panier avec confirmation backend
  ------------------------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Mise à jour de l'état local après suppression
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
     🎨 Rendu visuel du formulaire et du tableau
  ------------------------------------------------------------------------- */
  return (
    <div>
      {/* Affiche une erreur si elle est présente */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Formulaire pour créer ou modifier un panier */}
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

        {/* Boutons : Ajouter/Modifier + Annuler (si édition) */}
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

      {/* Affichage conditionnel du tableau ou d’un message de chargement */}
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
                  {/* Boutons d'action : édition et suppression */}
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
