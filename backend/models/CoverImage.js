const mongoose = require("mongoose");

const CoverImageSchema = new mongoose.Schema({
  image: { type: String, required: true },
  titre: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ["photographie", "graphisme-galerie", "graphisme-decouvrir", "services", "background-site"]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CoverImageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index unique sur le type pour s'assurer qu'il n'y a qu'une seule couverture par type
CoverImageSchema.index({ type: 1 }, { unique: true });

module.exports = mongoose.model("CoverImage", CoverImageSchema);
