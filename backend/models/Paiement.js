// Modèle Paiement pour MongoDB avec Mongoose
const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence utilisateur
  montant: { type: Number, required: true }, // Montant payé
  date: { type: Date, default: Date.now }, // Date du paiement
  statut: { type: String, enum: ['en attente', 'payé', 'annulé'], default: 'en attente' } // Statut du paiement
});

module.exports = mongoose.model('Paiement', paiementSchema);
