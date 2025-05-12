// Route Express pour les œuvres graphiques uniques
const express = require("express");
const router = express.Router();
const OeuvreGraphique = require("../models/OeuvreGraphique.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("✅ Route oeuvresGraphique.js bien chargée !");
// Configuration de Multer pour les uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Création du dossier uploads s'il n'existe pas
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("✅ Dossier uploads créé : ", uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Normalisation du nom de fichier (espaces -> underscores)
    const fileName = Date.now() + "-" + file.originalname.replace(/\s/g, "_");
    console.log("📸 Nom du fichier généré : ", fileName);
    cb(null, fileName);
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

// POST pour upload d'image seule
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    console.error("❌ Erreur upload : aucun fichier reçu");
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }
  
  const imagePath = `/uploads/${req.file.filename}`;
  
  // Vérification que le fichier existe bien après upload
  const filePath = path.join(__dirname, "../uploads", req.file.filename);
  console.log("📁 Fichier uploadé : ", filePath);
  console.log("🔗 Chemin d'accès public : ", imagePath);
  
  if (fs.existsSync(filePath)) {
    console.log("✅ Vérification : le fichier existe bien sur le disque");
  } else {
    console.error("❌ Erreur : le fichier n'existe pas sur le disque après upload");
  }
  
  res.status(200).json({ imagePath });
});

module.exports = router;
