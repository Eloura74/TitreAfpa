const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI;

// Schéma TariffConfig
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

async function importerNouveauCatalogue() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Compter et supprimer les anciens documents
    const count = await TariffConfig.countDocuments();
    console.log(`📊 Documents existants: ${count}`);
    
    console.log("🗑️  Suppression de TOUS les documents...");
    const deleteResult = await TariffConfig.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} documents supprimés`);

    // Lire le nouveau catalogue
    const cataloguePath = path.join(
      __dirname,
      "../../NewCatalogueomplet.json"
    );
    const catalogueJSON = JSON.parse(fs.readFileSync(cataloguePath, "utf8"));

    console.log(`\n📊 Métadonnées du catalogue:`);
    console.log(`  - Source: ${catalogueJSON.meta.source}`);
    console.log(`  - Taux URSSAF: ${catalogueJSON.meta.parameters.taux_urssaf}`);
    console.log(`  - Coefficient global: ${catalogueJSON.meta.parameters.coefficient_global}`);
    console.log(`  - Nombre d'items: ${catalogueJSON.items.length}`);

    // Grouper les items par gamme_finition
    const itemsParGamme = {};
    catalogueJSON.items.forEach((item) => {
      const gamme = item.gamme_finition;
      if (!itemsParGamme[gamme]) {
        itemsParGamme[gamme] = [];
      }
      itemsParGamme[gamme].push(item);
    });

    console.log(`\n🏷️  Gammes trouvées: ${Object.keys(itemsParGamme).join(", ")}`);

    // Créer la structure pour MongoDB
    const categories = [];

    Object.entries(itemsParGamme).forEach(([gamme, items]) => {
      const categoryId = uuidv4();
      const productId = uuidv4();
      const supportId = uuidv4();

      const category = {
        id: categoryId,
        name: gamme,
        products: [
          {
            id: productId,
            name: gamme,
            description: `Tirage ${gamme}`,
            supports: [
              {
                id: supportId,
                name: gamme,
                description: `Support ${gamme}`,
                technicalSpecs: {
                  gamme: gamme,
                  tauxURSSAF: catalogueJSON.meta.parameters.taux_urssaf,
                  coefficientGlobal: catalogueJSON.meta.parameters.coefficient_global,
                  source: catalogueJSON.meta.source,
                },
                formats: items.map((item) => {
                  const dimensions = item.format.split("×");
                  return {
                    id: item.id,
                    name: item.format,
                    width: parseInt(dimensions[0]) || 0,
                    height: parseInt(dimensions[1]) || 0,
                    price: item.snapshot.prix_site_final_eur,
                  };
                }),
              },
            ],
          },
        ],
      };

      categories.push(category);
      console.log(`  ✅ ${gamme}: ${items.length} formats`);
    });

    // Créer et sauvegarder UN SEUL document
    const config = new TariffConfig({ categories });
    await config.save();

    console.log("\n✅ Import terminé avec succès!");
    console.log(`📊 Résumé:`);
    console.log(`  - ${categories.length} catégories créées`);
    console.log(`  - ${catalogueJSON.items.length} formats importés`);
    console.log(`  - Taux URSSAF: ${catalogueJSON.meta.parameters.taux_urssaf}`);
    console.log(`  - Coefficient global: ${catalogueJSON.meta.parameters.coefficient_global}`);

    // Vérifier qu'il n'y a qu'un seul document
    const finalCount = await TariffConfig.countDocuments();
    console.log(`\n✅ Documents dans la collection: ${finalCount}`);

    if (finalCount === 1) {
      console.log("✅ Parfait ! Un seul document dans la collection.");
    } else {
      console.warn(`⚠️  Attention ! ${finalCount} documents trouvés (devrait être 1)`);
    }

    // Afficher un exemple de prix pour vérification
    console.log("\n📋 Exemple de prix importés:");
    const caisseAmericaine = categories.find(c => c.name === "Caisse Américaine");
    if (caisseAmericaine) {
      const formats = caisseAmericaine.products[0].supports[0].formats;
      formats.slice(0, 3).forEach(f => {
        console.log(`  - ${f.name}: ${f.price}€`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Lancer l'import
importerNouveauCatalogue();
