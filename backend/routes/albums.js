const express = require("express");
const router = express.Router();
const Album = require("../models/Album");
const Photo = require("../models/Photo");

// GET /api/albums - Récupérer tous les albums
router.get("/", async (req, res) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });
    res.json(albums);
  } catch (err) {
    console.error("Erreur GET /albums :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST /api/albums - Créer un nouvel album
router.post("/", async (req, res) => {
  try {
    const { titre, description, imageCouverture } = req.body;
    if (!titre) {
      return res.status(400).json({ message: "Le titre est obligatoire" });
    }

    const newAlbum = new Album({
      titre,
      description,
      imageCouverture,
    });

    await newAlbum.save();
    res.status(201).json(newAlbum);
  } catch (err) {
    console.error("Erreur POST /albums :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// PUT /api/albums/:id - Modifier un album
router.put("/:id", async (req, res) => {
  try {
    const { titre, description, imageCouverture } = req.body;
    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      { titre, description, imageCouverture },
      { new: true }
    );

    if (!updatedAlbum) {
      return res.status(404).json({ message: "Album non trouvé" });
    }

    res.json(updatedAlbum);
  } catch (err) {
    console.error("Erreur PUT /albums/:id :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// DELETE /api/albums/:id - Supprimer un album
router.delete("/:id", async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);
    if (!album) {
      return res.status(404).json({ message: "Album non trouvé" });
    }

    // Optionnel : Désassigner les photos de cet album
    await Photo.updateMany({ album: req.params.id }, { $set: { album: null } });

    res.json({ message: "Album supprimé et photos désassignées" });
  } catch (err) {
    console.error("Erreur DELETE /albums/:id :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
