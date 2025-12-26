const mongoose = require("mongoose");

const accesPriveSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  image: { type: String }, // Image de couverture
  lieu: { type: String },
  
  // Référence aux photos (Collection Photo existante)
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],

  // Client associé (Obligatoire pour un accès privé)
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AccesPrive", accesPriveSchema);
