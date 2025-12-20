// ================================
// SCRIPT DE PEUPLEMENT (SEEDING)
// ================================
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Chargement des variables d'environnement
dotenv.config();

// Import des modèles
const User = require("./models/User");
const Evenement = require("./models/Evenement");
const OeuvreGraphique = require("./models/OeuvreGraphique");

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => {
    console.error("❌ Erreur connexion MongoDB:", err);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    console.log("🔄 Début du peuplement de la base de données...");

    // ---------------------------------
    // 1. CRÉATION D'UN UTILISATEUR (ADMIN)
    // ---------------------------------
    const adminEmail = "admin@test.com";
    const userExists = await User.findOne({ email: adminEmail });
    
    if (!userExists) {
      await User.create({
        email: adminEmail,
        motdepasse: "admin123", // Le hook 'pre save' va hasher ce mot de passe
        role: "admin"
      });
      console.log(`✅ Utilisateur créé : ${adminEmail} (mdp: admin123)`);
    } else {
      console.log(`ℹ️ L'utilisateur ${adminEmail} existe déjà.`);
    }

    // ---------------------------------
    // 2. CRÉATION D'UN ÉVÉNEMENT
    // ---------------------------------
    const eventTitle = "Mariage de Alice & Bob";
    const eventExists = await Evenement.findOne({ titre: eventTitle });

    if (!eventExists) {
      await Evenement.create({
        titre: eventTitle,
        description: "Un mariage féerique au cœur de la Provence.",
        dateDebut: new Date(),
        dateFin: new Date(new Date().setDate(new Date().getDate() + 1)), // Demain
        lieu: "Aix-en-Provence",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" // Image exemple
      });
      console.log("✅ Événement test créé.");
    } else {
      console.log("ℹ️ L'événement test existe déjà.");
    }

    // ---------------------------------
    // 3. CRÉATION D'UNE ŒUVRE GRAPHIQUE
    // ---------------------------------
    const oeuvreTitle = "Lumière Urbaine";
    const oeuvreExists = await OeuvreGraphique.findOne({ titre: oeuvreTitle });

    if (!oeuvreExists) {
      await OeuvreGraphique.create({
        titre: oeuvreTitle,
        description: "Une composition numérique explorant les néons de la ville.",
        prix: 150,
        image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1053&q=80" // Image exemple
      });
      console.log("✅ Œuvre graphique test créée.");
    } else {
      console.log("ℹ️ L'œuvre graphique test existe déjà.");
    }

    console.log("🎉 Peuplement terminé avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors du peuplement :", error);
  } finally {
    // Fermeture de la connexion
    mongoose.connection.close();
    console.log("🔌 Connexion MongoDB fermée.");
  }
}

// Lancement du script
seedDatabase();
