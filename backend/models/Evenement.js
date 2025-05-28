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
  titre: { type: String, required: true }, // Exemple : "Mariage de Julie & Tom"

  // Champ "description" : chaîne de caractères optionnelle
  description: { type: String }, // Exemple : "Un mariage en plein air dans les Cévennes"

  // Champ "date" : de type Date, obligatoire
  date: { type: Date, required: true }, // Exemple : "2025-08-15"

  // Champ "lieu" : chaîne de caractères optionnelle
  lieu: { type: String }, // Exemple : "Domaine de la Grangette, Montpellier"

  // Champ "photos" : tableau d'identifiants d'objets (références à des documents de la collection "Photo")
  // Cela permet de lier un événement à plusieurs photos enregistrées dans la base.
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],
});

// ****************************************
// Export du modèle basé sur ce schéma
// ****************************************
// Ce modèle permet d’effectuer des opérations sur la collection "evenements" dans MongoDB
// Exemple : Evenement.find(), Evenement.create(), etc.
module.exports = mongoose.model("Evenement", evenementSchema);
