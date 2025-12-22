// -----------------------------------------------------------------------------
// 📦 CrudTable : composant générique pour afficher un tableau avec des actions CRUD
// Ce composant est réutilisable pour n’importe quelle entité disposant d’un _id
// -----------------------------------------------------------------------------

// Import de React nécessaire pour utiliser JSX même si on n’utilise pas de hook ici
import React from "react";

/* ---------------------------------------------------------------------------
   🧩 TYPES : Définition des types génériques TypeScript pour le composant
--------------------------------------------------------------------------- */

// Définition d’un type de colonne générique
interface Colonne<T> {
  key: keyof T; // Clé du champ dans l’objet (ex : "nom", "email", etc.)
  label: string; // Texte affiché dans l'en-tête de colonne
  render?: (valeur: T[keyof T], item: T) => React.ReactNode; // Fonction pour personnaliser l'affichage de cette cellule
}

// Définition des props attendues par le composant
interface Props<T> {
  items: T[]; // Liste des objets à afficher
  columns: Colonne<T>[]; // Liste des colonnes à afficher
  onEdit: (item: T) => void; // Fonction à appeler lors du clic sur "Modifier"
  onDelete: (id: string) => void; // Fonction à appeler lors du clic sur "Supprimer"
}

/* ----------------------------------------------------------------------------
   💡 Composant principal : tableau de gestion CRUD
   T est un type générique étendu avec "_id", obligatoire pour les clés uniques
---------------------------------------------------------------------------- */
function CrudTable<T extends { _id: string }>({
  items,
  columns,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <table className="w-full border text-sm">
      {/* === En-tête du tableau === */}
      <thead>
        <tr>
          {/* Génère les entêtes de colonnes dynamiquement */}
          {columns.map((col) => (
            <th
              key={String(col.key)} // Chaque colonne doit avoir une clé unique
              className="border p-2 bg-gray-100"
            >
              {col.label} {/* Texte affiché en en-tête */}
            </th>
          ))}
          {/* Colonne supplémentaire pour les actions Modifier / Supprimer */}
          <th className="border p-2 bg-gray-100">Actions</th>
        </tr>
      </thead>

      {/* === Corps du tableau === */}
      <tbody>
        {/* Boucle sur chaque ligne à afficher */}
        {items.map((item) => (
          <tr key={item._id} className="hover:bg-gray-50">
            {/* Boucle sur chaque colonne à afficher pour l’objet courant */}
            {columns.map((col) => (
              <td key={String(col.key)} className="border p-2">
                {/* Affichage de la valeur :
                    - Si une fonction `render` est fournie → on l’utilise
                    - Sinon on convertit la valeur brute en texte */}
                {col.render
                  ? col.render(item[col.key], item)
                  : String(item[col.key])}
              </td>
            ))}

            {/* === Cellule contenant les actions Modifier / Supprimer === */}
            <td className="border p-2 flex gap-2">
              {/* Bouton "Modifier" → déclenche la fonction onEdit */}
              <button
                className="bg-yellow-400 px-2 py-1 rounded"
                onClick={() => onEdit(item)}
              >
                Modifier
              </button>

              {/* Bouton "Supprimer" → déclenche la fonction onDelete */}
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

// Export du composant pour pouvoir l’utiliser ailleurs dans l’application
export default CrudTable;
