import React, { useEffect, useState } from "react";
import axios from "axios";
import CrudTable from "./CrudTable";

const columns = [
  { key: "utilisateur", label: "Utilisateur" },
  { key: "articles", label: "Articles", render: (val) => val && val.length ? val.length + " article(s)" : "0" },
  { key: "date", label: "Date", render: (val) => val ? val.slice(0, 10) : "" },
];

export default function GestionPaniers() {
  const [paniers, setPaniers] = useState([]);
  const [form, setForm] = useState({ utilisateur: "", articles: [], date: "" });
  const [editId, setEditId] = useState(null);

  const chargerPaniers = async () => {
    const res = await axios.get("/api/paniers");
    setPaniers(res.data);
  };
  useEffect(() => { chargerPaniers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/api/paniers/${editId}`, form);
    } else {
      await axios.post("/api/paniers", form);
    }
    setForm({ utilisateur: "", articles: [], date: "" });
    setEditId(null);
    chargerPaniers();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/paniers/${id}`);
    setPaniers(paniers.filter(p => p._id !== id));
  };

  const handleEdit = (p) => {
    setForm({ utilisateur: p.utilisateur, articles: p.articles, date: p.date?.slice(0,10) });
    setEditId(p._id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestion des Paniers</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input className="border p-2 flex-1 min-w-[120px]" type="text" placeholder="Utilisateur" value={form.utilisateur} onChange={e => setForm({ ...form, utilisateur: e.target.value })} required />
        {/* Pour la démo, on ne gère pas la modification des articles ici */}
        <input className="border p-2 flex-1 min-w-[120px]" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">{editId ? "Modifier" : "Ajouter"}</button>
      </form>
      <CrudTable items={paniers} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
