const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const galerieRoutes = require("./routes/galerie.js");
const stripeRoutes = require("./routes/stripe.js");
const authRoutes = require("./routes/auth.js");
const evenementRoutes = require('./routes/evenement');
const paiementRoutes = require('./routes/paiement');
const panierRoutes = require('./routes/panier');
const tarifsRoutes = require('./routes/tarifs');
const path = require("path");

// Pas besoin de __filename ni __dirname en CommonJS

// Initialisation de l'app Express
const app = express();

// Middleware pour exposer les fichiers dans /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

dotenv.config();

const PORT = process.env.PORT || 5000;

// Activation de CORS pour toutes les requêtes
app.use(cors());

// Middleware JSON
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB connecté"))
  .catch((err) => console.error("🔴 Erreur de connexion MongoDB:", err));

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Connexion réussie avec le backend !");
});

// Routes de la galerie
app.use("/api/galerie", galerieRoutes);
console.log("✅ Routes /api/galerie montées");

// Routes CRUD pour la gestion avancée
app.use('/api/evenements', evenementRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/paniers', panierRoutes);
console.log("✅ Routes /api/evenements, /api/paiements, /api/paniers montées");

// Route d'authentification
app.use("/api/auth", authRoutes);
console.log("✅ Route /api/auth montée");

// Route Stripe
app.use("/api/stripe", stripeRoutes);
console.log("✅ Route /api/stripe montée");

// Route tarifs (ajout non intrusif)
app.use('/api/tarifs', tarifsRoutes);
console.log("✅ Route /api/tarifs montée");

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
