// Modèle Panier pour MongoDB avec Mongoose
const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence utilisateur
  articles: [{
    photo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }, // Photo ajoutée au panier
    quantite: { type: Number, default: 1 } // Quantité de la photo
  }],
  dateCreation: { type: Date, default: Date.now } // Date de création du panier
});

module.exports = mongoose.model('Panier', panierSchema);
