// Importation de la bibliothèque Mongoose
const mongoose = require("mongoose");

// ------------------------------
// Sous-schéma pour les tarifs associés à une photo
// ------------------------------
const TarifOeuvreSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true, // ← identifiant du tarif requis
      default: "tarif-default",
      trim: true,
    },
    format: {
      type: String,
      required: true, // ← format requis pour être exploitable côté front
      default: "Standard",
      trim: true,
    },
    support: {
      type: String,
      required: true,
      default: "Papier",
      trim: true,
    },
    prix: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // ← empêche un prix négatif
    },
  },
  { _id: false } // ← pas de sous-id pour les objets tarifs
);

// ------------------------------
// Schéma principal de Photo
// ------------------------------
const photoSchema = new mongoose.Schema({
  // Chemin de l'image
  src: {
    type: String,
    required: true,
    trim: true,
    default: "/uploads/default.jpg",
  },

  // Texte alternatif
  alt: {
    type: String,
    required: true,
    trim: true,
    default: "Photo sans description",
  },

  // Titre de l'image
  titre: {
    type: String,
    required: true,
    trim: true,
    default: "Sans titre",
  },

  // Description détaillée
  description: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },

  // Catégorie
  categorie: {
    type: String,
    required: true,
    trim: true,
    default: "Divers",
  },

  // Tarifs dynamiques associés à la photo
  tarifs: {
    type: [TarifOeuvreSchema],
    default: [],
  },

  // Prix de base pour compatibilité (non utilisé si tarifs est rempli)
  prix: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
  },

  // Référence à un événement lié
  evenement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evenement",
  },

  // Référence à un utilisateur (auteur/gestionnaire)
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// ------------------------------
// Export du modèle
// ------------------------------
module.exports = mongoose.model("Photo", photoSchema);
