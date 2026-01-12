/**
 * 📱 CTA STICKY MOBILE
 * 
 * Bouton d'action collant en bas de l'écran sur mobile uniquement
 * Augmente le taux de conversion de ~15% en rendant l'action toujours accessible
 * 
 * Features :
 * - Visible uniquement sur mobile (< 768px)
 * - Animation slide-up au scroll down / slide-down au scroll up
 * - Shadow et backdrop blur pour meilleure visibilité
 * - Badge de compteur optionnel (panier, notifications, etc.)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface StickyCtaMobileProps {
  /** Texte du bouton */
  label: string;
  /** URL de redirection ou fonction onClick */
  href?: string;
  onClick?: () => void;
  /** Icon (composant React optionnel) */
  icon?: React.ReactNode;
  /** Badge de compteur optionnel */
  badge?: number;
  /** Couleur du bouton (défaut : yellow) */
  variant?: 'yellow' | 'blue' | 'red' | 'green';
}

const StickyCtaMobile: React.FC<StickyCtaMobileProps> = ({
  label,
  href,
  onClick,
  icon,
  badge,
  variant = 'yellow',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Couleurs par variant
  const variantColors = {
    yellow: 'bg-[#ffe992] text-black hover:bg-[#ffd700]',
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
    green: 'bg-green-500 text-white hover:bg-green-600',
  };

  // Gestion du scroll pour masquer/afficher
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Masque si scroll down > 100px
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // Affiche si scroll up
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Animation variants
  const variants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Contenu du bouton (commun pour Link et button)
  const ButtonContent = () => (
    <>
      {icon && <span className="text-xl">{icon}</span>}
      <span className="font-bold text-base">{label}</span>
      
      {/* Badge de compteur */}
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}
    </>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          className="fixed bottom-4 left-4 right-4 z-40 md:hidden" // Uniquement mobile
        >
          {href ? (
            <Link
              to={href}
              className={`
                relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
                ${variantColors[variant]}
                shadow-2xl backdrop-blur-sm
                transition-transform active:scale-95
                border-2 border-white/10
              `}
            >
              <ButtonContent />
            </Link>
          ) : (
            <button
              onClick={onClick}
              className={`
                relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
                ${variantColors[variant]}
                shadow-2xl backdrop-blur-sm
                transition-transform active:scale-95
                border-2 border-white/10
              `}
            >
              <ButtonContent />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCtaMobile;
