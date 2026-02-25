const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI;

// Schéma Picto (même structure que ta BD actuelle)
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
  { timestamps: true },
);

const PictoConfig = mongoose.model("tariffconfis", pictoSchema);

// Mapping des gammes du catalogue vers la structure Picto existante
const mappingGammes = {
  "Petits formats": {
    categoryName: "Tirage Photo",
    productName: "Argentique sur Lambda",
    supportName: "RC Couleur Satiné Fuji 230g",
  },
  Lambda: {
    categoryName: "Tirage Photo",
    productName: "Argentique sur Lambda",
    supportName: "RC Couleur Brillant Fuji 250g",
  },
  Pigmentaire: {
    categoryName: "Tirage Photo",
    productName: "Jet d'encre Pigmentaire",
    supportName: "Hahnemühle Photo Rag 308g",
  },
  Dibond: {
    categoryName: "Photo Contrecollée",
    productName: "Contrecollage sur Dibond",
    supportName: "Dibond 3mm",
  },
  Plexi: {
    categoryName: "Photo sous Plexi",
    productName: "Tirage Plexicollé",
    supportName: "Plexi Brillant 4mm",
  },
  "Caisse Américaine": {
    categoryName: "Photo Encadrée",
    productName: "Caisse Américaine",
    supportName: "Bois Noir Satiné",
  },
  "Encadrement d'Art": {
    categoryName: "Photo Encadrée",
    productName: "Cadre Nielsen Alpha",
    supportName: "Alu Noir Mat",
  },
  "Nielsen Sur Mesure": {
    categoryName: "Photo Encadrée",
    productName: "Cadre Nielsen Alpha",
    supportName: "Alu Noir Mat",
  },
};

async function fusionnerCatalogue() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Récupérer la config Picto existante
    console.log("📖 Récupération de la configuration Picto existante...");
    let config = await PictoConfig.findOne().sort({ createdAt: -1 });

    if (!config) {
      console.log(
        "⚠️  Aucune configuration trouvée, création d'une nouvelle...",
      );
      config = new PictoConfig({ categories: [] });
    }

    console.log(
      `📊 Configuration actuelle: ${config.categories.length} catégories`,
    );

    // Lire le catalogue
    const cataloguePath = path.join(
      __dirname,
      "../../photographie/src/data/catalogue-tarifs.json",
    );
    const catalogueData = JSON.parse(fs.readFileSync(cataloguePath, "utf8"));
    console.log(`📋 ${catalogueData.length} tarifs à intégrer`);

    let formatsAjoutes = 0;
    let supportsAjoutes = 0;
    let produitsAjoutes = 0;
    let categoriesAjoutees = 0;

    // Traiter chaque tarif du catalogue
    catalogueData.forEach((tarif) => {
      const mapping = mappingGammes[tarif.gamme];
      if (!mapping) {
        console.warn(`⚠️  Gamme non mappée: ${tarif.gamme}`);
        return;
      }

      const { categoryName, productName, supportName } = mapping;

      // Trouver ou créer la catégorie
      let category = config.categories.find((c) => c.name === categoryName);
      if (!category) {
        category = {
          id: uuidv4(),
          name: categoryName,
          products: [],
        };
        config.categories.push(category);
        categoriesAjoutees++;
        console.log(`  ✨ Nouvelle catégorie: ${categoryName}`);
      }

      // Trouver ou créer le produit
      let product = category.products.find((p) => p.name === productName);
      if (!product) {
        product = {
          id: uuidv4(),
          name: productName,
          description: `Tirage ${tarif.gamme}`,
          supports: [],
        };
        category.products.push(product);
        produitsAjoutes++;
        console.log(`    ✨ Nouveau produit: ${productName}`);
      }

      // Trouver ou créer le support
      let support = product.supports.find((s) => s.name === supportName);
      if (!support) {
        support = {
          id: uuidv4(),
          name: supportName,
          description: `Support pour ${tarif.gamme}`,
          technicalSpecs: {
            gamme: tarif.gamme,
            coefficient: tarif.coefficient.toString(),
            coutFournisseur: tarif.coutFournisseurTTC,
          },
          formats: [],
        };
        product.supports.push(support);
        supportsAjoutes++;
        console.log(`      ✨ Nouveau support: ${supportName}`);
      }

      // Vérifier si le format existe déjà
      const formatExiste = support.formats.find((f) => f.name === tarif.format);
      if (!formatExiste) {
        // Ajouter le format
        const dimensions = tarif.format.split("×");
        support.formats.push({
          id: uuidv4(),
          name: tarif.format,
          width: parseInt(dimensions[0]) || 0,
          height: parseInt(dimensions[1]) || 0,
          price: tarif.prixSite,
        });
        formatsAjoutes++;
      } else {
        console.log(`      ⏭️  Format déjà existant: ${tarif.format}`);
      }
    });

    // Sauvegarder la configuration mise à jour
    console.log("\n💾 Sauvegarde de la configuration...");
    await config.save();

    console.log("\n✅ Fusion terminée avec succès!");
    console.log(`📊 Résumé:`);
    console.log(`  - ${categoriesAjoutees} catégories ajoutées`);
    console.log(`  - ${produitsAjoutes} produits ajoutés`);
    console.log(`  - ${supportsAjoutes} supports ajoutés`);
    console.log(`  - ${formatsAjoutes} formats ajoutés`);
    console.log(
      `\n📦 Total: ${config.categories.length} catégories dans la base`,
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la fusion:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Lancer la fusion
fusionnerCatalogue();
