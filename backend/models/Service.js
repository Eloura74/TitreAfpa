const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  prix: {
    type: Number,
    required: false, // Prix "à partir de" ou fixe
    default: 0,
  },
  images: {
    type: [String], // Tableau d'URLs d'images
    default: [],
  },
  categorie: {
    type: String,
    required: true,
    trim: true,
    default: "Autre",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
