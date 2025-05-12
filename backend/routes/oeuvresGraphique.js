// Route Express pour les œuvres graphiques uniques
const express = require("express");
const router = express.Router();
const OeuvreGraphique = require("../models/OeuvreGraphique.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("✅ Route oeuvresGraphique.js bien chargée !");
// Configuration de Multer pour les uploads (optionnel, à activer si tu veux gérer les images uploadées)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// GET : récupérer toutes les œuvres graphiques uniques
router.get("/", async (req, res) => {
  try {
    const oeuvres = await OeuvreGraphique.find();
    res.json(oeuvres);
  } catch (err) {
    console.error("Erreur GET /oeuvres-graphique :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST : ajouter une œuvre graphique unique
router.post("/", async (req, res) => {
  try {
    const { titre, image, prix, description } = req.body;
    if (!titre || !image || !prix) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }
    const nouvelleOeuvre = new OeuvreGraphique({
      titre,
      image,
      prix,
      description,
    });
    const oeuvreEnregistree = await nouvelleOeuvre.save();
    res.status(201).json(oeuvreEnregistree);
  } catch (err) {
    console.error("Erreur POST /oeuvres-graphique :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout", error: err.message });
  }
});

// PUT : modifier une œuvre graphique par ID
router.put("/:id", async (req, res) => {
  try {
    const updatedOeuvre = await OeuvreGraphique.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedOeuvre);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur modification", error: err.message });
  }
});

// DELETE : supprimer une œuvre graphique par ID
router.delete("/:id", async (req, res) => {
  try {
    await OeuvreGraphique.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Œuvre supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

// (Optionnel) POST pour upload d'image seule (à activer côté front si besoin)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ imagePath });
});

module.exports = router;
