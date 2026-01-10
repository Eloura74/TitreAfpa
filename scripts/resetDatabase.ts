import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Configurer les variables d'environnement
// On pointe vers le fichier .env dans le dossier photographie
dotenv.config({ path: path.join(process.cwd(), "photographie", ".env") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/photographie";

async function resetDatabase() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté.");

    if (!mongoose.connection.db) {
      throw new Error(
        "La connexion à la base de données n'a pas pu être établie correctement (db est undefined)."
      );
    }

    const collections = await mongoose.connection.db.collections();
    const adminEmail = "fabien.licata@gmial.com";

    for (const collection of collections) {
      const name = collection.collectionName;

      // 1. Ne jamais toucher à la collection Picto (V2)
      if (name === "pictocategories") {
        console.log(`🛡️  Collection préservée : ${name} (Données Picto V2)`);
        continue;
      }

      // 2. Traitement spécial pour les utilisateurs
      if (name === "users") {
        console.log(`👤 Nettoyage des utilisateurs (sauf ${adminEmail})...`);
        const result = await collection.deleteMany({
          email: { $ne: adminEmail },
        });
        console.log(`   - ${result.deletedCount} utilisateurs supprimés.`);

        // Vérifier que l'admin existe toujours
        const admin = await collection.findOne({ email: adminEmail });
        if (admin) {
          console.log(`   ✅ Admin ${adminEmail} préservé.`);
        } else {
          console.warn(`   ⚠️ Admin ${adminEmail} introuvable !`);
        }
        continue;
      }

      // 3. Suppression totale pour les autres collections
      console.log(`🗑️  Vidage de la collection : ${name}...`);
      const result = await collection.deleteMany({});
      console.log(`   - ${result.deletedCount} documents supprimés.`);
    }

    console.log("\n✨ Base de données réinitialisée avec succès !");
    console.log("🚀 Le système est prêt pour un départ à zéro avec la V2.");
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation :", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Déconnecté.");
    process.exit(0);
  }
}

resetDatabase();
