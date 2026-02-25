const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Configuration de multer pour stocker le fichier en mémoire
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier invalide. Utilisez .xlsx ou .xls"));
    }
  },
});

// Modèle TariffConfig
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

const TariffConfig = mongoose.models.TariffConfig || mongoose.model("TariffConfig", tariffConfigSchema);

// Mapping des gammes
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

// Parser Excel (chargement dynamique pour éviter le timeout)
async function parseExcelFile(buffer) {
  const xlsx = require("xlsx");
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 6 });
  const paramsSheet = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 1 });
  
  const tauxURSSAF = paramsSheet[0] ? parseFloat(paramsSheet[0][1]) : 23.3;
  const coefficientGlobal = paramsSheet[1] ? parseFloat(paramsSheet[1][1]) : 2.5;

  const tarifs = [];
  const errors = [];

  data.forEach((row, index) => {
    if (!row[0] || row[0] === "Gamme / Finition") return;

    const gamme = row[0]?.toString().trim();
    const format = row[1]?.toString().trim();
    const coutFournisseur = parseFloat(row[2]);
    const coefficient = parseFloat(row[3]);
    const prixSite = parseFloat(row[4]);
    const netApresURSSAF = parseFloat(row[5]);
    const margeNette = parseFloat(row[6]);

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

  return { tarifs, errors, params: { tauxURSSAF, coefficientGlobal } };
}

// Conversion vers Picto
function convertToPictoFormat(tarifs) {
  const categoriesMap = new Map();

  tarifs.forEach((tarif) => {
    const mapping = mappingGammes[tarif.gamme];
    if (!mapping) return;

    const { categoryName, productName, supportName } = mapping;

    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        id: uuidv4(),
        name: categoryName,
        products: [],
      });
    }
    const category = categoriesMap.get(categoryName);

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

    const formatExistant = support.formats.find((f) => f.name === tarif.format);
    if (formatExistant) {
      formatExistant.price = tarif.prixSite;
      formatExistant.coutFournisseur = tarif.coutFournisseur;
      formatExistant.margeNette = tarif.margeNette;
    } else {
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

// Handler principal (Vercel Serverless Function)
module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    // Connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Upload du fichier avec multer
    await new Promise((resolve, reject) => {
      upload.single("file")(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    // Parser le fichier
    const { tarifs, errors, params } = await parseExcelFile(req.file.buffer);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Erreurs détectées dans le fichier Excel",
        errors,
      });
    }

    // Convertir en Picto
    const categories = convertToPictoFormat(tarifs);

    // Supprimer l'ancienne config et créer la nouvelle
    await TariffConfig.deleteMany({});
    const newConfig = new TariffConfig({ categories });
    await newConfig.save();

    // Calculer les stats
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
    console.error("Erreur import:", error);
    res.status(500).json({
      message: "Erreur lors de l'import du fichier",
      error: error.message,
    });
  }
};
