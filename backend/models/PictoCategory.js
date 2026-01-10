const mongoose = require("mongoose");

const PictoFormatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  width: Number,
  height: Number,
});

const PictoSupportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  technicalSpecs: { type: Map, of: mongoose.Schema.Types.Mixed },
  formats: [PictoFormatSchema],
});

const PictoProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  supports: [PictoSupportSchema],
});

const PictoCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    products: [PictoProductSchema],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PictoCategory ||
  mongoose.model("PictoCategory", PictoCategorySchema);
