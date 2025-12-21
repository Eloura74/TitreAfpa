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

// Import des différentes routes de l’application
const galerieRoutes = require("./routes/galerie.js");
const oeuvresGraphiqueRoutes = require("./routes/oeuvresGraphique.js"); // Routes pour les œuvres graphiques uniques
const stripeRoutes = require("./routes/stripe.js"); // Routes pour les paiements Stripe
const authRoutes = require("./routes/auth.js"); // Routes pour l’authentification JWT
const evenementRoutes = require("./routes/evenement"); // Routes CRUD pour les événements
const paiementRoutes = require("./routes/paiement"); // Routes CRUD pour les paiements
const panierRoutes = require("./routes/panier"); // Routes CRUD pour les paniers
const tarifsRoutes = require("./routes/tarifs"); // Routes CRUD pour la grille tarifaire
const uploadCloudinaryRoutes = require("./routes/upload"); // Routes d’upload vers Cloudinary
const paypalRoutes = require("./routes/paypal"); // Routes pour PayPal

// Module pour gérer les chemins de fichiers
const path = require("path");

// Création de l’application Express
const app = express();

// Configuration pour Vercel (derrière un proxy)
app.set('trust proxy', 1);

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
  // Autorise prod et local
  if (!origin) return callback(null, true); // <--- AJOUT : accepte les accès directs sans Origin (navigateurs)
  if (allowedOrigins.includes(origin)) return callback(null, true);

  // Autorise tous les sous-domaines previews Vercel (https obligatoire)
  if (
    origin &&
    origin.startsWith("https://") &&
    origin.endsWith(".vercel.app")
  ) {
    return callback(null, true);
  }

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
  console.log(`[${req.method}] ${req.path}`); // Affiche chaque requête reçue
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
dotenv.config();
const PORT = process.env.PORT || 5000;

// ================================
// MIDDLEWARES DE SÉCURITÉ
// ================================
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// 1. Helmet : Définit divers en-têtes HTTP sécurisés
app.use(helmet());

// 2. Rate Limiting : Limite le nombre de requêtes pour éviter les attaques par force brute
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
});
app.use("/api", limiter); // Applique le rate limiting à toutes les routes API

// 3. Mongo Sanitize : Empêche l'injection NoSQL
app.use(mongoSanitize());

// 4. XSS Clean : Nettoie les entrées utilisateur contre les attaques XSS
app.use(xss());

// ================================
// MIDDLEWARES POUR LECTURE DES CORPS JSON / FORMULAIRES
// ================================
// Ces middlewares permettent d’analyser les corps de requêtes POST/PUT
app.use(express.json({ limit: "10mb" })); // JSON (application/json)
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Formulaires (x-www-form-urlencoded)

// ================================
// CONNEXION À MONGODB
// ================================
// ================================
// CONNEXION À MONGODB (Améliorée pour Vercel)
// ================================
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("⚠️ La variable MONGO_URI est indéfinie !");
    }

    // Masquer le mot de passe pour les logs
    const maskedURI = uri.replace(/:([^:@]+)@/, ":****@");
    console.log(`🔌 Tentative de connexion à MongoDB... (${maskedURI})`);

    await mongoose.connect(uri, {
      // Options recommandées pour la stabilité
      serverSelectionTimeoutMS: 5000, // Timeout plus court pour échouer vite si pas de connexion
      socketTimeoutMS: 45000,
    });

    console.log("🟢 MongoDB connecté avec succès !");
  } catch (err) {
    console.error("🔴 Erreur CRITIQUE de connexion MongoDB:", err.message);
    // On ne crash pas l'app ici pour permettre aux logs de sortir, 
    // mais les requêtes échoueront.
  }
};

// Lancer la connexion
connectDB();

// ================================
// ROUTE DE TEST SIMPLE
// ================================
app.get("/", (req, res) => {
  res.send("🚀 Connexion réussie avec le backend !");
});

// ================================
// ROUTE SPÉCIALE : AJOUT DIRECT DE PHOTO SANS VALIDATION
// Permet d’insérer rapidement une image sans passer par la route standard
// Utilisée pour tests ou migration rapide
// ================================
const Photo = require("./models/Photo");

app.post("/api/photos-direct", async (req, res) => {
  try {
    console.log("=== ROUTE DIRECTE PHOTOS ACTIVÉE ===");
    console.log("Données reçues:", req.body);

    // Création brute sans contrôle de validation (usage limité)
    const photo = await Photo.create(req.body);
    console.log("Photo créée avec succès via route directe:", photo);

    return res.status(201).json(photo);
  } catch (err) {
    console.error("Erreur route directe photos:", err);
    return res.status(500).json({
      message: "Erreur lors de la création de la photo",
      error: err.message,
    });
  }
});

// ================================
// ROUTES MONTÉES (api/xxx)
// ================================

// Route principale pour la galerie (photos + upload local)
app.use("/api/galerie", galerieRoutes);
console.log("✅ Routes /api/galerie montées");

// Route des œuvres graphiques uniques
app.use("/api/oeuvres-graphique", oeuvresGraphiqueRoutes);
console.log("✅ Route /api/oeuvres-graphique montée");

// Routes événements, paiements, paniers
app.use("/api/evenements", evenementRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/paniers", panierRoutes);
console.log("✅ Routes /api/evenements, /api/paiements, /api/paniers montées");

// Authentification des utilisateurs (login, register, JWT)
app.use("/api/auth", authRoutes);
console.log("✅ Route /api/auth montée");

// Paiement Stripe
app.use("/api/stripe", stripeRoutes);
console.log("✅ Route /api/stripe montée");

// Grille tarifaire dynamique
app.use("/api/tarifs", tarifsRoutes);
console.log("✅ Route /api/tarifs montée");

// Paiement PayPal
app.use("/api/paypal", paypalRoutes);
console.log("✅ Route /api/paypal montée");
console.log(
  "✅ GET /api/tarifs fonctionne et la grille tarifaire dynamique est accessible côté front"
);

// ================================
// DÉMARRAGE DU SERVEUR BACKEND
// ================================
// Si le fichier est exécuté directement (node server.js), on lance le serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
}

// Export de l'application pour Vercel (Serverless)
// Export de l'application et de la fonction de connexion pour Vercel
module.exports = { app, connectDB };
