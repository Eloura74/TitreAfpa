// module.exports = router;
const express = require("express");
const multer = require("multer");
const path = require("path");
const Photo = require("../models/Photo.js");
const fs = require("fs");

const router = express.Router();

// --- Multer config pour upload image ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });
// console.log("BACKEND RECHARGÉ ✅");

// --- GET : toutes les photos ---
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find();
    const photosObj = photos.map((p) => p.toObject());

    const photosModifiees = photosObj.map((photo) => ({
      ...photo,
      tarifs:
        Array.isArray(photo.tarifs) && photo.tarifs.length > 0
          ? photo.tarifs
          : [
              {
                id: "default-" + photo._id,
                format: "Standard",
                support: "Papier photo",
                prix: photo.prix || 0,
              },
            ],
    }));

    res.json(photosModifiees);
  } catch (err) {
    console.error("❌ Erreur GET /galerie :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// --- POST : upload d'image uniquement ---
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  console.log("📸 Fichier reçu :", imagePath);
  res.status(200).json({ imagePath });
});

// --- POST : upload d'une image (Multer uniquement ici) ---
router.post("/upload", upload.single("file"), (req, res) => {
  // Cette route gère uniquement l'upload du fichier image
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier reçu" });
  }
  console.log("📸 Fichier reçu :", req.file.path);
  res.status(200).json({ src: `/uploads/${req.file.filename}` });
});

// --- POST : ajout d'une photo (JSON pur, PAS de Multer) ---
// --- ROUTE REST STANDARD : création d'une photo (JSON pur) ---
router.post("/", async (req, res) => {
  // 1. Log de debug pour suivre la requête
  console.log("=== 🖼️ Nouvelle tentative POST /api/galerie ===");
  console.log("📥 Données brutes reçues :", req.body);

  try {
    // 2. Extraction des champs avec valeurs par défaut
    const {
      src = "/uploads/default.jpg",
      alt = "Photo",
      titre = "Sans titre",
      description = "",
      categorie = "Divers",
      tarifs: rawTarifs = [],
    } = req.body;

    // 3. Gestion et validation des tarifs
    let tarifs = [];
    try {
      if (Array.isArray(rawTarifs)) {
        tarifs = rawTarifs.map((tarif) => ({
          _id: tarif.id || tarif._id,
          format: tarif.format,
          support: tarif.support,
          prix: tarif.prix,
        }));
      } else if (typeof rawTarifs === "string") {
        const parsed = JSON.parse(rawTarifs);
        tarifs = Array.isArray(parsed)
          ? parsed.map((tarif) => ({
              _id: tarif.id || tarif._id,
              format: tarif.format,
              support: tarif.support,
              prix: tarif.prix,
            }))
          : [];
      } else {
        tarifs = [];
      }
      console.log("✅ Tarifs formatés pour Mongoose :", tarifs);
    } catch (err) {
      console.warn("⚠️ Échec parsing JSON des tarifs :", err);
      return res
        .status(400)
        .json({ message: "Tarifs invalides (JSON non conforme)" });
    }

    // 4. Création de la photo
    const nouvellePhoto = new Photo({
      src,
      alt,
      titre,
      description,
      categorie,
      tarifs,
    });

    // 5. Sauvegarde en base
    await nouvellePhoto.save();
    console.log("✅ Photo ajoutée avec succès :", nouvellePhoto);
    return res.status(201).json(nouvellePhoto);
  } catch (err) {
    console.error("❌ Erreur lors de l'ajout de la photo :", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de la photo." });
  }
});

// --- PUT : modification d'une photo ---
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

// --- DELETE : suppression d'une photo ---
router.delete("/:id", async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Photo supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

module.exports = router;
