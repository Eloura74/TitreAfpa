const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  imageCouverture: {
    type: String,
    trim: true,
    default: "", // URL de l'image de couverture (optionnel)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Album", albumSchema);
