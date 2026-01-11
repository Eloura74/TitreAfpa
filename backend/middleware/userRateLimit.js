// ============================================
// RATE LIMITING AVANCÉ PAR ROUTE
// ============================================
// Protection ciblée contre les abus

const rateLimit = require('express-rate-limit');

// ============================================
// RATE LIMIT POUR ROUTES PUBLIQUES
// ============================================
// Limite généreuse pour navigation normale
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max par IP
  message: {
    status: 'error',
    message: 'Trop de requêtes, réessayez dans 15 minutes'
  },
  standardHeaders: true, // Retourne les headers RateLimit-*
  legacyHeaders: false, // Désactive X-RateLimit-*
});

// ============================================
// RATE LIMIT STRICT POUR AUTHENTIFICATION
// ============================================
// Protection anti brute-force sur login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    status: 'error',
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Ne compte pas les requêtes réussies
  standardHeaders: true,
});

// ============================================
// RATE LIMIT POUR UPLOAD DE FICHIERS
// ============================================
// Limite les uploads pour éviter la saturation
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 uploads max par heure
  message: {
    status: 'error',
    message: 'Limite d\'upload atteinte. Réessayez dans 1 heure'
  },
  standardHeaders: true,
});

// ============================================
// RATE LIMIT POUR CRÉATION DE COMPTE
// ============================================
// Évite la création de comptes en masse
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 créations max par heure par IP
  message: {
    status: 'error',
    message: 'Trop de créations de compte. Réessayez dans 1 heure'
  },
  standardHeaders: true,
});

// ============================================
// RATE LIMIT POUR PAIEMENTS
// ============================================
// Protection contre les tentatives frauduleuses
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de paiement max
  message: {
    status: 'error',
    message: 'Trop de tentatives de paiement. Contactez le support'
  },
  standardHeaders: true,
});

// ============================================
// RATE LIMIT POUR RESET PASSWORD
// ============================================
// Protection anti-spam sur reset password
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 demandes max par heure
  message: {
    status: 'error',
    message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure'
  },
  standardHeaders: true,
});

module.exports = {
  publicLimiter,
  authLimiter,
  uploadLimiter,
  registerLimiter,
  paymentLimiter,
  resetPasswordLimiter
};
