// Composant générique pour afficher et gérer un tableau CRUD (TypeScript)
import React from 'react';

// Définition des types pour les props
interface Colonne<T> {
  key: keyof T;
  label: string;
  render?: (valeur: any, item: T) => React.ReactNode;
}

interface Props<T> {
  items: T[];
  columns: Colonne<T>[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

// Composant fonctionnel générique
function CrudTable<T extends { _id: string }>({ items, columns, onEdit, onDelete }: Props<T>) {
  return (
    <table className="w-full border text-sm">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)} className="border p-2 bg-gray-100">{col.label}</th>
          ))}
          <th className="border p-2 bg-gray-100">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item._id} className="hover:bg-gray-50">
            {columns.map(col => (
              <td key={String(col.key)} className="border p-2">
                {col.render ? col.render(item[col.key], item) : String(item[col.key])}
              </td>
            ))}
            <td className="border p-2 flex gap-2">
              <button className="bg-yellow-400 px-2 py-1 rounded" onClick={() => onEdit(item)}>Modifier</button>
              <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(item._id)}>Supprimer</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CrudTable;
