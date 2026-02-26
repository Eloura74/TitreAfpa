const TariffConfig = require("../models/TariffConfig");

// Récupérer toutes les catégories depuis tariffconfis (données réelles)
exports.getAllCategories = async (req, res) => {
  try {
    const config = await TariffConfig.findOne().sort({ createdAt: -1 });

    if (!config || !config.categories || config.categories.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(config.categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
