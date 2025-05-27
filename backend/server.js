const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const galerieRoutes = require("./routes/galerie.js");
const oeuvresGraphiqueRoutes = require("./routes/oeuvresGraphique.js"); // Route œuvres graphiques uniques
const stripeRoutes = require("./routes/stripe.js");
const authRoutes = require("./routes/auth.js");
const evenementRoutes = require("./routes/evenement");
const paiementRoutes = require("./routes/paiement");
const panierRoutes = require("./routes/panier");
const tarifsRoutes = require("./routes/tarifs");
const path = require("path");
const uploadCloudinaryRoutes = require("./routes/upload");

// Initialisation de l'app Express
const app = express();

// Activation de CORS AVANT toute route :
// En production, on autorise uniquement le frontend Vercel pour la sécurité
app.use(
  cors({
    origin: ["https://titre-afpa.vercel.app"],
    credentials: true,
  })
);
app.options("*", cors());

// Middleware de log global pour debug
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// Route GET de test CORS
app.get("/api/cors-test", (req, res) => {
  res.json({ ok: true });
});
// cloudinary route
app.use("/api/upload-cloudinary", uploadCloudinaryRoutes);

// Middleware pour exposer les fichiers dans /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

dotenv.config();

const PORT = process.env.PORT || 5000;

// // Middleware JSON
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB connecté"))
  .catch((err) => console.error("🔴 Erreur de connexion MongoDB:", err));

// --- Middleware JSON (doit être AVANT les routes !) ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Connexion réussie avec le backend !");
});

// ROUTE D'URGENCE pour ajouter des photos sans validation
const Photo = require("./models/Photo");

// Création d'une route spéciale AVANT le montage des autres routes
app.post("/api/photos-direct", async (req, res) => {
  try {
    console.log("=== ROUTE DIRECTE PHOTOS ACTIVÉE ===");
    console.log("Données reçues:", req.body);

    // Création directe sans validation
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

// Routes de la galerie normales (maintenues pour compatibilité)
app.use("/api/galerie", galerieRoutes);
console.log("✅ Routes /api/galerie montées");

// Route œuvres graphiques uniques
app.use("/api/oeuvres-graphique", oeuvresGraphiqueRoutes);
console.log("✅ Route /api/oeuvres-graphique montée");

// Routes CRUD pour la gestion avancée
app.use("/api/evenements", evenementRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/paniers", panierRoutes);
console.log("✅ Routes /api/evenements, /api/paiements, /api/paniers montées");

// Route d'authentification
app.use("/api/auth", authRoutes);
console.log("✅ Route /api/auth montée");

// Route Stripe
app.use("/api/stripe", stripeRoutes);
console.log("✅ Route /api/stripe montée");

// Route tarifs (ajout non intrusif)
app.use("/api/tarifs", tarifsRoutes);
console.log("✅ Route /api/tarifs montée");
console.log(
  "✅ GET /api/tarifs fonctionne et la grille tarifaire dynamique est accessible côté front"
);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
