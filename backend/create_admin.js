const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    const email = process.env.ADMIN_EMAIL || "admin@fabienlicata.com";
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = "admin";
      existingUser.isVerified = true;
      await existingUser.save();
      console.log(`✅ Utilisateur ${email} mis à jour en tant qu'admin`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await User.create({
        nom: "Admin",
        prenom: "Fabien",
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      console.log(`✅ Compte admin créé : ${email}`);
      console.log(`   Mot de passe : ${password}`);
    }

    console.log("\n🔐 Identifiants admin :");
    console.log(`   Email : ${email}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`   Mot de passe : ${password}`);
      console.log(
        "\n⚠️  Mot de passe par défaut utilisé ! Changez-le après la première connexion !",
      );
      console.log(
        "💡 Conseil : Utilisez ADMIN_EMAIL et ADMIN_PASSWORD dans .env pour personnaliser",
      );
    } else {
      console.log(`   Mot de passe : (défini via ADMIN_PASSWORD)`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur :", error);
    process.exit(1);
  }
}

createAdmin();
