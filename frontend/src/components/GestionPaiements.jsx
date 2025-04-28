import React, { useEffect, useState } from "react";
import axios from "axios";
import CrudTable from "./CrudTable";

const columns = [
  { key: "utilisateur", label: "Utilisateur" },
  { key: "montant", label: "Montant (€)" },
  { key: "statut", label: "Statut" },
  { key: "date", label: "Date", render: (val) => val ? val.slice(0, 10) : "" },
];

export default function GestionPaiements() {
  const [paiements, setPaiements] = useState([]);
  const [form, setForm] = useState({ utilisateur: "", montant: "", statut: "", date: "" });
  const [editId, setEditId] = useState(null);

  const chargerPaiements = async () => {
    const res = await axios.get("/api/paiements");
    setPaiements(res.data);
  };
  useEffect(() => { chargerPaiements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/api/paiements/${editId}`, form);
    } else {
      await axios.post("/api/paiements", form);
    }
    setForm({ utilisateur: "", montant: "", statut: "", date: "" });
    setEditId(null);
    chargerPaiements();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/paiements/${id}`);
    setPaiements(paiements.filter(p => p._id !== id));
  };

  const handleEdit = (p) => {
    setForm({ utilisateur: p.utilisateur, montant: p.montant, statut: p.statut, date: p.date?.slice(0,10) });
    setEditId(p._id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestion des Paiements</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input className="border p-2 flex-1 min-w-[120px]" type="text" placeholder="Utilisateur" value={form.utilisateur} onChange={e => setForm({ ...form, utilisateur: e.target.value })} required />
        <input className="border p-2 flex-1 min-w-[120px]" type="number" placeholder="Montant" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} required />
        <input className="border p-2 flex-1 min-w-[120px]" type="text" placeholder="Statut" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} required />
        <input className="border p-2 flex-1 min-w-[120px]" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">{editId ? "Modifier" : "Ajouter"}</button>
      </form>
      <CrudTable items={paiements} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
