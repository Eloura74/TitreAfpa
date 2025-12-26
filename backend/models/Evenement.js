// Modèle Evenement pour MongoDB avec Mongoose
// Ce fichier définit la structure (schéma) d’un document "événement" dans la base de données MongoDB.
// On utilise Mongoose pour créer un modèle basé sur ce schéma.

const mongoose = require("mongoose"); // Import de la bibliothèque Mongoose

// *******************************
// Définition du schéma Evenement
// *******************************
// Le schéma définit les champs et les types attendus pour chaque document "événement"
const evenementSchema = new mongoose.Schema({
  // Champ "titre" : chaîne de caractères obligatoire
  // Titre de l'événement (obligatoire)
  titre: { type: String, required: true }, // Exemple : "Mariage de Julie & Tom"

  // Champ "description" : chaîne de caractères optionnelle
  // Description de l'événement (optionnelle)
  description: { type: String }, // Exemple : "Un mariage en plein air dans les Cévennes"

  // Champ "dateDebut" : date de début de l'événement (obligatoire)
  // Date de début de l'événement (obligatoire)
  dateDebut: {
    type: Date,
    required: true,
  },
  // Date de fin de l'événement (obligatoire)
  dateFin: {
    type: Date,
    required: true,
  },
  // URL de l'image de couverture (optionnelle)
  image: {
    type: String,
    required: false,
  },
  // Champ "lieu" : chaîne de caractères optionnelle
  // Lieu de l'événement (optionnel)
  lieu: { type: String }, // Exemple : "Domaine de la Grangette, Montpellier"

  // Champ "photos" : tableau d'identifiants d'objets (références à des documents de la collection "Photo")
  // Cela permet de lier un événement à plusieurs photos enregistrées dans la base.
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],

  // Champ "client" : référence à l'utilisateur (client) associé à cet événement
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Champ "visibilite" : définit si l'événement est public ou privé
  visibilite: {
    type: String,
    enum: ["public", "prive"],
    default: "public",
  },
});

// ****************************************
// Export du modèle basé sur ce schéma
// ****************************************
// Ce modèle permet d’effectuer des opérations sur la collection "evenements" dans MongoDB
// Exemple : Evenement.find(), Evenement.create(), etc.
module.exports = mongoose.model("Evenement", evenementSchema);
