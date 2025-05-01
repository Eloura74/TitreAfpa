import React from 'react';
import { Tarif } from '@/types/tarif';
import { useTarifs } from "../../utils/useTarifs";

interface SelectionFormatModalProps {
  type: Tarif['type']; // ex : 'tirage', 'poster', etc.
  onSelect: (tarif: Tarif) => void;
  onClose: () => void;
}

/**
 * Modal de sélection de format/support/prix pour l'ajout au panier.
 * Accessible, responsive, et typé strict.
 */
export const SelectionFormatModal: React.FC<SelectionFormatModalProps> = ({ type, onSelect, onClose }) => {
  const { data: tarifs, isLoading, error } = useTarifs();
  const tarifsFiltres = tarifs?.filter(t => t.type === type && t.actif);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500" aria-label="Fermer">✕</button>
        <h3 className="text-lg font-bold mb-4 text-center">Choisissez le format</h3>
        {isLoading && <p>Chargement...</p>}
        {error && <p className="text-red-500">Erreur lors du chargement des tarifs</p>}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tarifsFiltres && tarifsFiltres.length > 0 ? (
            tarifsFiltres.map(tarif => (
              <li key={tarif.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-medium">{tarif.nom}</span>
                  <span className="ml-2 text-sm text-gray-500">{tarif.format} - {tarif.support}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">{tarif.prix} €</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelect(tarif)}
                    aria-label={`Sélectionner ${tarif.nom} ${tarif.format}`}
                  >
                    Sélectionner
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 py-4 text-center">Aucun format disponible pour ce type.</li>
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
// - Utilisation du hook useTarifs pour la synchro dynamique
