import React from "react";
import { Tarif, TarifOeuvre } from "../../types/tarif";

// Interface des props strictement typée
interface SelectionFormatModalProps {
  tarifs: (TarifOeuvre | Tarif)[]; // Liste des formats/supports/prix à afficher
  onSelect: (tarif: TarifOeuvre | Tarif) => void;
  onClose: () => void;
}

/**
 * Modal de sélection de format/support/prix pour l'ajout au panier.
 * Affiche TOUS les tarifs actifs, sans filtrage par type.
 */
// Modale de sélection de format/support/prix pour l’ajout au panier
export const SelectionFormatModal: React.FC<SelectionFormatModalProps> = ({
  tarifs,
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          aria-label="Fermer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4 text-center">
          Choisissez le format
        </h3>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tarifs && tarifs.length > 0 ? (
            tarifs.map((tarif) => (
              <li
                key={tarif.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  {/* Affiche le nom si c'est un Tarif standard, sinon juste le format */}
                  <span className="font-medium">
                    {('nom' in tarif && tarif.nom) ? tarif.nom : tarif.format}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {tarif.format} - {tarif.support}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">{tarif.prix} €</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelect(tarif)}
                    aria-label={`Sélectionner ${'nom' in tarif && tarif.nom ? tarif.nom : ''} ${tarif.format}`}
                  >
                    Sélectionner
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 py-4 text-center">
              Aucun format disponible.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Bonnes pratiques :
// - Props typées strictement
// - Accessibilité : aria-label sur les boutons, focus piégé à ajouter si besoin
// - Responsive et dark mode via Tailwind
