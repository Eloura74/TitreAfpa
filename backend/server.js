import express from "express";
import cors from "cors"; // <-- Ajout du middleware CORS
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Activation de CORS pour toutes les requêtes
app.use(cors());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB connecté"))
  .catch((err) => console.error("🔴 Erreur de connexion MongoDB:", err));

// Middleware JSON
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Connexion réussie avec le backend !");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
