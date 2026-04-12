const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { isAdmin } = require("../middleware/auth");
const TariffConfig = require("../models/TariffConfig");

// Route POST pour importer les tarifs depuis JSON
router.post("/import-json", isAdmin, async (req, res) => {
  try {
    const { tarifs, params } = req.body;

    if (!tarifs || !Array.isArray(tarifs) || tarifs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun tarif fourni",
      });
    }

    // Grouper les tarifs par gamme
    const tarifsParGamme = {};
    tarifs.forEach((tarif) => {
      const gamme = tarif.gamme;
      if (!tarifsParGamme[gamme]) {
        tarifsParGamme[gamme] = [];
      }
      tarifsParGamme[gamme].push(tarif);
    });

    // Créer la structure pour MongoDB
    const categories = [];

    Object.entries(tarifsParGamme).forEach(([gamme, items]) => {
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
                  tauxURSSAF: params?.tauxURSSAF || 0.233,
                  coefficientGlobal: params?.coefficientGlobal || 2.5,
                },
                formats: items.map((item) => {
                  const dimensions = item.format.split("×");
                  return {
                    id: uuidv4(),
                    name: item.format,
                    width: parseInt(dimensions[0]) || 0,
                    height: parseInt(dimensions[1]) || 0,
                    price: item.prixSite,
                    coutFournisseur: item.coutFournisseur || 0,
                    margeNette: item.margeNette || 0,
                  };
                }),
              },
            ],
          },
        ],
      };

      categories.push(category);
    });

    // Supprimer l'ancienne configuration
    await TariffConfig.deleteMany({});

    // Créer et sauvegarder la nouvelle configuration
    const config = new TariffConfig({
      categories,
      globalCoefficient: params?.coefficientGlobal || 1.75,
    });
    await config.save();

    res.json({
      success: true,
      message: "Import réussi",
      stats: {
        categories: categories.length,
        totalFormats: tarifs.length,
        tarifsImportes: tarifs.length,
        params: {
          tauxURSSAF: params?.tauxURSSAF || 0.233,
          coefficientGlobal: params?.coefficientGlobal || 2.5,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'import JSON:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'import",
      error: error.message,
    });
  }
});

module.exports = router;
