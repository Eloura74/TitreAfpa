// ============================================
// HAPTIC FEEDBACK HOOKS
// ============================================
// Animations et vibrations pour micro-interactions

export const useHapticFeedback = () => {
  // ============================================
  // VIBRATION API (Mobile)
  // ============================================
  const vibrate = {
    light: () => navigator.vibrate?.(10),
    medium: () => navigator.vibrate?.(20),
    heavy: () => navigator.vibrate?.(30),
    success: () => navigator.vibrate?.([10, 50, 10]),
    error: () => navigator.vibrate?.([50, 100, 50]),
    warning: () => navigator.vibrate?.([30, 70, 30]),
  };

  // ============================================
  // ANIMATIONS BOUTONS
  // ============================================
  
  // Pression de bouton (tap)
  const buttonPress = () => ({
    whileTap: { scale: 0.95 },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  });

  // Hover grandissement
  const hoverGrow = (scale = 1.05) => ({
    whileHover: { scale },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20 
    }
  });

  // Hover avec rotation légère
  const hoverRotate = (degrees = 2) => ({
    whileHover: { 
      rotate: degrees,
      scale: 1.02
    },
    transition: { 
      type: "spring", 
      stiffness: 260 
    }
  });

  // ============================================
  // ANIMATIONS FEEDBACK
  // ============================================
  
  // Succès (pulse vert)
  const successPulse = () => ({
    animate: { 
      scale: [1, 1.1, 1],
      backgroundColor: ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.1)']
    },
    transition: { duration: 0.5 }
  });

  // Erreur (shake)
  const errorShake = () => ({
    animate: { 
      x: [0, -10, 10, -10, 10, 0],
      backgroundColor: ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)']
    },
    transition: { duration: 0.4 }
  });

  // Avertissement (bounce)
  const warningBounce = () => ({
    animate: { 
      y: [0, -10, 0],
      backgroundColor: ['rgba(234, 179, 8, 0.1)', 'rgba(234, 179, 8, 0.3)', 'rgba(234, 179, 8, 0.1)']
    },
    transition: { 
      duration: 0.5,
      repeat: 2
    }
  });

  // ============================================
  // ANIMATIONS CARTES/CONTENEURS
  // ============================================
  
  // Carte hover 3D
  const card3DHover = () => ({
    whileHover: {
      rotateY: 5,
      rotateX: -5,
      scale: 1.02,
      z: 50,
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
    },
    transition: { 
      type: "spring", 
      stiffness: 300 
    }
  });

  // Flottement (floating)
  const float = () => ({
    animate: {
      y: [-5, 5, -5],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  });

  // ============================================
  // ANIMATIONS LISTE/ITEMS
  // ============================================
  
  // Apparition depuis le bas
  const slideUpFade = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { 
      duration: 0.3,
      delay 
    }
  });

  // Apparition depuis la gauche
  const slideLeftFade = (delay = 0) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { 
      duration: 0.3,
      delay 
    }
  });

  // Zoom in
  const scaleIn = (delay = 0) => ({
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { 
      duration: 0.3,
      delay 
    }
  });

  // ============================================
  // COMBINAISONS COMPLÈTES
  // ============================================
  
  // Bouton primaire complet
  const primaryButton = () => ({
    ...buttonPress(),
    ...hoverGrow(1.05),
    onClick: vibrate.light
  });

  // Carte interactive complète
  const interactiveCard = () => ({
    ...card3DHover(),
    whileTap: { scale: 0.98 },
    onClick: vibrate.medium
  });

  return {
    // Vibrations
    vibrate,
    
    // Boutons
    buttonPress,
    hoverGrow,
    hoverRotate,
    primaryButton,
    
    // Feedback
    successPulse,
    errorShake,
    warningBounce,
    
    // Cartes
    card3DHover,
    float,
    interactiveCard,
    
    // Listes
    slideUpFade,
    slideLeftFade,
    scaleIn
  };
};

// ============================================
// HOOK POUR GESTION D'ÉTAT OPTIMISTE
// ============================================
export const useOptimisticUpdate = () => {
  const optimisticAction = async <T,>(
    action: () => Promise<T>,
    onSuccess: (data: T) => void,
    onError: (error: Error) => void,
    optimisticUpdate: () => void,
    rollback: () => void
  ) => {
    try {
      // 1. Mise à jour optimiste immédiate
      optimisticUpdate();
      
      // 2. Appel API réel
      const result = await action();
      
      // 3. Confirmation du succès
      onSuccess(result);
      
    } catch (error) {
      // 4. Rollback en cas d'erreur
      rollback();
      onError(error as Error);
    }
  };

  return { optimisticAction };
};
