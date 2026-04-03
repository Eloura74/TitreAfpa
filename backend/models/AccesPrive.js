const mongoose = require("mongoose");

const PhotoOriginaleSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    fichierR2: { type: String, required: true },
    miniature: { type: String },
    taille: { type: Number, required: true },
    format: { type: String, required: true },
    dateUpload: { type: Date, default: Date.now },
    nbTelechargements: { type: Number, default: 0 },
    commentaire: { type: String, default: null },
  },
  { _id: true },
);

const accesPriveSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  image: { type: String },
  lieu: { type: String },

  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  codeAcces: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  photosOriginales: [PhotoOriginaleSchema],

  typeValidite: {
    type: String,
    enum: ["permanent", "temporaire"],
    default: "permanent",
  },

  dateExpiration: {
    type: Date,
    default: null,
  },

  typeLimiteTelechargement: {
    type: String,
    enum: ["illimite", "par_photo", "total"],
    default: "illimite",
  },

  maxTelechargementParPhoto: {
    type: Number,
    default: null,
  },

  maxTelechargementTotal: {
    type: Number,
    default: null,
  },

  nbTelechargementTotal: {
    type: Number,
    default: 0,
  },

  statut: {
    type: String,
    enum: ["actif", "expire", "suspendu"],
    default: "actif",
  },

  createdAt: { type: Date, default: Date.now },
});

accesPriveSchema.index({ codeAcces: 1 });
accesPriveSchema.index({ client: 1 });
accesPriveSchema.index({ statut: 1 });

accesPriveSchema.methods.verifierValidite = function () {
  if (this.statut !== "actif") return false;

  if (this.typeValidite === "temporaire" && this.dateExpiration) {
    if (new Date() > this.dateExpiration) {
      this.statut = "expire";
      return false;
    }
  }

  if (
    this.typeLimiteTelechargement === "total" &&
    this.maxTelechargementTotal
  ) {
    if (this.nbTelechargementTotal >= this.maxTelechargementTotal) {
      return false;
    }
  }

  return true;
};

accesPriveSchema.methods.verifierLimitePhoto = function (photoId) {
  if (
    this.typeLimiteTelechargement !== "par_photo" ||
    !this.maxTelechargementParPhoto
  ) {
    return true;
  }

  const photo = this.photosOriginales.id(photoId);
  if (!photo) return false;

  return photo.nbTelechargements < this.maxTelechargementParPhoto;
};

module.exports = mongoose.model("AccesPrive", accesPriveSchema);
