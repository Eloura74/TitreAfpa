// =============================================================================
// COMPOSANT: PageTitle
// =============================================================================
// Description: Composant réutilisable pour afficher un titre de page stylisé
//              avec un design doré élégant cohérent avec le thème du site.
//              Utilisé sur toutes les pages principales de l'application.
// =============================================================================

import { motion } from "framer-motion";

// -----------------------------------------------------------------------------
// Interface des props du composant
// -----------------------------------------------------------------------------
interface PageTitleProps {
  /** Titre principal de la page (obligatoire) */
  title: string;
  /** Sous-titre optionnel affiché sous le titre principal */
  subtitle?: string;
  /** Si true, affiche une ligne décorative dorée sous le titre */
  showSeparator?: boolean;
}

// -----------------------------------------------------------------------------
// Variantes d'animation Framer Motion
// -----------------------------------------------------------------------------

// Animation du conteneur principal - apparition en cascade des éléments enfants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Délai entre chaque enfant
      delayChildren: 0.1, // Délai avant le premier enfant
    },
  },
};

// Animation des éléments individuels - glissement vers le haut avec fade-in
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
    },
  },
};

// Animation spécifique pour la ligne décorative
const separatorVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1], // Cubic bezier pour une courbe fluide
    },
  },
};

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================
export default function PageTitle({
  title,
  subtitle,
  showSeparator = false,
}: PageTitleProps) {
  return (
    <motion.div
      className="text-center mb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Titre principal avec dégradé doré */}
      <motion.h1
        variants={itemVariants}
        className="text-3xl sm:text-4xl md:text-5xl font-normal uppercase font-playfair-sc
                   tracking-[0.15em] mb-6"
      >
        {/* Span avec gradient doré et text-clip pour effet de texte doré */}
        <span
          className="bg-gradient-to-b from-yellow-50 via-yellow-200 to-yellow-600 
                         bg-clip-text text-transparent
                         drop-shadow-[0_0_8px_rgba(234,179,8,0.15)]"
        >
          {title}
        </span>
      </motion.h1>

      {/* Sous-titre optionnel - affiché uniquement si fourni */}
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-white/70 max-w-2xl mx-auto 
                     font-light leading-relaxed px-4"
        >
          {subtitle}
        </motion.p>
      )}

      {/* Ligne décorative optionnelle - affichée si showSeparator est true */}
      {showSeparator && (
        <motion.div
          variants={separatorVariants}
          className="mt-8 mx-auto w-32 h-[1px]
                     bg-gradient-to-r from-transparent via-[#ffe992]/60 to-transparent
                     origin-center"
        />
      )}
    </motion.div>
  );
}
