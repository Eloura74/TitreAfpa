const express = require("express");
const router = express.Router();
const CoverImage = require("../models/CoverImage");
const { isAdmin } = require("../middleware/auth");

// GET - Récupérer une couverture par type
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const validTypes = [
      "photographie",
      "graphisme-galerie",
      "graphisme-decouvrir",
      "services",
      "prestations",
      "reportages",
      "formations",
      "background-site",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Type de couverture invalide" });
    }

    const cover = await CoverImage.findOne({ type });

    if (!cover) {
      return res
        .status(404)
        .json({ message: "Aucune couverture trouvée pour ce type" });
    }

    res.json(cover);
  } catch (err) {
    console.error(`Erreur GET /covers/${req.params.type} :`, err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST - Créer une nouvelle couverture
router.post("/:type", isAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { image, titre, description } = req.body;

    const validTypes = [
      "photographie",
      "graphisme-galerie",
      "graphisme-decouvrir",
      "services",
      "prestations",
      "reportages",
      "formations",
      "background-site",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Type de couverture invalide" });
    }

    if (!image) {
      return res.status(400).json({ message: "Image requise" });
    }

    // Générer un titre par défaut si non fourni
    const finalTitre =
      titre || type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    // Vérifier si une couverture existe déjà pour ce type
    const existingCover = await CoverImage.findOne({ type });
    if (existingCover) {
      // Mettre à jour au lieu de créer
      const updated = await CoverImage.findByIdAndUpdate(
        existingCover._id,
        { image, titre: finalTitre, description, updatedAt: Date.now() },
        { new: true },
      );
      return res.status(200).json({
        message: "Couverture mise à jour avec succès",
        cover: updated,
      });
    }

    // Créer une nouvelle couverture
    const newCover = new CoverImage({
      image,
      titre: finalTitre,
      description,
      type,
    });

    const savedCover = await newCover.save();
    res.status(201).json(savedCover);
  } catch (err) {
    console.error(`Erreur POST /covers/${req.params.type} :`, err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout", error: err.message });
  }
});

// PUT - Mettre à jour une couverture existante
router.put("/:type/:id", isAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { image, titre, description } = req.body;

    const validTypes = [
      "photographie",
      "graphisme-galerie",
      "graphisme-decouvrir",
      "services",
      "prestations",
      "reportages",
      "formations",
      "background-site",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Type de couverture invalide" });
    }

    const updatedCover = await CoverImage.findByIdAndUpdate(
      id,
      { image, titre, description, type, updatedAt: Date.now() },
      { new: true },
    );

    if (!updatedCover) {
      return res.status(404).json({ message: "Couverture non trouvée" });
    }

    res.status(200).json(updatedCover);
  } catch (err) {
    console.error(
      `Erreur PUT /covers/${req.params.type}/${req.params.id} :`,
      err,
    );
    res
      .status(500)
      .json({ message: "Erreur modification", error: err.message });
  }
});

// DELETE - Supprimer une couverture
router.delete("/:type/:id", isAdmin, async (req, res) => {
  try {
    const deleted = await CoverImage.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Couverture non trouvée" });
    }

    res.status(200).json({ message: "Couverture supprimée" });
  } catch (err) {
    console.error(
      `Erreur DELETE /covers/${req.params.type}/${req.params.id} :`,
      err,
    );
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

module.exports = router;
