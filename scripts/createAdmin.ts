import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
// @ts-ignore
import bcrypt from "bcryptjs";

// Configurer les variables d'environnement
dotenv.config({ path: path.join(process.cwd(), "photographie", ".env") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/photographie";

async function createAdmin() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté.");

    // Définition simplifiée du modèle pour ce script
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      motdepasse: { type: String, required: true },
      role: { type: String, default: "user" },
      isVerified: { type: Boolean, default: false },
    });

    // Si le modèle existe déjà (cas rare en script one-shot mais possible), on le réutilise
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const email = "fabien.licata@gmail.com";
    const password = "admin"; // Mot de passe demandé par l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️ L'utilisateur ${email} existe déjà.`);
      // On le met à jour pour être sûr qu'il est admin
      existingUser.role = "admin";
      existingUser.isVerified = true;
      existingUser.motdepasse = hashedPassword;
      await existingUser.save();
      console.log(
        `✅ Utilisateur mis à jour (Admin / Vérifié / MDP réinitialisé).`
      );
    } else {
      const newUser = new User({
        email,
        motdepasse: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      await newUser.save();
      console.log(`✅ Admin créé : ${email}`);
    }

    console.log(`🔑 Mot de passe temporaire : ${password}`);
  } catch (error) {
    console.error("❌ Erreur :", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Déconnecté.");
    process.exit(0);
  }
}

createAdmin();
