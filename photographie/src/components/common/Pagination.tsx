/**
 * 📄 COMPOSANT PAGINATION
 * 
 * Pagination moderne avec :
 * - Boutons Précédent/Suivant
 * - Numéros de pages avec ellipses (...)
 * - Affichage adaptatif mobile/desktop
 * - Scroll to top automatique au changement de page
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** Page courante (1-indexed) */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Callback appelé au changement de page */
  onPageChange: (page: number) => void;
  /** Scroll vers le haut au changement de page */
  scrollToTop?: boolean;
  /** Offset du scroll (défaut: 100px) */
  scrollOffset?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  scrollToTop = true,
  scrollOffset = 100,
}) => {
  // Si une seule page, ne rien afficher
  if (totalPages <= 1) return null;

  /**
   * Génère les numéros de pages à afficher avec ellipses
   * Ex: [1, 2, ..., 5, 6, 7, ..., 15, 16]
   */
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Nombre de pages avant/après la page courante

    for (let i = 1; i <= totalPages; i++) {
      // Toujours afficher première et dernière page
      if (i === 1 || i === totalPages) {
        pages.push(i);
      }
      // Afficher pages autour de la page courante
      else if (i >= currentPage - delta && i <= currentPage + delta) {
        pages.push(i);
      }
      // Ajouter ellipses si gap
      else if (
        (i === currentPage - delta - 1 && currentPage - delta > 2) ||
        (i === currentPage + delta + 1 && currentPage + delta < totalPages - 1)
      ) {
        if (pages[pages.length - 1] !== '...') {
          pages.push('...');
        }
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  /**
   * Gère le changement de page
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    onPageChange(page);

    // Scroll vers le haut
    if (scrollToTop) {
      window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 py-8"
    >
      {/* Bouton Précédent */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${
            currentPage === 1
              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-[#ffe992] hover:text-black'
          }
        `}
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Précédent</span>
      </motion.button>

      {/* Numéros de pages */}
      <div className="flex items-center gap-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <motion.button
              key={pageNumber}
              whileHover={{ scale: isActive ? 1 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pageNumber)}
              className={`
                px-4 py-2 rounded-lg font-bold transition-all
                ${
                  isActive
                    ? 'bg-[#ffe992] text-black scale-110 shadow-lg shadow-[#ffe992]/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }
              `}
            >
              {pageNumber}
            </motion.button>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${
            currentPage === totalPages
              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-[#ffe992] hover:text-black'
          }
        `}
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
};

export default Pagination;
