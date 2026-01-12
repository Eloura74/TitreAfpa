// ============================================
// MIDDLEWARE DE GESTION D'ERREURS GLOBAL
// ============================================
// Centralise toutes les erreurs de l'application
// pour un traitement uniforme et sécurisé

const logger = require('../utils/logger');

/**
 * Classe d'erreur personnalisée avec code HTTP
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Erreur attendue vs bug
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Gestion des erreurs de validation Mongoose
 * @param {Error} err - Erreur Mongoose
 * @returns {AppError}
 */
function handleMongooseValidationError(err) {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Données invalides : ${errors.join('. ')}`;
  return new AppError(message, 400);
}

/**
 * Gestion des erreurs de duplication MongoDB (code 11000)
 * @param {Error} err - Erreur MongoDB
 * @returns {AppError}
 */
function handleMongoDuplicateError(err) {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  const message = `La valeur "${value}" pour le champ "${field}" existe déjà.`;
  return new AppError(message, 400);
}

/**
 * Gestion des erreurs de cast MongoDB (ID invalide)
 * @param {Error} err - Erreur MongoDB
 * @returns {AppError}
 */
function handleMongoCastError(err) {
  const message = `ID invalide : ${err.value}`;
  return new AppError(message, 400);
}

/**
 * Gestion des erreurs JWT (token invalide)
 * @returns {AppError}
 */
function handleJWTError() {
  return new AppError('Token invalide. Veuillez vous reconnecter.', 401);
}

/**
 * Gestion des erreurs JWT (token expiré)
 * @returns {AppError}
 */
function handleJWTExpiredError() {
  return new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);
}

/**
 * Envoie la réponse d'erreur en développement (avec stack trace)
 * @param {Error} err - Erreur
 * @param {object} res - Réponse Express
 */
function sendErrorDev(err, res) {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

/**
 * Envoie la réponse d'erreur en production (sécurisée)
 * @param {Error} err - Erreur
 * @param {object} res - Réponse Express
 */
function sendErrorProd(err, res) {
  // Erreur opérationnelle (attendue) : on peut la montrer au client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
    });
  } 
  // Erreur de programmation (bug) : on cache les détails
  else {
    // Log de l'erreur pour les développeurs (avec console.error pour Vercel)
    console.error('[ERROR HANDLER] ERREUR INTERNE NON GÉRÉE');
    console.error('[ERROR HANDLER] Message:', err.message);
    console.error('[ERROR HANDLER] Stack:', err.stack);
    console.error('[ERROR HANDLER] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    
    logger.error('ERREUR INTERNE NON GÉRÉE', {
      error: err.message,
      stack: err.stack,
    });

    // Message générique pour le client
    res.status(500).json({
      status: 'error',
      message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
    });
  }
}

/**
 * Middleware de gestion d'erreurs global
 * @param {Error} err - Erreur capturée
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 * @param {function} next - Fonction next d'Express
 */
function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log console pour Vercel (visible dans les logs Functions)
  console.error('═══════════════════════════════════════');
  console.error('[GLOBAL ERROR HANDLER] Erreur capturée');
  console.error('[GLOBAL ERROR HANDLER] Route:', req.method, req.path);
  console.error('[GLOBAL ERROR HANDLER] Message:', err.message);
  console.error('[GLOBAL ERROR HANDLER] Status:', err.statusCode);
  console.error('[GLOBAL ERROR HANDLER] Stack:', err.stack);
  console.error('═══════════════════════════════════════');

  // Log de l'erreur (fichier)
  logger.error(`[${req.method}] ${req.path}`, {
    error: err.message,
    statusCode: err.statusCode,
    userId: req.user?.id,
    ip: req.ip,
  });

  // Traitement spécifique selon l'environnement
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Clone l'erreur pour ne pas modifier l'original
    let error = { ...err };
    error.message = err.message;

    // Transformation des erreurs MongoDB/Mongoose
    if (err.name === 'ValidationError') error = handleMongooseValidationError(err);
    if (err.code === 11000) error = handleMongoDuplicateError(err);
    if (err.name === 'CastError') error = handleMongoCastError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
}

/**
 * Wrapper pour les fonctions async qui gère automatiquement les erreurs
 * Évite d'avoir try/catch partout
 * @param {function} fn - Fonction async à wrapper
 * @returns {function} Fonction wrappée
 */
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
};
