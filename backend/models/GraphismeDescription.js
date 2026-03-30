const mongoose = require("mongoose");

const graphismeDescriptionSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
      default: "Le Graphisme selon Fabien",
    },
    description: {
      type: String,
      required: true,
      default:
        "Le graphisme est l'art de communiquer visuellement des idées, des émotions et des messages à travers la composition, la typographie, les couleurs et les formes. C'est une discipline qui allie créativité et technique pour créer des visuels impactants et mémorables.",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "GraphismeDescription",
  graphismeDescriptionSchema,
);
