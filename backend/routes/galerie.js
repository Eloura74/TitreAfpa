const express = require("express");
const multer = require("multer");
const path = require("path");
const Photo = require("../models/Photo.js");

// ------------------------------
// Configuration
// ------------------------------
const router = express.Router();

// ------------------------------
// Config multer pour upload image
// ------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // dossier uploads/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // nom unique
  },
});

const upload = multer({ storage });

// ------------------------------
// GET – Récupérer toutes les photos
// ------------------------------
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (err) {
    console.error("❌ Erreur GET /galerie :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ------------------------------
// POST – Ajouter une image seule (upload)
// ------------------------------
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  console.log("📸 Fichier reçu :", imagePath);
  res.status(200).json({ imagePath });
});

// ------------------------------
// POST – Enregistrer une photo en base
// ------------------------------
router.post("/", async (req, res) => {
  try {
    const { src, alt, titre, description, prix, categorie } = req.body;

    if (!src || !alt || !titre || !description || !prix || !categorie) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const nouvellePhoto = new Photo({
      src,
      alt,
      titre,
      description,
      prix,
      categorie,
    });

    const photoEnregistree = await nouvellePhoto.save();
    console.log("✅ Photo enregistrée :", photoEnregistree.titre);
    res.status(201).json(photoEnregistree);
  } catch (err) {
    console.error("❌ Erreur POST /galerie :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout", error: err.message });
  }
});

// ------------------------------
// PUT – Modifier une photo
// ------------------------------
router.put("/:id", async (req, res) => {
  try {
    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedPhoto);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur modification", error: err.message });
  }
});

// ------------------------------
// DELETE – Supprimer une photo
// ------------------------------
router.delete("/:id", async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Photo supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

module.exports = router;
