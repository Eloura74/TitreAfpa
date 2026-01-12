const mongoose = require("mongoose");

/**
 * Modèle RefreshToken pour gérer les tokens de rafraîchissement JWT
 * Permet de renouveler les access tokens sans redemander le mot de passe
 */
const RefreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Index pour nettoyer les tokens expirés facilement
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // IP et User-Agent pour sécurité (détection tokens volés)
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index TTL pour suppression automatique des tokens expirés
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
