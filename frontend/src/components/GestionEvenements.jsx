import React, { useEffect, useState } from "react";
import axios from "axios";
import CrudTable from "./CrudTable";

const columns = [
  { key: "titre", label: "Titre" },
  { key: "description", label: "Description" },
  { key: "date", label: "Date", render: (val) => val ? val.slice(0, 10) : "" },
];

export default function GestionEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", date: "" });
  const [editId, setEditId] = useState(null);

  const chargerEvenements = async () => {
    const res = await axios.get("/api/evenements");
    setEvenements(res.data);
  };
  useEffect(() => { chargerEvenements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/api/evenements/${editId}`, form);
    } else {
      await axios.post("/api/evenements", form);
    }
    setForm({ titre: "", description: "", date: "" });
    setEditId(null);
    chargerEvenements();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/evenements/${id}`);
    setEvenements(evenements.filter(ev => ev._id !== id));
  };

  const handleEdit = (ev) => {
    setForm({ titre: ev.titre, description: ev.description, date: ev.date?.slice(0,10) });
    setEditId(ev._id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestion des Événements</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input className="border p-2 flex-1 min-w-[120px]" type="text" placeholder="Titre" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required />
        <input className="border p-2 flex-1 min-w-[120px]" type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input className="border p-2 flex-1 min-w-[120px]" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">{editId ? "Modifier" : "Ajouter"}</button>
      </form>
      <CrudTable items={evenements} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
