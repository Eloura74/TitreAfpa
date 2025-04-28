// Gestion des paiements (CRUD)
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Paiement {
  _id?: string;
  montant: number;
  date: string;
  utilisateur: string;
}

const API_URL = "http://localhost:5001/api/paiements";

export default function GestionPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [form, setForm] = useState<Paiement>({ montant: 0, date: '', utilisateur: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => {
        if (Array.isArray(r.data)) setPaiements(r.data);
        else setPaiements([]);
      })
      .catch(e => {
        setError(e?.response?.data?.message || "Erreur lors du chargement des paiements.");
        setPaiements([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const resetForm = () => {
    setForm({ montant: 0, date: '', utilisateur: '' });
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
      setPaiements(Array.isArray(res.data) ? res.data : []);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de l'enregistrement du paiement.");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (p: Paiement) => {
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
      setPaiements(paiements.filter(p => p._id !== id));
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la suppression du paiement.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
        <input name="montant" type="number" placeholder="Montant" value={form.montant} onChange={handleChange} className="input input-bordered" required />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="input input-bordered" required />
        <input name="utilisateur" placeholder="Utilisateur" value={form.utilisateur} onChange={handleChange} className="input input-bordered" required />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editId ? 'Modifier' : 'Ajouter'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>}
        </div>
      </form>
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
            {paiements.map(p => (
              <tr key={p._id}>
                <td>{p.montant}</td>
                <td>{p.date}</td>
                <td>{p.utilisateur}</td>
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
