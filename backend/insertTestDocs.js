// ================================
// SCRIPT DE PEUPLEMENT INITIAL
// Objectif : forcer l’apparition des collections dans MongoDB/Mongo Express
// en insérant des documents fictifs (données minimales valides)
// ================================

// ------------------------------
// 1. IMPORT DES DÉPENDANCES
// ------------------------------
const mongoose = require("mongoose"); // Librairie pour manipuler MongoDB
const dotenv = require("dotenv"); // Pour charger les variables d’environnement
dotenv.config(); // Charge les variables depuis le fichier .env

// ------------------------------
// 2. CONNEXION À MONGODB
// ------------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("✅ Connexion MongoDB réussie !");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Erreur de connexion MongoDB :", err);
});

// ------------------------------
// 3. IMPORTATION DES MODÈLES MONGOOSE
// ------------------------------
const Evenement = require("./models/Evenement"); // Modèle pour les événements
const Panier = require("./models/Panier"); // Modèle pour les paniers
const Paiement = require("./models/Paiement"); // Modèle pour les paiements

// ------------------------------
// 4. FONCTION PRINCIPALE : INSÉRER UN ÉCHANTILLON DANS CHAQUE COLLECTION
// ------------------------------
async function insererDocumentsTests() {
  try {
    // === EVENEMENT ===
    await Evenement.create({
      titre: "Titre test", // Champ requis
      description: "Description test", // Champ optionnel
      date: new Date(), // Champ requis : date actuelle
    });
    console.log("✅ Document 'Evenement' inséré");

    // === PANIER ===
    await Panier.create({
      utilisateur: new mongoose.Types.ObjectId(), // ID fictif utilisateur (valide)
      articles: [], // Liste vide d’articles (valide)
    });
    console.log("✅ Document 'Panier' inséré");

    // === PAIEMENT ===
    await Paiement.create({
      utilisateur: new mongoose.Types.ObjectId(), // ID utilisateur fictif
      montant: 10, // Champ requis
      statut: "en attente", // Valeur par défaut autorisée
    });
    console.log("✅ Document 'Paiement' inséré");
  } catch (erreur) {
    console.error("❌ Erreur lors de l'insertion :", erreur.message);
  } finally {
    // Fermeture de la connexion Mongo proprement
    mongoose.connection.close(() => {
      console.log("🔌 Connexion Mongo fermée.");
    });
  }
}

// ------------------------------
// 5. LANCEMENT DU SCRIPT
// ------------------------------
insererDocumentsTests();
