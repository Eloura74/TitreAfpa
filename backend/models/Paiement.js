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

  // Méthode de paiement (pour filtres)
  methode: {
    type: String,
    enum: ["paypal", "stripe", "carte", "virement"],
    required: false,
  },

  // Articles commandés (pour affichage admin)
  articles: [
    {
      nom: String,
      quantite: Number,
      prixUnitaire: Number,
      format: String,
      support: String,
    },
  ],

  // Adresse de livraison
  adresseLivraison: {
    nom: String,
    prenom: String,
    adresse: String,
    codePostal: String,
    ville: String,
    pays: String,
    telephone: String,
  },

  // Date de réception estimée (pour calculer le délai de rétractation)
  dateReception: {
    type: Date,
    required: false,
  },

  // Gestion du droit de rétractation (14 jours - loi française)
  retractation: {
    demandee: {
      type: Boolean,
      default: false,
    },
    dateDemande: {
      type: Date,
      required: false,
    },
    statut: {
      type: String,
      enum: ["aucune", "en_cours", "acceptee", "refusee"],
      default: "aucune",
    },
    motif: {
      type: String,
      required: false,
    },
    commentaireAdmin: {
      type: String,
      required: false,
    },
  },

  // Exclusion de la rétractation (ex: galerie graphique - œuvres uniques)
  retractationExclue: {
    type: Boolean,
    default: false,
  },
});

// ============================================
// INDEXES POUR OPTIMISER LES PERFORMANCES
// ============================================
// Ces indexes accélèrent les requêtes fréquentes sur la collection Paiement

// Index composé : Recherche par utilisateur + tri par date décroissante
// Utilisé dans : GET /api/paiements/me (historique utilisateur)
paiementSchema.index({ utilisateur: 1, date: -1 });

// Index simple : Recherche par email (cas PayPal invité)
// Utilisé dans : GET /api/paiements?email=xxx
paiementSchema.index({ emailClient: 1 });

// Index simple : Recherche par statut
// Utilisé dans : GET /api/paiements?statut=payé
paiementSchema.index({ statut: 1 });

// Index simple : Recherche par transaction ID (vérifications)
// Utilisé dans : Vérifier si une transaction existe déjà
paiementSchema.index({ transactionId: 1 });

// Index composé : Filtre statut + date pour statistiques
// Utilisé dans : Rapports admin, statistiques de ventes
paiementSchema.index({ statut: 1, date: -1 });

// ============================================
// Export du modèle basé sur ce schéma
// ============================================
// Ce modèle permet d'effectuer des opérations sur la collection "paiements" dans MongoDB
// Exemple : Paiement.find(), Paiement.create(), Paiement.findByIdAndUpdate(), etc.
module.exports = mongoose.model("Paiement", paiementSchema);
