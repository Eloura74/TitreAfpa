// Modèle Photo pour MongoDB avec Mongoose
// Ce fichier définit la structure (schéma) d’un document "photo" dans la base de données MongoDB.
// Chaque photo peut avoir plusieurs tarifs, un auteur, une catégorie, une description, etc.

const mongoose = require("mongoose"); // Import de la bibliothèque Mongoose

// *************************************************
// Sous-schéma TarifOeuvre : définition d’un tarif
// *************************************************
// Ce sous-schéma permet de représenter les différents formats et prix disponibles pour une photo.
const TarifOeuvreSchema = new mongoose.Schema(
  {
    // Identifiant unique pour le tarif (utile côté front ou pour modification ciblée)
    id: {
      type: String,
      required: true, // Le champ est obligatoire
      default: "tarif-default", // Valeur par défaut si non précisé
      trim: true, // Supprime les espaces inutiles autour du texte
    },

    // Format proposé (ex : "20x30", "A4", etc.)
    format: {
      type: String,
      required: true, // Obligatoire pour être utilisé côté front
      default: "Standard", // Format par défaut
      trim: true,
    },

    // Support d'impression (ex : papier, toile, alu-dibond...)
    support: {
      type: String,
      required: true, // Champ obligatoire
      default: "Papier", // Support par défaut
      trim: true,
    },

    // Prix du format/support indiqué
    prix: {
      type: Number,
      required: true, // Le prix est obligatoire
      default: 0, // Par défaut à 0
      min: 0, // Interdit les valeurs négatives
    },
  },
  { _id: false }, // Ce sous-schéma ne génère pas d’identifiant MongoDB (_id) pour chaque tarif
);

// *************************************
// Schéma principal : modèle Photo
// *************************************
const photoSchema = new mongoose.Schema({
  // Chemin ou URL de l’image enregistrée
  src: {
    type: String,
    required: false, // Pas obligatoire
    trim: true, // Nettoie les espaces inutiles
    default: "/uploads/default.jpg", // Image par défaut
  },

  // Texte alternatif (utilisé pour l’accessibilité et le SEO)
  alt: {
    type: String,
    required: false,
    trim: true,
    default: "Photo sans description",
  },

  // Titre de la photo (libellé)
  titre: {
    type: String,
    required: false,
    trim: true,
    default: "Sans titre",
  },

  // Description plus détaillée de la photo (affichée sur la page produit par exemple)
  description: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },

  // Catégorie de la photo (ex : "Mariage", "Paysage", "Portrait")
  categorie: {
    type: String,
    required: false,
    trim: true,
    default: "Divers",
  },

  // Tableau de tarifs associés à la photo (formats, supports, prix)
  // Utilise le sous-schéma défini plus haut
  tarifs: {
    type: [TarifOeuvreSchema],
    default: [], // Par défaut, aucun tarif personnalisé
  },

  // Liste des IDs de la configuration hiérarchique (nouveau système)
  availableTariffIds: {
    type: [String],
    default: [],
  },

  // Prix unique (optionnel) : utilisé uniquement si le tableau `tarifs` est vide
  prix: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
  },

  // Référence à un événement (ex : cette photo appartient à un shooting événementiel)
  evenement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evenement", // Lien vers un document de la collection "evenements"
  },

  // Référence à l’utilisateur (celui qui a ajouté ou possède la photo)
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Lien vers un document de la collection "users"
  },

  // Référence à un Album (Nouveau feature)
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    default: null,
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

// ============================================
// INDEXES POUR OPTIMISER LES PERFORMANCES
// ============================================
// Ces indexes accélèrent les requêtes fréquentes sur la collection Photo

// Index composé : Recherche par catégorie + tri par date
// Utilisé dans : GET /api/galerie?categorie=Nature
photoSchema.index({ categorie: 1, createdAt: -1 });

// Index composé : Recherche par album + tri par date
// Utilisé dans : GET /api/galerie?album=xxx
photoSchema.index({ album: 1, createdAt: -1 });

// Index text pour recherche plein texte (titre, description, alt)
// Utilisé dans : GET /api/galerie?search=paysage
photoSchema.index({ titre: "text", description: "text", alt: "text" });

// Index simple : Recherche par utilisateur
// Utilisé dans : Afficher toutes les photos d'un utilisateur
photoSchema.index({ utilisateur: 1 });

// Index simple : Recherche par événement
// Utilisé dans : Afficher toutes les photos d'un événement
photoSchema.index({ evenement: 1 });

// ============================================
// Export du modèle basé sur ce schéma
// ============================================
// Ce modèle "Photo" permet de créer, modifier, rechercher et supprimer des documents photo dans MongoDB.
module.exports = mongoose.model("Photo", photoSchema);
