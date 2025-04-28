// Gestion des paniers (CRUD)
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Panier {
  _id?: string;
  utilisateur: string;
  articles: string;
  total: number;
}

const API_URL = "http://localhost:5001/api/paniers";

export default function GestionPaniers() {
  const [paniers, setPaniers] = useState<Panier[]>([]);
  const [form, setForm] = useState<Panier>({ utilisateur: '', articles: '', total: 0 });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => {
        if (Array.isArray(r.data)) setPaniers(r.data);
        else setPaniers([]);
      })
      .catch(e => {
        setError(e?.response?.data?.message || "Erreur lors du chargement des paniers.");
        setPaniers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const resetForm = () => {
    setForm({ utilisateur: '', articles: '', total: 0 });
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
      setPaniers(Array.isArray(res.data) ? res.data : []);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de l'enregistrement du panier.");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (p: Panier) => {
    setForm(p);
    setEditId(p._id || null);
  };
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPaniers(paniers.filter(p => p._id !== id));
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la suppression du panier.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
        <input name="utilisateur" placeholder="Utilisateur" value={form.utilisateur} onChange={handleChange} className="input input-bordered" required />
        <input name="articles" placeholder="Articles" value={form.articles} onChange={handleChange} className="input input-bordered" required />
        <input name="total" type="number" placeholder="Total" value={form.total} onChange={handleChange} className="input input-bordered" required />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editId ? 'Modifier' : 'Ajouter'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>}
        </div>
      </form>
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
            {paniers.map(p => (
              <tr key={p._id}>
                <td>{p.utilisateur}</td>
                <td>{p.articles}</td>
                <td>{p.total}</td>
                <td>
                  <button className="btn btn-xs btn-warning mr-2" onClick={() => handleEdit(p)}>✏️</button>
                  <button className="btn btn-xs btn-error" onClick={() => p._id && handleDelete(p._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
