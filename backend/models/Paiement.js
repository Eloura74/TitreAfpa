// Modèle Paiement pour MongoDB avec Mongoose
// Ce fichier définit la structure (schéma) d’un document "paiement" dans la base de données MongoDB.
// Chaque paiement est associé à un utilisateur et contient un montant, une date et un statut.

const mongoose = require("mongoose"); // Import de la bibliothèque Mongoose

// *****************************
// Définition du schéma Paiement
// *****************************
const paiementSchema = new mongoose.Schema({
  // Champ "utilisateur" : identifiant unique d’un utilisateur (référence vers la collection "User")
  // Optionnel car un achat peut être fait en invité (PayPal)
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  // Nom du client (utile pour les invités ou PayPal)
  nomClient: {
    type: String,
    required: false,
  },

  // Email du client
  emailClient: {
    type: String,
    required: false,
  },

  // ID de transaction (PayPal ou Stripe)
  transactionId: {
    type: String,
    required: false,
  },

  // Source du paiement
  source: {
    type: String,
    enum: ["manuel", "paypal", "stripe"],
    default: "manuel",
  },

  // Champ "montant" : montant du paiement (en euros ou autre devise)
  // Ce champ est obligatoire et doit être un nombre.
  montant: {
    type: Number,
    required: true,
  },

  // Champ "date" : date à laquelle le paiement a été effectué
  // Par défaut, on enregistre la date actuelle (Date.now)
  date: {
    type: Date,
    default: Date.now,
  },

  // Champ "statut" : état du paiement
  // Peut prendre l'une des trois valeurs suivantes : "en attente", "payé", "annulé"
  // Par défaut, un paiement est marqué comme "en attente"
  statut: {
    type: String,
    enum: ["en attente", "payé", "annulé"],
    default: "en attente",
  },
});

// ****************************************
// Export du modèle basé sur ce schéma
// ****************************************
// Ce modèle permet d’effectuer des opérations sur la collection "paiements" dans MongoDB
// Exemple : Paiement.find(), Paiement.create(), Paiement.findByIdAndUpdate(), etc.
module.exports = mongoose.model("Paiement", paiementSchema);
