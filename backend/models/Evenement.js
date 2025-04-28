// Modèle Evenement pour MongoDB avec Mongoose
const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
  titre: { type: String, required: true }, // Titre de l'événement
  description: { type: String }, // Description optionnelle
  date: { type: Date, required: true }, // Date de l'événement
  lieu: { type: String }, // Lieu optionnel
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }] // Liste de photos associées
});

module.exports = mongoose.model('Evenement', evenementSchema);
