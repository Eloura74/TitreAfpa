// ============================================
// LOGGER CENTRALISÉ - COMPATIBLE VERCEL
// ============================================
// Gestion des logs professionnelle compatible avec environnement serverless
// En production (Vercel), les logs vont vers stdout/stderr (pas de fichiers)

const fs = require('fs');
const path = require('path');

// Détection de l'environnement Vercel
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Création du dossier logs UNIQUEMENT en développement local
if (!isVercel) {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Niveaux de log
const LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Couleurs pour la console (mode développement)
const COLORS = {
  ERROR: '\x1b[31m', // Rouge
  WARN: '\x1b[33m',  // Jaune
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gris
  RESET: '\x1b[0m',
};

/**
 * Formate un message de log avec timestamp et contexte
 * @param {string} level - Niveau du log (ERROR, WARN, INFO, DEBUG)
 * @param {string} message - Message principal
 * @param {object} meta - Métadonnées additionnelles
 * @returns {string} Message formaté
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}`;
}

/**
 * Écrit un log dans un fichier (UNIQUEMENT en local)
 * Sur Vercel, cette fonction ne fait rien (logs via console uniquement)
 * @param {string} level - Niveau du log
 * @param {string} message - Message formaté
 */
function writeToFile(level, message) {
  // ⚠️ IMPORTANT : Ne pas écrire de fichiers sur Vercel (système éphémère)
  if (isVercel) {
    return; // Skip file writing en production
  }

  try {
    const logsDir = path.join(__dirname, '../logs');
    
    // Écriture dans un fichier par niveau
    const filename = `${level.toLowerCase()}.log`;
    const filepath = path.join(logsDir, filename);
    fs.appendFileSync(filepath, message + '\n', 'utf8');
    
    // Écriture aussi dans combined.log pour tout
    const combinedPath = path.join(logsDir, 'combined.log');
    fs.appendFileSync(combinedPath, message + '\n', 'utf8');
  } catch (err) {
    // Échec silencieux pour éviter de crasher l'app si le FS est indisponible
    console.error('Logger file write failed:', err.message);
  }
}

/**
 * Logger centralisé
 */
class Logger {
  /**
   * Log une erreur (ERROR)
   * @param {string} message - Message d'erreur
   * @param {object} meta - Métadonnées (error stack, userId, etc.)
   */
  error(message, meta = {}) {
    const formatted = formatLogMessage(LEVELS.ERROR, message, meta);
    
    // Console en développement avec couleur
    if (process.env.NODE_ENV !== 'production') {
      console.error(`${COLORS.ERROR}${formatted}${COLORS.RESET}`);
    }
    
    // Fichier toujours
    writeToFile(LEVELS.ERROR, formatted);
  }

  /**
   * Log un avertissement (WARN)
   * @param {string} message - Message d'avertissement
   * @param {object} meta - Métadonnées
   */
  warn(message, meta = {}) {
    const formatted = formatLogMessage(LEVELS.WARN, message, meta);
    
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`${COLORS.WARN}${formatted}${COLORS.RESET}`);
    }
    
    writeToFile(LEVELS.WARN, formatted);
  }

  /**
   * Log une information (INFO)
   * @param {string} message - Message informatif
   * @param {object} meta - Métadonnées
   */
  info(message, meta = {}) {
    const formatted = formatLogMessage(LEVELS.INFO, message, meta);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${COLORS.INFO}${formatted}${COLORS.RESET}`);
    }
    
    writeToFile(LEVELS.INFO, formatted);
  }

  /**
   * Log de debug (DEBUG) - uniquement en dev
   * @param {string} message - Message de debug
   * @param {object} meta - Métadonnées
   */
  debug(message, meta = {}) {
    // Seulement en développement
    if (process.env.NODE_ENV !== 'production') {
      const formatted = formatLogMessage(LEVELS.DEBUG, message, meta);
      console.log(`${COLORS.DEBUG}${formatted}${COLORS.RESET}`);
      writeToFile(LEVELS.DEBUG, formatted);
    }
  }
}

// Export d'une instance singleton
module.exports = new Logger();
