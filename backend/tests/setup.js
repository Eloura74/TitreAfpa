// =============================================================================
// FICHIER DE CONFIGURATION DES TESTS
// =============================================================================
// Ce fichier est exécuté AVANT chaque suite de tests.
// Il gère la connexion à la base de test et le nettoyage des données.

const mongoose = require("mongoose");
const { app, connectDB } = require("../server");

// -----------------------------------------------------------------------------
// CONFIGURATION DE LA BASE DE TEST
// -----------------------------------------------------------------------------
// Utilise la variable MONGO_URI_TEST si elle existe, sinon modifie la base par défaut
// en ajoutant "Test" à la fin du nom de la base

const getTestUri = () => {
  // Si une URI de test est définie, on l'utilise
  if (process.env.MONGO_URI_TEST) {
    return process.env.MONGO_URI_TEST;
  }

  // Sinon, on modifie l'URI de production pour pointer vers la base de test
  const originalUri = process.env.MONGO_URI;
  if (!originalUri) {
    throw new Error("MONGO_URI n'est pas défini dans le fichier .env");
  }

  // Remplace le nom de la base par "testPhoto"
  // Exemple: mongodb+srv://...mongodb.net/photographie -> mongodb+srv://...mongodb.net/testPhoto
  return originalUri.replace(/\/([^/?]+)(\?|$)/, "/testPhoto$2");
};

// -----------------------------------------------------------------------------
// HOOKS JEST : AVANT ET APRÈS LES TESTS
// -----------------------------------------------------------------------------

// Exécuté UNE FOIS avant tous les tests de la suite
beforeAll(async () => {
  const testUri = getTestUri();
  console.log("\n🔌 Connexion à la base de test...");

  try {
    await mongoose.connect(testUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connecté à la base de test: testPhoto\n");
  } catch (error) {
    console.error("❌ Erreur connexion base de test:", error.message);
    throw error;
  }
});

// Exécuté APRÈS CHAQUE test individuel
afterEach(async () => {
  // Nettoie les collections utilisées par les tests
  // Cela évite que les données d'un test n'interfèrent avec le suivant
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    // On ne supprime que les documents créés pendant les tests
    // En utilisant un préfixe spécifique ou une condition
    await collection.deleteMany({ _testData: true });
  }
});

// Exécuté UNE FOIS après tous les tests de la suite
afterAll(async () => {
  console.log("\n🧹 Nettoyage et déconnexion...");

  // Supprime les utilisateurs de test créés pendant les tests
  if (mongoose.connection.collections.users) {
    await mongoose.connection.collections.users.deleteMany({
      email: { $regex: /^test.*@test\.com$/ },
    });
  }

  // Supprime les photos de test
  if (mongoose.connection.collections.photos) {
    await mongoose.connection.collections.photos.deleteMany({
      titre: { $regex: /^\[TEST\]/ },
    });
  }

  // Ferme la connexion MongoDB
  await mongoose.connection.close();
  console.log("✅ Connexion fermée.\n");
});

// -----------------------------------------------------------------------------
// EXPORTS POUR LES FICHIERS DE TEST
// -----------------------------------------------------------------------------
module.exports = { app };
