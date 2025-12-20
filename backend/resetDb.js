const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, ".env") });

// Import des modèles
const Photo = require("./models/Photo");
const OeuvreGraphique = require("./models/OeuvreGraphique");

async function resetDatabase() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    console.log("🗑️ Suppression des photos (Galerie)...");
    const resultPhotos = await Photo.deleteMany({});
    console.log(`✅ ${resultPhotos.deletedCount} photos supprimées.`);

    console.log("🗑️ Suppression des œuvres graphiques...");
    const resultOeuvres = await OeuvreGraphique.deleteMany({});
    console.log(`✅ ${resultOeuvres.deletedCount} œuvres graphiques supprimées.`);

    console.log("✨ Base de données nettoyée ! Vous pouvez repartir à zéro.");
  } catch (err) {
    console.error("❌ Erreur lors du nettoyage :", err);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Déconnexion.");
    process.exit();
  }
}

resetDatabase();
