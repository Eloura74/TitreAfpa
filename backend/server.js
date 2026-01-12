// ================================
// IMPORTS ET CONFIGURATION GÉNÉRALE
// ================================

// Import du framework web Express
const express = require("express");

// Module pour autoriser les requêtes Cross-Origin (CORS)
const cors = require("cors");

// ORM pour MongoDB
const mongoose = require("mongoose");

// Chargement des variables d’environnement (.env)
const dotenv = require("dotenv");
dotenv.config();

// Middleware pour gérer les cookies
const cookieParser = require("cookie-parser");

// Import des différentes routes de l’application
const galerieRoutes = require("./routes/galerie.js");
const oeuvresGraphiqueRoutes = require("./routes/oeuvresGraphique.js"); // Routes pour les œuvres graphiques uniques
const authRoutes = require("./routes/auth.js"); // Routes pour l’authentification JWT
const evenementRoutes = require("./routes/evenement"); // Routes CRUD pour les événements
const paiementRoutes = require("./routes/paiement"); // Routes CRUD pour les paiements
const panierRoutes = require("./routes/panier"); // Routes CRUD pour les paniers
const tarifsRoutes = require("./routes/tarifs"); // Routes CRUD pour la grille tarifaire
const uploadCloudinaryRoutes = require("./routes/upload"); // Routes d’upload vers Cloudinary
const paypalRoutes = require("./routes/paypal"); // Routes pour PayPal
const accesPriveRoutes = require("./routes/accesPrive"); // Routes pour les accès privés (Nouvelle collection)
const servicesRoutes = require("./routes/services"); // Routes pour les services (Prestations)
const albumsRoutes = require("./routes/albums"); // Routes pour les albums
const pictoRoutes = require("./routes/picto"); // Routes pour les données Picto (V2)

// Module pour gérer les chemins de fichiers
const path = require("path");

// Import du logger centralisé
const logger = require("./utils/logger");

// Création de l’application Express
const app = express();

// Configuration pour Vercel (derrière un proxy)
app.set("trust proxy", 1);

// ================================
// CONFIGURATION DE CORS (sécurité frontend/backend)
// ================================

// Autorise UNIQUEMENT le domaine frontend Vercel à faire des requêtes
// app.use(
//   cors({
//     origin: [
//       "https://titre-afpa-git-auth-faberquentingmailcoms-projects.vercel.app",
//       "http://localhost:5173", // ton front local (pour dev)
//     ],
//     credentials: true, // Permet l’envoi de cookies si besoin
//   })
// );

// // Accepte toutes les requêtes OPTIONS pour le prévol (navigateurs)
// app.options("*", cors());

// ================================
// CONFIGURATION DE CORS (sécurité frontend/backend)
// ================================

// Liste blanche pour la prod et le local
const allowedOrigins = [
  "https://titre-afpa.vercel.app", // domaine principal prod
  "http://localhost:5173", // dev local
];

// Fonction dynamique pour CORS
function checkOrigin(origin, callback) {
  // 🔒 SÉCURITÉ : Ne plus accepter les requêtes sans Origin
  // Les navigateurs envoient toujours un Origin, si absent = requête curl/script
  if (!origin) {
    logger.warn('CORS: Request without Origin header blocked', { ip: 'unknown' });
    return callback(new Error("Not allowed by CORS"));
  }

  logger.debug(`[CORS] Checking origin: ${origin}`);

  if (allowedOrigins.includes(origin)) return callback(null, true);

  // Autorise tous les sous-domaines previews Vercel (https obligatoire)
  if (
    origin &&
    origin.startsWith("https://") &&
    origin.endsWith(".vercel.app")
  ) {
    return callback(null, true);
  }

  logger.error(`[CORS] Blocked origin: ${origin}`);
  // Sinon, refuse
  return callback(new Error("Not allowed by CORS"));
}
// ================================
// 1. CORS SPÉCIFIQUE POUR LES IMAGES (uploads) : autorise uniquement GET, sans credentials
// ================================
app.use(
  "/uploads",
  cors({
    origin: checkOrigin,
    methods: ["GET"],
    credentials: false, // Pas de cookies pour les images
  }),
  express.static(path.join(__dirname, "uploads"))
);

// ================================
// 2. CORS GLOBAL POUR LES ROUTES API UNIQUEMENT
// ================================
// ================================
// 2. CORS GLOBAL POUR LES ROUTES API UNIQUEMENT
// ================================
app.use(
  "/api",
  cors({
    origin: checkOrigin,
    credentials: true, // Cookies/token autorisés pour les routes API
  })
);

