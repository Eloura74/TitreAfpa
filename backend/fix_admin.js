require("dotenv").config();
const mongoose = require("mongoose");

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB:", err));

const User = require("./models/User");

async function fixAdmin() {
  try {
    // Trouver tous les admins et les marquer comme vérifiés
    const result = await User.updateMany(
      { role: "admin" },
      { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
    );

    console.log(
      `${result.modifiedCount} admin(s) mis à jour avec isVerified = true`
    );

    // Afficher les admins pour vérification
    const admins = await User.find({ role: "admin" }).select(
      "email role isVerified"
    );
    console.log("Admins dans la base:", admins);
  } catch (err) {
    console.error("Erreur:", err);
  } finally {
    mongoose.connection.close();
  }
}

fixAdmin();
