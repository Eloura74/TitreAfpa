// Importation de React
import React from "react";

// Importation des types utilisés (définis ailleurs dans ton projet)
import { Tarif, TarifOeuvre } from "../../types/tarif";

// === Définition des propriétés (props) que le composant attend ===
interface SelectionFormatModalProps {
  tarifs: (TarifOeuvre | Tarif)[]; // Tableau de tarifs à afficher (format/support/prix)
  onSelect: (tarif: TarifOeuvre | Tarif) => void; // Fonction appelée quand on sélectionne un tarif
  onClose: () => void; // Fonction appelée quand on ferme la modale
}

/**
 * Composant modal (fenêtre flottante) permettant de choisir un tarif
 * (format/support/prix) pour ajouter un produit au panier.
 * Il est réutilisable, et affiche tous les formats disponibles passés en props.
 */
export const SelectionFormatModal: React.FC<SelectionFormatModalProps> = ({
  tarifs, // Les données à afficher (formats)
  onSelect, // Fonction à exécuter quand un tarif est sélectionné
  onClose, // Fonction à exécuter quand l'utilisateur ferme la modale
}) => {
  return (
    // --- Arrière-plan noir semi-transparent couvrant tout l'écran ---
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      {/* --- Conteneur de la modale elle-même --- */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* --- Bouton pour fermer la modale (croix en haut à droite) --- */}
        <button
          onClick={onClose} // Appelle la fonction `onClose` passée en props
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          aria-label="Fermer" // Amélioration accessibilité (lecteurs d’écran)
        >
          ✕
        </button>

        {/* --- Titre de la modale --- */}
        <h3 className="text-lg font-bold mb-4 text-center">
          Choisissez le format
        </h3>

        {/* --- Liste des tarifs sous forme de lignes séparées --- */}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Vérifie que la liste n’est pas vide */}
          {tarifs && tarifs.length > 0 ? (
            tarifs.map((tarif) => (
              // Chaque tarif est affiché dans une ligne
              <li
                key={tarif.id} // Clé unique pour React
                className="flex items-center justify-between py-3"
              >
                {/* Bloc gauche avec le nom + détails du tarif */}
                <div>
                  <span className="font-medium">
                    {/* Si c’est un Tarif avec un nom, on l’affiche. Sinon, on montre juste le format */}
                    {"nom" in tarif && tarif.nom ? tarif.nom : tarif.format}
                  </span>
                  {/* Détails supplémentaires (format + support) */}
                  <span className="ml-2 text-sm text-gray-500">
                    {tarif.format} - {tarif.support}
                  </span>
                </div>

                {/* Bloc droit avec le prix + bouton de sélection */}
                <div className="flex items-center gap-2">
                  {/* Affichage du prix en euros */}
                  <span className="text-primary font-bold">{tarif.prix} €</span>

                  {/* Bouton de sélection */}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelect(tarif)} // Appelle la fonction `onSelect` avec le tarif cliqué
                    aria-label={`Sélectionner ${
                      "nom" in tarif && tarif.nom ? tarif.nom : ""
                    } ${tarif.format}`}
                  >
                    Sélectionner
                  </button>
                </div>
              </li>
            ))
          ) : (
            // Si aucun tarif, affiche un message
            <li className="text-gray-500 py-4 text-center">
              Aucun format disponible.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