// Accepte toutes les requêtes OPTIONS pour le prévol (navigateurs)
app.options("*", cors());

// ================================
// MIDDLEWARE GLOBAL DE LOG (pour debug)
// ================================
app.use((req, res, next) => {
  logger.debug(`[${req.method}] ${req.path}`, { ip: req.ip }); // Log structuré des requêtes
  next(); // Passe au middleware suivant
});

// ================================
// ROUTE DE TEST POUR VÉRIFIER CORS
// ================================
app.get("/api/cors-test", (req, res) => {
  res.json({ ok: true });
});

// ================================
// ROUTE CLOUDINARY POUR UPLOAD D'IMAGES EN LIGNE
// ================================
app.use("/api/upload-cloudinary", uploadCloudinaryRoutes);

// ================================
// SERVIR LES FICHIERS STATIQUES : les images uploadées avec CORS sécurisé
// ================================
// On autorise explicitement CORS sur /uploads pour permettre l'affichage des images depuis le front (Vercel/local)
app.use(
  "/uploads",
  cors({
    origin: checkOrigin, // Utilise la même whitelist dynamique
    methods: ["GET"], // On autorise uniquement la lecture d'images
    credentials: false, // Pas besoin de cookies pour les images
  }),
  express.static(path.join(__dirname, "uploads"))
);

// ================================
// CHARGEMENT DU .env et configuration du port
// ================================

const PORT = process.env.PORT || 5000;

// ================================
// MIDDLEWARES DE SÉCURITÉ
// ================================
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// 1. Helmet : Définit divers en-têtes HTTP sécurisés (VERSION RENFORCÉE)
app.use(
  helmet({
    // Politique de ressources cross-origin
    crossOriginResourcePolicy: { policy: "cross-origin" },
    
    // Content Security Policy stricte
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", // React nécessite inline scripts
          "https://www.paypal.com",
          "https://js.stripe.com"
        ],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", // Tailwind nécessite inline styles
          "https://fonts.googleapis.com"
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "blob:",
          "https://res.cloudinary.com", // Cloudinary images
          "https://www.paypalobjects.com" // PayPal logos
        ],
        fontSrc: [
          "'self'", 
          "https://fonts.gstatic.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://api.paypal.com",
          "https://api.cloudinary.com",
          process.env.NODE_ENV === 'development' ? "http://localhost:5173" : "https://titre-afpa.vercel.app"
        ],
        frameSrc: [
          "https://www.paypal.com",
          "https://js.stripe.com"
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    
    // HTTP Strict Transport Security (HSTS)
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true
    },
    
    // Protection contre le clickjacking
    frameguard: {
      action: 'deny'
    },
    
    // Empêche le navigateur de deviner le MIME type
    noSniff: true,
    
    // Désactive le cache DNS prefetch pour plus de confidentialité
    dnsPrefetchControl: {
      allow: false
    },
    
    // Politique de référent stricte
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  })
);

// 2. Rate Limiting : Limite le nombre de requêtes pour éviter les attaques par force brute
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limite chaque IP à 1000 requêtes par fenêtre (augmenté pour dev/admin)
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  standardHeaders: true, // Retourne les headers rate limit
  legacyHeaders: false, // Désactive les headers X-RateLimit-*
});

// Rate limiter spécifique pour les paiements (protection anti-spam/fraude)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 tentatives de paiement par IP (évite spam PayPal)
  message: "Trop de tentatives de paiement. Veuillez réessayer dans 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Compte même les paiements réussis
});

app.use("/api", limiter); // Applique le rate limiting à toutes les routes API

// 3. Mongo Sanitize : Empêche l'injection NoSQL
app.use(mongoSanitize());

// 4. XSS Clean : Nettoie les entrées utilisateur contre les attaques XSS
app.use(xss());

// ================================
// MIDDLEWARES POUR LECTURE DES CORPS JSON / FORMULAIRES / COOKIES
// ================================
// Ces middlewares permettent d’analyser les corps de requêtes POST/PUT et les cookies
app.use(express.json({ limit: "50mb" })); // JSON (application/json)
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Formulaires (x-www-form-urlencoded)
app.use(cookieParser()); // Analyse des cookies

// ================================
// CONNEXION À MONGODB
// ================================
// ================================
// CONNEXION À MONGODB (Améliorée pour Vercel)
// ================================
// Variable pour mettre en cache la promesse de connexion (Best Practice Serverless)
let cachedPromise = null;

