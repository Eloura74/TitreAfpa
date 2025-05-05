// Import des hooks React et d'Axios pour les requêtes HTTP
import { useState, useEffect } from "react";
import axios from "axios";

// Interface TypeScript décrivant la structure d'un événement
interface Evenement {
  _id?: string; // ID optionnel (présent uniquement après création en BDD)
  titre: string;
  date: string;
  description: string;
}

// URL de l'API pour interagir avec les événements
const API_URL = "http://localhost:5001/api/evenements";

export default function GestionEvenements() {
  // Liste des événements récupérés depuis l'API
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  // Données du formulaire en cours (ajout ou modification)
  const [form, setForm] = useState<Evenement>({
    titre: "",
    date: "",
    description: "",
  });
  // ID de l’événement en cours de modification (null = ajout)
  const [editId, setEditId] = useState<string | null>(null);
  // État de chargement pour afficher un indicateur
  const [loading, setLoading] = useState(false);
  // Gestion des erreurs (affichées en haut de l'interface)
  const [error, setError] = useState<string | null>(null);

  // Chargement des événements au montage du composant
  useEffect(() => {
    setLoading(true); // Affiche l’indicateur de chargement
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Envoie le token d'authentification
      })
      .then((r) => {
        if (Array.isArray(r.data))
          setEvenements(r.data); // Si la réponse est bien un tableau
        else setEvenements([]);
      })
      .catch((e) => {
        setError(
          e?.response?.data?.message ||
            "Erreur lors du chargement des événements."
        );
        setEvenements([]);
      })
      .finally(() => setLoading(false)); // Termine le chargement
  }, []);

  // Gestion des champs de formulaire (champ modifié dynamiquement)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Réinitialisation du formulaire et de l'état d'édition
  const resetForm = () => {
    setForm({ titre: "", date: "", description: "" });
    setEditId(null);
  };

  // Soumission du formulaire (ajout ou modification)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editId) {
        // Si on est en mode édition → requête PUT
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // Sinon, on ajoute un nouvel événement → requête POST
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      // Mise à jour de la liste après opération
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvenements(Array.isArray(res.data) ? res.data : []);
      resetForm(); // On vide le formulaire après ajout/modif
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Erreur lors de l'enregistrement de l'événement."
      );
    } finally {
      setLoading(false);
    }
  };

  // Clique sur le bouton "modifier" → on remplit le formulaire avec l'événement sélectionné
  const handleEdit = (evt: Evenement) => {
    setForm(evt); // Remplit les champs avec les données de l’événement
    setEditId(evt._id || null); // Active le mode édition
  };

  // Suppression d’un événement
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Mise à jour locale de la liste après suppression
      setEvenements(evenements.filter((e) => e._id !== id));
      resetForm();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Erreur lors de la suppression de l'événement."
      );
    } finally {
      setLoading(false);
    }
  };

  // Affichage de l’interface
  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">
        Gestion <span className="text-white">des Événements</span>
      </h2>

      {/* Affichage des erreurs */}
      {error && <div className="text-red-400 mb-2">{error}</div>}

      {/* Formulaire d'ajout / modification */}
      <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmit}>
        <input
          name="titre"
          placeholder="Titre"
          value={form.titre}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffe992] transition"
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffe992] transition"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffe992] transition resize-none"
          required
        />
        {/* Boutons Ajouter/Modifier et Annuler */}
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

      {/* Liste des événements */}
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
                  {/* Bouton modifier */}
                  <button
                    className="bg-yellow-300 text-black rounded px-2 py-1 mr-2 hover:bg-yellow-200 transition"
                    onClick={() => handleEdit(evt)}
                  >
                    ✏️
                  </button>
                  {/* Bouton supprimer */}
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
