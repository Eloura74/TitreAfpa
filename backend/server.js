import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import galerieRoutes from "./routes/galerie.js";
import path from "path";
import { fileURLToPath } from "url";

// Récupération du chemin courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