const connectDB = async () => {
  // Si déjà connecté, on ne fait rien
  if (mongoose.connection.readyState === 1) {
    logger.info("MongoDB déjà connecté (Cache)");
    return;
  }

  // Si une connexion est en cours, on l'attend
  if (cachedPromise) {
    logger.info("Connexion MongoDB en cours (Attente du cache)...");
    await cachedPromise;
    return;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("⚠️ La variable MONGO_URI est indéfinie !");
    }

    // Masquer le mot de passe pour les logs
    const maskedURI = uri.replace(/:([^:@]+)@/, ":****@");
    logger.info("Tentative de connexion à MongoDB", { uri: maskedURI });

    // On stocke la promesse pour les appels concurrents
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await cachedPromise;
    logger.info("MongoDB connecté avec succès");
  } catch (err) {
    logger.error("Erreur CRITIQUE de connexion MongoDB", { error: err.message });
    cachedPromise = null; // Reset du cache en cas d'erreur
    throw err;
  }
};

// Lancer la connexion UNIQUEMENT si on n'est pas en mode test/import
// connectDB(); <--- SUPPRIMÉ pour éviter le double appel dans Vercel

// ================================
// ROUTE DE TEST SIMPLE
// ================================
app.get("/", (req, res) => {
  res.send("🚀 Connexion réussie avec le backend !");
});

// ================================
// ROUTE SPÉCIALE : AJOUT DIRECT DE PHOTO SANS VALIDATION
// SUPPRIMÉE POUR SÉCURITÉ EN PRODUCTION
// ================================
// const Photo = require("./models/Photo");
// app.post("/api/photos-direct", ... ) -> Route supprimée.

// ================================
// ROUTES MONTÉES (api/xxx)
// ================================

// ================================
// MONTAGE DES ROUTES API
// ================================

// Route principale pour la galerie (photos + upload local)
app.use("/api/galerie", galerieRoutes);

// Route des œuvres graphiques uniques
app.use("/api/oeuvres-graphique", oeuvresGraphiqueRoutes);

// Routes événements, paiements, paniers
app.use("/api/evenements", evenementRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/paniers", panierRoutes);

// Authentification des utilisateurs (login, register, JWT)
app.use("/api/auth", authRoutes);

// ❌ Paiement Stripe SUPPRIMÉ (seul PayPal utilisé)
// app.use("/api/stripe", stripeRoutes);

// Grille tarifaire dynamique
app.use("/api/tarifs", tarifsRoutes);

// Paiement PayPal (avec rate limiter spécifique anti-spam)
app.use("/api/paypal", paymentLimiter, paypalRoutes);

// Accès Privé (Nouvelle Collection)
app.use("/api/acces-prive", accesPriveRoutes);

// Services (Prestations)
app.use("/api/services", servicesRoutes);

// Albums
app.use("/api/albums", albumsRoutes);

// Données Picto (V2)
app.use("/api/picto", pictoRoutes);

// Sitemap dynamique (SEO)
const sitemapRoutes = require("./routes/sitemap");
app.use("/api", sitemapRoutes);

logger.info("Routes API montées avec succès", {
  routes: [
    '/api/galerie', '/api/oeuvres-graphique', '/api/evenements', 
    '/api/paiements', '/api/paniers', '/api/auth',
    '/api/tarifs', '/api/paypal', '/api/acces-prive', '/api/services',
    '/api/albums', '/api/picto', '/api/sitemap.xml'
  ]
});

// ================================
// GESTION GLOBALE DES ERREURS - NOUVEAU MIDDLEWARE PROFESSIONNEL
// ================================
const { globalErrorHandler } = require("./middleware/errorHandler");

// Middleware pour gérer les routes non trouvées (404)
app.all("*", (req, res, next) => {
  const err = new Error(`Route non trouvée : ${req.originalUrl}`);
  err.status = 404;
  err.statusCode = 404;
  next(err);
});

// Middleware global de gestion d'erreurs (doit être en dernier)
app.use(globalErrorHandler);

// ================================
// DÉMARRAGE DU SERVEUR BACKEND
// ================================
// Si le fichier est exécuté directement (node server.js), on lance le serveur
// Si le fichier est exécuté directement (node server.js), on lance le serveur
if (require.main === module) {
  // On attend la connexion à la DB avant de lancer le serveur
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info("Serveur démarré avec succès", { port: PORT, env: process.env.NODE_ENV || 'development' });
    });
  });
}

// Export de l'application pour Vercel (Serverless)
// Export de l'application et de la fonction de connexion pour Vercel
module.exports = { app, connectDB };
