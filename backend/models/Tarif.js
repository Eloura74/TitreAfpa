// Modèle Tarif pour MongoDB avec Mongoose
// Ce fichier définit la structure d’un document "tarif" dans la base de données.
// Chaque tarif représente une offre de produit imprimable (tirage, toile, poster, textile...).

const mongoose = require("mongoose"); // Import de la bibliothèque Mongoose

// *************************
// Définition du schéma Tarif
// *************************
const TarifSchema = new mongoose.Schema(
  {
    // Nom du tarif (ex : "Tirage standard", "Poster A2", etc.)
    nom: {
      type: String,
      required: true, // Champ obligatoire
    },

    // Type de produit concerné par ce tarif
    // Ce champ est limité à une liste précise de valeurs (enum)
    // Exemple : tirage papier, poster grand format, toile tendue, etc.
    type: {
      type: String,
      required: true,
    },

    // Format du produit (ex : "10x15", "A3", "40x60", etc.)
    format: {
      type: String,
      required: true, // Champ obligatoire
    },

    // Prix du produit pour ce format et support
    prix: {
      type: Number,
      required: true, // Champ obligatoire
    },

    // Support utilisé (ex : "Papier brillant", "Toile coton", etc.)
    support: {
      type: String,
      required: true, // Champ obligatoire
    },

    // Champ booléen indiquant si ce tarif est actif ou non (visible dans la boutique ou non)
    actif: {
      type: Boolean,
      default: true, // Par défaut, le tarif est actif
    },

    // URL d’une image illustrant ce tarif (optionnel)
    imageUrl: {
      type: String, // Exemple : "/images/tarifs/posterA3.png"
    },
  },
  {
    // Options du schéma : ajoute automatiquement les champs `createdAt` et `updatedAt`
    timestamps: true,
  }
);

// *************************************
// Export du modèle basé sur ce schéma
// *************************************
// Ce modèle permet de manipuler les tarifs dans la collection "tarifs" de MongoDB
// Exemple : Tarif.find(), Tarif.create(), Tarif.findByIdAndUpdate(), etc.
module.exports = mongoose.model("Tarif", TarifSchema);
