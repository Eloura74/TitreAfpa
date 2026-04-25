// Modèle Mongoose pour une œuvre graphique unique
// Ce fichier définit la structure (schéma) d’un document "œuvre graphique" dans la base de données MongoDB.
// Chaque œuvre représente une création artistique unique (image, tarif, titre...).

const mongoose = require("mongoose"); // Import de la bibliothèque Mongoose

// ***************************************
// Définition du schéma OeuvreGraphique
// ***************************************
// Le schéma définit les champs attendus pour chaque document enregistré dans la collection "oeuvresgraphiques"
const OeuvreGraphiqueSchema = new mongoose.Schema({
  // Champ "titre" : chaîne de caractères obligatoire
  // Exemple : "Crépuscule Digital"
  titre: { type: String, required: true },

  // Champ "image" : chaîne obligatoire contenant le chemin ou l'URL de l'image
  // Exemple : "/images/oeuvres/crepuscule.png"
  image: { type: String, required: true },

  // Champ "prix" : nombre obligatoire, correspondant au prix de l’œuvre
  // Exemple : 120.00
  prix: { type: Number, required: true },

  // Champ "description" : chaîne optionnelle permettant d’ajouter un texte descriptif
  // Exemple : "Impression fine art réalisée en édition limitée"
  description: { type: String },

  // Champ "vendu" : booléen indiquant si l'œuvre a été vendue
  // Quand vendu = true, le prix n'est pas affiché et "VENDU" remplace le prix
  vendu: {
    type: Boolean,
    default: false,
  },

  // Nombre de likes (nombre entier, défaut 0)
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Nombre de vues (nombre entier, défaut 0)
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
});

// ****************************************
// Export du modèle basé sur ce schéma
// ****************************************
// Ce modèle permet d’effectuer des opérations (CRUD) sur la collection "oeuvresgraphiques" dans MongoDB
// Exemple : OeuvreGraphique.find(), OeuvreGraphique.create(), etc.
module.exports = mongoose.model("OeuvreGraphique", OeuvreGraphiqueSchema);
