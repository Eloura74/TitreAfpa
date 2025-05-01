const mongoose = require('mongoose');

const TarifSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, enum: ['tirage', 'poster', 'toile', 'cadeau', 'textile'], required: true },
  format: { type: String, required: true },
  prix: { type: Number, required: true },
  support: { type: String, required: true },
  actif: { type: Boolean, default: true },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Tarif', TarifSchema);
