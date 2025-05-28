// =======================
// 📦 Import des modules
// =======================

// Hooks React pour gérer les états et effets
import { useState, useEffect } from "react";
// Librairie Axios pour faire des requêtes HTTP
import axios from "axios";

// ============================
// 🧩 Définition du type Evenement
// ============================
interface Evenement {
  _id?: string; // L’ID est optionnel car il est généré par MongoDB
  titre: string; // Titre de l’événement
  date: string; // Date de l’événement (au format texte ISO)
  description: string; // Description de l’événement
}

// URL de base de l’API, récupérée depuis les variables d’environnement Vite
const API_URL = `${import.meta.env.VITE_API_URL}/api/evenements`;

// ==========================================
// 🎯 Composant principal de gestion des événements
// ==========================================
export default function GestionEvenements() {
  // === ÉTATS ===

  // Liste des événements à afficher
  const [evenements, setEvenements] = useState<Evenement[]>([]);

  // Formulaire actuel (titre, date, description)
  const [form, setForm] = useState<Evenement>({
    titre: "",
    date: "",
    description: "",
  });

  // ID de l’événement qu’on édite actuellement (null = on ajoute)
  const [editId, setEditId] = useState<string | null>(null);

  // Affichage du chargement (utile pendant les appels API)
  const [loading, setLoading] = useState(false);

  // Message d’erreur à afficher si une requête échoue
  const [error, setError] = useState<string | null>(null);

  // ================================
  // 🔁 Chargement initial des événements
  // ================================
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((r) => {
        if (Array.isArray(r.data))
          setEvenements(r.data); // Vérifie qu'on a bien un tableau
        else setEvenements([]);
      })
      .catch((e) => {
        setError(e?.response?.data?.message || "Erreur lors du chargement.");
        setEvenements([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ================================
  // 🎯 Mise à jour du formulaire lors d’une saisie
  // ================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Réinitialise le formulaire
  const resetForm = () => {
    setForm({ titre: "", date: "", description: "" });
    setEditId(null);
  };

  // ================================
  // ✅ Envoi du formulaire (ajout ou modification)
  // ================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editId) {
        // Mode édition : on met à jour un événement existant
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // Mode ajout : on ajoute un nouvel événement
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // Recharge la liste à jour depuis le serveur
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEvenements(Array.isArray(res.data) ? res.data : []);
      resetForm(); // On vide le formulaire
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "Erreur lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // ✏️ Remplit le formulaire avec un événement existant
  // ================================
  const handleEdit = (evt: Evenement) => {
    setForm(evt);
    setEditId(evt._id || null);
  };

  // ================================
  // 🗑️ Supprime un événement
  // ================================
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Mise à jour de la liste côté frontend
      setEvenements(evenements.filter((e) => e._id !== id));
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 🖥️ Affichage de l’interface
  // ================================
  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">
        Gestion <span className="text-white">des Événements</span>
      </h2>

      {/* Affiche les erreurs éventuelles */}
      {error && <div className="text-red-400 mb-2">{error}</div>}

      {/* Formulaire de création ou modification */}
      <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
        <input
          name="titre"
          placeholder="Titre"
          value={form.titre}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white resize-none"
          required
        />
        {/* Boutons Ajouter/Modifier + Annuler */}
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition"
            disabled={loading}
          >
            {editId ? "Modifier" : "Ajouter"}
          </button>
          {editId && (
            <button
              type="button"
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
              onClick={resetForm}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Affichage de la liste des événements */}
      {loading ? (
        <div className="text-center text-gray-400">Chargement...</div>
      ) : evenements.length === 0 ? (
        <div className="text-center text-gray-500">Aucun événement trouvé.</div>
      ) : (
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[#ffe992] text-lg">
              <th className="px-2">Titre</th>
              <th className="px-2">Date</th>
              <th className="px-2">Description</th>
              <th className="px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {evenements.map((evt) => (
              <tr
                key={evt._id}
                className="bg-[#232336] hover:bg-[#ffe992]/10 transition rounded"
              >
                <td className="px-2 py-1 text-white">{evt.titre}</td>
                <td className="px-2 py-1 text-white">{evt.date}</td>
                <td className="px-2 py-1 text-white">{evt.description}</td>
                <td className="px-2 py-1">
                  {/* Bouton Modifier */}
                  <button
                    className="bg-yellow-300 text-black rounded px-2 py-1 mr-2 hover:bg-yellow-200 transition"
                    onClick={() => handleEdit(evt)}
                  >
                    ✏️
                  </button>
                  {/* Bouton Supprimer */}
                  <button
                    className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition"
                    onClick={() => evt._id && handleDelete(evt._id)}
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
