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
// On importe le type Evenement depuis le dossier types
import { Evenement } from "../types/evenement";

// URL de base de l’API, récupérée depuis les variables d’environnement Vite
import { API_URL as BASE_API_URL } from "../config/api";
const API_URL = `${BASE_API_URL}/api/evenements`;

// ==========================================
// 🎯 Composant principal de gestion des événements
// ==========================================
export default function GestionEvenements() {
  // === ÉTATS ===

  // Liste des événements à afficher
  const [evenements, setEvenements] = useState<Evenement[]>([]);

  // Formulaire actuel (correspond au type Evenement)
  const [form, setForm] = useState<Evenement>({
    id: "",
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    image: "",
    lieu: "",
    photos: [],
    theme: "",
  });

  // Prévisualisation de l'image uploadée
  const [imagePreview, setImagePreview] = useState<string>("");

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

  // Réinitialise le formulaire (tous les champs)
  const resetForm = () => {
    setForm({
      id: "",
      titre: "",
      description: "",
      dateDebut: "",
      dateFin: "",
      image: "",
      lieu: "",
      photos: [],
      theme: "",
    });
    setImagePreview("");
    setEditId(null);
  };

  // ================================
  // 📷 Gestion de l'upload et de la prévisualisation de l'image
  // ================================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ================================
  // ✅ Envoi du formulaire (ajout ou modification)
  // ================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // On crée une copie de l'objet form pour le nettoyer avant envoi
      // On retire l'id et _id car ils ne doivent pas être envoyés dans le body pour une modification (Mongoose n'aime pas qu'on essaie de modifier l'id)
      const { id, _id, ...dataToSend } = form as any;

      if (editId) {
        // Mode édition : on met à jour un événement existant
        await axios.put(`${API_URL}/${editId}`, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // Mode ajout : on ajoute un nouvel événement
        await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // Recharge la liste à jour depuis le serveur
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEvenements(Array.isArray(res.data) ? res.data : []);
      resetForm(); // On vide le formulaire
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message || "Erreur lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // ✏️ Remplit le formulaire avec un événement existant
  // ================================
  const handleEdit = (evt: Evenement) => {
    setForm({
      ...evt,
      id: evt.id || "",
      dateDebut: evt.dateDebut ? evt.dateDebut.split('T')[0] : "", // Format date pour input type="date"
      dateFin: evt.dateFin ? evt.dateFin.split('T')[0] : "",
      image: evt.image || "",
      lieu: evt.lieu || "",
      description: evt.description || "",
      photos: evt.photos || [],
      theme: evt.theme || "",
    });
    setImagePreview(evt.image || "");
    setEditId(evt.id || null);
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
      setEvenements(evenements.filter((e) => e.id !== id));
      resetForm();
    } catch (e) {
      const err = e as any;
      setError(err?.response?.data?.message || "Erreur lors de la suppression.");
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
        {/* Champ image de couverture */}
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Prévisualisation"
            className="w-32 h-20 object-cover rounded"
          />
        )}
        <input
          name="titre"
          placeholder="Titre"
          value={form.titre}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
          required
        />
        {/* Champ date de début */}
        <input
          name="dateDebut"
          type="date"
          value={form.dateDebut}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
          required
        />
        {/* Champ date de fin */}
        <input
          name="dateFin"
          type="date"
          value={form.dateFin}
          onChange={handleChange}
          className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
          required
        />
          <input
            name="lieu"
            placeholder="Lieu (ex: Paris, Lyon...)"
            value={form.lieu}
            onChange={handleChange}
            className="bg-[#232336] border border-[#ffe992]/30 rounded px-4 py-2 text-white"
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
                <th className="px-2">Lieu</th>
                <th className="px-2">Début</th>
                <th className="px-2">Fin</th>
                <th className="px-2">Description</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evenements.map((event) => (
                <tr
                  key={event.id || event._id || Math.random()}
                  className="bg-[#232336] hover:bg-[#ffe992]/10 transition rounded"
                >
                  <td className="px-2 py-1 text-white">{event.titre}</td>
                  <td className="px-2 py-1 text-white">{event.lieu || "-"}</td>
                  <td className="px-2 py-1 text-white">{event.dateDebut}</td>
                  <td className="px-2 py-1 text-white">{event.dateFin}</td>
                  <td className="px-2 py-1 text-white">{event.description}</td>
                <td className="px-2 py-1">
                  <button
                    className="bg-yellow-300 text-black rounded px-2 py-1 mr-2 hover:bg-yellow-200 transition"
                    onClick={() => handleEdit(event)}
                  >
                    ✏️
                  </button>
                  <button
                    className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition"
                    onClick={() => event.id && handleDelete(event.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* 🖼️ Image de couverture (avec fallback si absente) */}
      {evenements.map((event) => (
        <div key={event.id}>
          {event.image && (
            <img
              src={event.image}
              alt={event.titre}
              className="w-full h-32 object-cover rounded-t"
            />
          )}
        </div>
      ))}
    </div>
  );
}
