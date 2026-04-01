const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  prix: {
    type: Number,
    required: false, // Prix "à partir de" ou fixe
    default: 0,
  },
  images: {
    type: [String], // Tableau d'URLs d'images
    default: [],
  },
  categorie: {
    type: String,
    required: true,
    trim: true,
    default: "Autre",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ========================================
  // CHAMPS DE PERSONNALISATION (OPTIONNELS)
  // ========================================
  customization: {
    // Couleur d'accentuation (badge, bordures)
    accentColor: {
      type: String,
      default: "#ffe992", // Couleur dorée par défaut
    },
    // Couleur de fond personnalisée
    backgroundColor: {
      type: String,
      default: null, // null = utiliser le style par défaut
    },
    // Badge personnalisé
    badge: {
      text: {
        type: String,
        default: null, // Ex: "NOUVEAU", "POPULAIRE", "PROMO"
      },
      color: {
        type: String,
        default: "#ffe992",
      },
      position: {
        type: String,
        enum: ["top-left", "top-right"],
        default: "top-right",
      },
    },
    // Typographie
    typography: {
      titleFont: {
        type: String,
        enum: ["default", "playfair", "cinzel", "montserrat"],
        default: "default",
      },
      titleSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      titleStyle: {
        type: String,
        enum: ["normal", "bold", "italic"],
        default: "normal",
      },
    },
    // Ordre d'affichage (priorité)
    displayOrder: {
      type: Number,
      default: 0, // 0 = ordre par défaut, plus élevé = affiché en premier
    },
    // Icône personnalisée
    icon: {
      type: String,
      default: null, // Nom de l'icône Lucide
    },
    // Animation au survol
    hoverEffect: {
      type: String,
      enum: ["none", "zoom", "rotate", "glow"],
      default: "zoom",
    },
  },
});

module.exports = mongoose.model("Service", serviceSchema);
