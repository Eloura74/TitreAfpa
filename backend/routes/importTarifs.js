const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const { isAdmin } = require("../middleware/auth");

// Configuration de multer pour stocker le fichier en mémoire
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les fichiers Excel
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier invalide. Utilisez .xlsx ou .xls"));
    }
  },
});

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

// Fonction pour parser le fichier Excel et extraire les tarifs
function parseExcelFile(buffer) {
  // Lire le fichier Excel depuis le buffer
  const workbook = xlsx.read(buffer, { type: "buffer" });

  // Prendre la première feuille
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convertir en JSON (range à partir de la ligne 7 pour les tarifs)
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 6 }); // Ligne 7 = index 6

  // Extraire les paramètres (lignes 2 et 3)
  const paramsSheet = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 1 });
  const tauxURSSAF = paramsSheet[0] ? parseFloat(paramsSheet[0][1]) : 23.3;
  const coefficientGlobal = paramsSheet[1] ? parseFloat(paramsSheet[1][1]) : 2.5;

  const tarifs = [];
  const errors = [];

  // Parser chaque ligne de tarif
  data.forEach((row, index) => {
    // Ignorer les lignes vides ou d'en-tête
    if (!row[0] || row[0] === "Gamme / Finition") return;

    const gamme = row[0]?.toString().trim();
    const format = row[1]?.toString().trim();
    const coutFournisseur = parseFloat(row[2]);
    const coefficient = parseFloat(row[3]);
    const prixSite = parseFloat(row[4]);
    const netApresURSSAF = parseFloat(row[5]);
    const margeNette = parseFloat(row[6]);

    // Validation des données
    if (!gamme || !format) {
      errors.push(`Ligne ${index + 7}: Gamme ou Format manquant`);
      return;
    }

    if (isNaN(prixSite) || prixSite <= 0) {
      errors.push(`Ligne ${index + 7}: Prix invalide pour ${gamme} ${format}`);
      return;
    }

    tarifs.push({
      gamme,
      format,
      coutFournisseur: coutFournisseur || 0,
      coefficient: coefficient || coefficientGlobal,
      prixSite,
      netApresURSSAF: netApresURSSAF || 0,
      margeNette: margeNette || 0,
    });
  });

  return {
    tarifs,
    errors,
    params: {
      tauxURSSAF,
      coefficientGlobal,
    },
  };
}

// Fonction pour convertir les tarifs Excel en structure Picto
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

// POST /api/tarifs/import-excel - Importer un fichier Excel de tarifs
router.post("/import-excel", isAdmin, upload.single("file"), async (req, res) => {
  try {
    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    console.log("📁 Fichier reçu:", req.file.originalname);

    // Parser le fichier Excel
    const { tarifs, errors, params } = parseExcelFile(req.file.buffer);

    // Si des erreurs de parsing
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Erreurs détectées dans le fichier Excel",
        errors,
      });
    }

    console.log(`📊 ${tarifs.length} tarifs extraits du fichier`);

    // Convertir en format Picto
    const categories = convertToPictoFormat(tarifs);

    // Récupérer le modèle TariffConfig
    const TariffConfig = require("../models/TariffConfig");

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
        params,
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    res.status(500).json({
      message: "Erreur lors de l'import du fichier",
      error: error.message,
    });
  }
});

module.exports = router;
