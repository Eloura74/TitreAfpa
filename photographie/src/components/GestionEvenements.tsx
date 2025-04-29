// Gestion des événements (CRUD)
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Evenement {
  _id?: string;
  titre: string;
  date: string;
  description: string;
}

const API_URL = "http://localhost:5001/api/evenements";

export default function GestionEvenements() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [form, setForm] = useState<Evenement>({ titre: '', date: '', description: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => {
        if (Array.isArray(r.data)) setEvenements(r.data);
        else setEvenements([]);
      })
      .catch(e => {
        setError(e?.response?.data?.message || "Erreur lors du chargement des événements.");
        setEvenements([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const resetForm = () => {
    setForm({ titre: '', date: '', description: '' });
    setEditId(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvenements(Array.isArray(res.data) ? res.data : []);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de l'enregistrement de l'événement.");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (evt: Evenement) => {
    setForm(evt);
    setEditId(evt._id || null);
  };
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvenements(evenements.filter(e => e._id !== id));
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la suppression de l'événement.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-[#181824] rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-6 border border-[#ffe992]/20">
      <h2 className="text-2xl font-bold mb-4 text-[#ffe992]">Gestion <span className="text-white">des Événements</span></h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
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
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-[#ffe992] text-black font-semibold px-6 py-2 rounded hover:bg-[#d6c487] transition" disabled={loading}>
            {editId ? 'Modifier' : 'Ajouter'}
          </button>
          {editId && (
            <button type="button" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>
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
            {evenements.map(evt => (
              <tr key={evt._id} className="bg-[#232336] hover:bg-[#ffe992]/10 transition rounded">
                <td className="px-2 py-1 text-white">{evt.titre}</td>
                <td className="px-2 py-1 text-white">{evt.date}</td>
                <td className="px-2 py-1 text-white">{evt.description}</td>
                <td className="px-2 py-1">
                  <button className="bg-yellow-300 text-black rounded px-2 py-1 mr-2 hover:bg-yellow-200 transition" onClick={() => handleEdit(evt)}>✏️</button>
                  <button className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition" onClick={() => evt._id && handleDelete(evt._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
