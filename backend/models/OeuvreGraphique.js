// Modèle Mongoose pour une œuvre graphique unique
const mongoose = require("mongoose");

const OeuvreGraphiqueSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  image: { type: String, required: true },
  prix: { type: Number, required: true },
  description: { type: String },
});

module.exports = mongoose.model("OeuvreGraphique", OeuvreGraphiqueSchema);
