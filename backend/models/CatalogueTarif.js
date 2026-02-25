const mongoose = require('mongoose');

const catalogueTarifSchema = new mongoose.Schema({
  gamme: {
    type: String,
    required: true,
    trim: true
  },
  format: {
    type: String,
    required: true,
    trim: true
  },
  coutFournisseurTTC: {
    type: Number,
    required: true,
    min: 0
  },
  coefficient: {
    type: Number,
    required: true,
    default: 2.50
  },
  prixSite: {
    type: Number,
    required: true,
    min: 0
  },
  netApresURSSAF: {
    type: Number,
    required: true,
    min: 0
  },
  margeNette: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
catalogueTarifSchema.index({ gamme: 1, format: 1 });

const CatalogueTarif = mongoose.model('CatalogueTarif', catalogueTarifSchema);

module.exports = CatalogueTarif;
