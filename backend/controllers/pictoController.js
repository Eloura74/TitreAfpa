const PictoCategory = require("../models/PictoCategory");

// Récupérer toutes les catégories Picto
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await PictoCategory.find().sort({ createdAt: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories Picto:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
};
