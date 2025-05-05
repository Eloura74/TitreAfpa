// Import de React (utile pour JSX même si les hooks ne sont pas utilisés ici)
import React from "react";

/* -------------------------------------------------------------------------
   🧩 TYPES : Définition des types TypeScript pour rendre le composant générique
------------------------------------------------------------------------- */

// Représente une colonne dans le tableau : clé du champ, libellé à afficher, et optionnellement un rendu personnalisé
interface Colonne<T> {
  key: keyof T; // La clé correspond à une propriété de l'objet T
  label: string; // Texte à afficher dans l'en-tête du tableau
  render?: (valeur: any, item: T) => React.ReactNode; // Fonction pour afficher un contenu personnalisé
}

// Props attendues par le composant CrudTable
interface Props<T> {
  items: T[]; // Liste des objets à afficher dans le tableau
  columns: Colonne<T>[]; // Liste des colonnes (clé + label + render optionnel)
  onEdit: (item: T) => void; // Fonction appelée quand on clique sur "Modifier"
  onDelete: (id: string) => void; // Fonction appelée quand on clique sur "Supprimer"
}

/* -------------------------------------------------------------------------
   📦 COMPOSANT : Tableau CRUD générique fonctionnel
   - T doit avoir une clé "_id" (identifiant unique)
   - Représente un tableau affichant dynamiquement des colonnes
------------------------------------------------------------------------- */
function CrudTable<T extends { _id: string }>({
  items,
  columns,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <table className="w-full border text-sm">
      {/* En-tête du tableau */}
      <thead>
        <tr>
          {/* Génère dynamiquement les colonnes à partir des props */}
          {columns.map((col) => (
            <th
              key={String(col.key)} // clé unique pour React
              className="border p-2 bg-gray-100"
            >
              {col.label} {/* Libellé affiché */}
            </th>
          ))}
          <th className="border p-2 bg-gray-100">Actions</th>
        </tr>
      </thead>

      {/* Corps du tableau */}
      <tbody>
        {items.map((item) => (
          <tr key={item._id} className="hover:bg-gray-50">
            {/* Affiche les colonnes de chaque ligne */}
            {columns.map((col) => (
              <td key={String(col.key)} className="border p-2">
                {/* Si un render custom est fourni, on l'utilise, sinon valeur brute */}
                {col.render
                  ? col.render(item[col.key], item)
                  : String(item[col.key])}
              </td>
            ))}
            {/* Colonne des actions */}
            <td className="border p-2 flex gap-2">
              <button
                className="bg-yellow-400 px-2 py-1 rounded"
                onClick={() => onEdit(item)}
              >
                Modifier
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => onDelete(item._id)}
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Export du composant pour l'utiliser dans d'autres fichiers
export default CrudTable;
