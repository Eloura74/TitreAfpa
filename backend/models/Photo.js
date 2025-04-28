// Importation de la bibliothèque Mongoose, qui permet de gérer la connexion et les opérations avec MongoDB
const mongoose = require("mongoose");

// Définition du schéma (structure) pour les documents de la collection "Photo"
// Un schéma définit les champs que chaque document devra contenir ainsi que leurs types et contraintes
const photoSchema = new mongoose.Schema({
  // Chemin ou URL de l'image (obligatoire)
  src: { type: String, required: true },

  // Texte alternatif pour l'image, utile pour l'accessibilité et le SEO (obligatoire)
  alt: { type: String, required: true },

  // Titre de la photo (obligatoire)
  titre: { type: String, required: true },

  // Description détaillée de la photo (obligatoire)
  description: { type: String, required: true },

  // Prix associé à la photo, de type numérique (obligatoire)
  prix: { type: Number, required: true },

  // Catégorie à laquelle appartient la photo (obligatoire)
  categorie: { type: String, required: true },

  // Référence à l'événement associé (optionnelle)
  evenement: { type: mongoose.Schema.Types.ObjectId, ref: 'Evenement' },

  // Référence à l'utilisateur propriétaire/auteur (optionnelle)
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Création du modèle "Photo" à partir du schéma défini ci-dessus
// Le modèle permet d'interagir avec la collection "photos" dans MongoDB (Mongoose ajoute automatiquement un 's' pour le nom de la collection)
// Grâce à ce modèle, on pourra effectuer des opérations comme : créer, lire, mettre à jour ou supprimer des documents
module.exports = mongoose.model("Photo", photoSchema);
