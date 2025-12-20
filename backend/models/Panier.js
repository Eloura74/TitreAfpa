// Modèle Panier pour MongoDB avec Mongoose
// Ce fichier définit la structure (schéma) d’un document "panier" dans la base de données MongoDB.
// Chaque panier est associé à un utilisateur et contient une liste d’articles (photos + quantités).

const mongoose = require("mongoose"); // Import de la bibliothèque Mongoose

// ***************************
// Définition du schéma Panier
// ***************************
const panierSchema = new mongoose.Schema({
  // Champ "utilisateur" : identifiant de l'utilisateur associé à ce panier
  // Il s'agit d'une référence à la collection "User"
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Champ "articles" : tableau contenant les articles ajoutés au panier
  // Chaque article est constitué :
  // - d'une photo (référence à un document de la collection "Photo")
  // - d'une quantité (nombre d’exemplaires de cette photo dans le panier)
  articles: [
    {
      photo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
      },
      quantite: {
        type: Number,
        default: 1,
      },
      format: {
        type: String,
        default: "Standard",
      },
      support: {
        type: String,
        default: "Papier",
      },
      prixUnitaire: {
        type: Number,
        default: 0,
      },
      titre: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  ],

  // Champ "dateCreation" : date à laquelle le panier a été créé
  // Par défaut, la date actuelle est enregistrée (Date.now)
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

// ****************************************
// Export du modèle basé sur ce schéma
// ****************************************
// Ce modèle permet de gérer les opérations sur la collection "paniers" dans MongoDB
// Exemple : Panier.find(), Panier.create(), Panier.findByIdAndUpdate(), etc.
module.exports = mongoose.model("Panier", panierSchema);
