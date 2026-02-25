const mongoose = require("mongoose");

const tariffConfigSchema = new mongoose.Schema(
  {
    categories: [
      {
        id: String,
        name: String,
        products: [
          {
            id: String,
            name: String,
            description: String,
            supports: [
              {
                id: String,
                name: String,
                description: String,
                technicalSpecs: mongoose.Schema.Types.Mixed,
                formats: [
                  {
                    id: String,
                    name: String,
                    width: Number,
                    height: Number,
                    price: Number,
                    coutFournisseur: Number,
                    margeNette: Number,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true, collection: "tariffconfis" }
);

const TariffConfig = mongoose.model("TariffConfig", tariffConfigSchema);

module.exports = TariffConfig;
