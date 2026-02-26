const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI;

// Schéma Picto
const pictoSchema = new mongoose.Schema(
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
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const PictoConfig = mongoose.model("tariffconfis", pictoSchema);

async function importerCatalogue() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Supprimer l'ancienne configuration
    console.log("🗑️  Suppression de l'ancienne configuration...");
    await PictoConfig.deleteMany({});

    // Lire le catalogue
    const cataloguePath = path.join(
      __dirname,
      "../../CATALOGUE_COMPLET_TIRAGES_ET_FINITIONS.json"
    );
    const catalogueJSON = JSON.parse(fs.readFileSync(cataloguePath, "utf8"));
    const catalogueData = catalogueJSON["CATALOGUE COMPLET"];

    // Extraire les paramètres
    const tauxURSSAF =
      catalogueData.find((item) => item.Paramètres === "Taux URSSAF")?.[
        "Unnamed: 1"
      ] || 0.233;
    const coefficientGlobal =
      catalogueData.find((item) => item.Paramètres === "Coefficient global")?.[
        "Unnamed: 1"
      ] || 2.5;

    console.log(`📊 Paramètres globaux:`);
    console.log(`  - Taux URSSAF: ${tauxURSSAF}`);
    console.log(`  - Coefficient global: ${coefficientGlobal}`);

    // Filtrer les lignes de tarifs
    const tarifs = catalogueData.filter(
      (item) =>
        item.Paramètres &&
        item.Paramètres !== "Taux URSSAF" &&
        item.Paramètres !== "Coefficient global" &&
        item.Paramètres !== "Gamme / Finition" &&
        item["Unnamed: 1"] &&
        item["Unnamed: 4"]
    );

    console.log(`📋 ${tarifs.length} tarifs trouvés`);

    // Grouper les tarifs par gamme
    const tarifsParGamme = {};
    tarifs.forEach((item) => {
      const gamme = item.Paramètres;
      if (!tarifsParGamme[gamme]) {
        tarifsParGamme[gamme] = [];
      }
      tarifsParGamme[gamme].push({
        format: item["Unnamed: 1"],
        coutFournisseur: parseFloat(item["Unnamed: 2"]) || 0,
        coefficient: parseFloat(item["Unnamed: 3"]) || coefficientGlobal,
        prixSite: parseFloat(item["Unnamed: 4"]),
        netApresURSSAF: parseFloat(item["Unnamed: 5"]) || 0,
        margeNette: parseFloat(item["Unnamed: 6"]) || 0,
      });
    });

    console.log(`\n🏷️  Gammes trouvées: ${Object.keys(tarifsParGamme).join(", ")}`);

    // Créer la structure Picto
    const categories = [];

    // Pour chaque gamme, créer une catégorie
    Object.entries(tarifsParGamme).forEach(([gamme, formats]) => {
      const categoryId = uuidv4();
      const productId = uuidv4();
      const supportId = uuidv4();

      const category = {
        id: categoryId,
        name: gamme, // Nom de la gamme tel quel
        products: [
          {
            id: productId,
            name: gamme, // Même nom pour le produit
            description: `Tirage ${gamme}`,
            supports: [
              {
                id: supportId,
                name: gamme, // Même nom pour le support
                description: `Support ${gamme}`,
                technicalSpecs: {
                  gamme: gamme,
                  tauxURSSAF: tauxURSSAF,
                  coefficientGlobal: coefficientGlobal,
                },
                formats: formats.map((f) => {
                  const dimensions = f.format.split("×");
                  return {
                    id: uuidv4(),
                    name: f.format,
                    width: parseInt(dimensions[0]) || 0,
                    height: parseInt(dimensions[1]) || 0,
                    price: f.prixSite,
                  };
                }),
              },
            ],
          },
        ],
      };

      categories.push(category);
      console.log(`  ✅ ${gamme}: ${formats.length} formats`);
    });

    // Créer et sauvegarder la nouvelle configuration
    const config = new PictoConfig({ categories });
    await config.save();

    console.log("\n✅ Import terminé avec succès!");
    console.log(`📊 Résumé:`);
    console.log(`  - ${categories.length} catégories créées`);
    console.log(
      `  - ${tarifs.length} formats importés`
    );
    console.log(`  - Taux URSSAF: ${tauxURSSAF}`);
    console.log(`  - Coefficient global: ${coefficientGlobal}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Lancer l'import
importerCatalogue();
