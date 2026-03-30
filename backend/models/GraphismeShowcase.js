const mongoose = require("mongoose");

const GraphismeShowcaseSchema = new mongoose.Schema({
  image: { type: String, required: true },
  titre: { type: String, required: true },
  description: { type: String },
  ordre: { type: Number, required: true, min: 1, max: 2 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

GraphismeShowcaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("GraphismeShowcase", GraphismeShowcaseSchema);
