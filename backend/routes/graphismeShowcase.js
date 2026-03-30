const express = require("express");
const router = express.Router();
const GraphismeShowcase = require("../models/GraphismeShowcase");
const { isAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const showcases = await GraphismeShowcase.find().sort({ ordre: 1 });
    res.json(showcases);
  } catch (err) {
    console.error("Erreur GET /graphisme-showcase :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.post("/", isAdmin, async (req, res) => {
  try {
    const { image, titre, description, ordre } = req.body;

    if (!image || !titre || !ordre) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    if (ordre < 1 || ordre > 2) {
      return res.status(400).json({ message: "L'ordre doit être 1 ou 2" });
    }

    const existingOrdre = await GraphismeShowcase.findOne({ ordre });
    if (existingOrdre) {
      const updated = await GraphismeShowcase.findByIdAndUpdate(
        existingOrdre._id,
        { image, titre, description, ordre, updatedAt: Date.now() },
        { new: true },
      );
      return res.status(200).json({
        message: "Image remplacée avec succès",
        showcase: updated,
      });
    }

    const count = await GraphismeShowcase.countDocuments();
    if (count >= 2) {
      return res.status(400).json({
        message:
          "Maximum 2 images autorisées. Veuillez sélectionner une position existante pour la remplacer.",
      });
    }

    const newShowcase = new GraphismeShowcase({
      image,
      titre,
      description,
      ordre,
    });

    const savedShowcase = await newShowcase.save();
    res.status(201).json(savedShowcase);
  } catch (err) {
    console.error("Erreur POST /graphisme-showcase :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout", error: err.message });
  }
});

router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { ordre } = req.body;

    if (ordre && (ordre < 1 || ordre > 2)) {
      return res.status(400).json({ message: "L'ordre doit être 1 ou 2" });
    }

    if (ordre) {
      const existingOrdre = await GraphismeShowcase.findOne({
        ordre,
        _id: { $ne: req.params.id },
      });
      if (existingOrdre) {
        return res.status(400).json({
          message: `Une autre image existe déjà à la position ${ordre}`,
        });
      }
    }

    const updatedShowcase = await GraphismeShowcase.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true },
    );

    if (!updatedShowcase) {
      return res.status(404).json({ message: "Image non trouvée" });
    }

    res.status(200).json(updatedShowcase);
  } catch (err) {
    console.error("Erreur PUT /graphisme-showcase :", err);
    res
      .status(500)
      .json({ message: "Erreur modification", error: err.message });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const deleted = await GraphismeShowcase.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Image non trouvée" });
    }

    res.status(200).json({ message: "Image supprimée" });
  } catch (err) {
    console.error("Erreur DELETE /graphisme-showcase :", err);
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

module.exports = router;
