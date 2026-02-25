const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { isAdmin } = require("../middleware/auth");
const TariffConfig = require("../models/TariffConfig");

// Mapping des gammes vers la structure Picto
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

// Fonction pour convertir les tarifs JSON en structure Picto
function convertToPictoFormat(tarifs) {
  const categoriesMap = new Map();

  tarifs.forEach((tarif) => {
    const mapping = mappingGammes[tarif.gamme];
    if (!mapping) {
      console.warn(`⚠️ Gamme non mappée: ${tarif.gamme}`);
      return;
    }

    const { categoryName, productName, supportName } = mapping;

    // Créer ou récupérer la catégorie
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        id: uuidv4(),
        name: categoryName,
        products: [],
      });
    }
    const category = categoriesMap.get(categoryName);

    // Créer ou récupérer le produit
    let product = category.products.find((p) => p.name === productName);
    if (!product) {
      product = {
        id: uuidv4(),
        name: productName,
        description: `Tirage ${tarif.gamme}`,
        supports: [],
      };
      category.products.push(product);
    }

    // Créer ou récupérer le support
    let support = product.supports.find((s) => s.name === supportName);
    if (!support) {
      support = {
        id: uuidv4(),
        name: supportName,
        description: `Support pour ${tarif.gamme}`,
        technicalSpecs: {
          gamme: tarif.gamme,
          coefficient: tarif.coefficient.toString(),
          coutFournisseur: tarif.coutFournisseur,
        },
        formats: [],
      };
      product.supports.push(support);
    }

    // Vérifier si le format existe déjà (détection de doublon)
    const formatExistant = support.formats.find((f) => f.name === tarif.format);

    if (formatExistant) {
      // REMPLACEMENT : mettre à jour le prix
      formatExistant.price = tarif.prixSite;
      formatExistant.coutFournisseur = tarif.coutFournisseur;
      formatExistant.margeNette = tarif.margeNette;
    } else {
      // AJOUT : nouveau format
      const dimensions = tarif.format.split("×");
      support.formats.push({
        id: uuidv4(),
        name: tarif.format,
        width: parseInt(dimensions[0]) || 0,
        height: parseInt(dimensions[1]) || 0,
        price: tarif.prixSite,
        coutFournisseur: tarif.coutFournisseur,
        margeNette: tarif.margeNette,
      });
    }
  });

  return Array.from(categoriesMap.values());
}

// POST /api/tarifs/import-json - Importer des tarifs depuis JSON (parsing Excel fait côté frontend)
router.post("/import-json", isAdmin, async (req, res) => {
  try {
    const { tarifs, params } = req.body;

    // Validation
    if (!tarifs || !Array.isArray(tarifs) || tarifs.length === 0) {
      return res.status(400).json({ message: "Aucun tarif fourni" });
    }

    console.log(`📊 ${tarifs.length} tarifs reçus pour import`);

    // Convertir en format Picto
    const categories = convertToPictoFormat(tarifs);

    // Supprimer l'ancienne configuration (remplacement complet)
    await TariffConfig.deleteMany({});
    console.log("🗑️ Ancienne configuration supprimée");

    // Créer la nouvelle configuration
    const newConfig = new TariffConfig({ categories });
    await newConfig.save();

    console.log("✅ Nouvelle configuration sauvegardée");

    // Calculer les statistiques
    let totalFormats = 0;
    categories.forEach((cat) => {
      cat.products.forEach((prod) => {
        prod.supports.forEach((supp) => {
          totalFormats += supp.formats.length;
        });
      });
    });

    res.json({
      success: true,
      message: "Import réussi",
      stats: {
        categories: categories.length,
        totalFormats,
        tarifsImportes: tarifs.length,
        params: params || {},
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    res.status(500).json({
      message: "Erreur lors de l'import des tarifs",
      error: error.message,
    });
  }
});

module.exports = router;
