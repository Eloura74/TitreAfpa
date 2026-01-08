const mongoose = require("mongoose");

const TarifConfigSchema = new mongoose.Schema(
  {
    categories: {
      type: Array, // We store the whole tree structure as a JSON array
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TarifConfig", TarifConfigSchema);
