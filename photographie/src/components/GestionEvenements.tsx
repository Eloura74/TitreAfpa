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
    <div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
        <input name="titre" placeholder="Titre" value={form.titre} onChange={handleChange} className="input input-bordered" required />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="input input-bordered" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="input input-bordered" required />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editId ? 'Modifier' : 'Ajouter'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>}
        </div>
      </form>
      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : evenements.length === 0 ? (
        <div className="text-center text-gray-500">Aucun événement trouvé.</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {evenements.map(evt => (
              <tr key={evt._id}>
                <td>{evt.titre}</td>
                <td>{evt.date}</td>
                <td>{evt.description}</td>
                <td>
                  <button className="btn btn-xs btn-warning mr-2" onClick={() => handleEdit(evt)}>✏️</button>
                  <button className="btn btn-xs btn-error" onClick={() => evt._id && handleDelete(evt._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
