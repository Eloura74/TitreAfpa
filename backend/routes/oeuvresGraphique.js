// Fichier de route Express pour la gestion des œuvres graphiques uniques
// Ce fichier permet de gérer :
// - l’affichage des œuvres
// - leur création, modification, suppression
// - l’upload d’image associée

const express = require("express");
const router = express.Router(); // Initialisation du routeur Express
const OeuvreGraphique = require("../models/OeuvreGraphique.js"); // Import du modèle Mongoose
const multer = require("multer"); // Multer gère les fichiers envoyés via formulaire
const path = require("path");
const fs = require("fs"); // Utilisé ici pour vérifier et créer le dossier de stockage
const { isAdmin } = require("../middleware/auth"); // Middleware de sécurité

console.log("✅ Route oeuvresGraphique.js bien chargée !");

// =====================================
// ROUTES
// =====================================

// NOTE: L'upload local a été désactivé pour la compatibilité Vercel.
// Veuillez utiliser la route /api/upload-cloudinary.

// ----------------------------------------------------
// GET /api/oeuvres-graphique/
// ----------------------------------------------------
// Récupérer toutes les œuvres graphiques depuis la base MongoDB
router.get("/", async (req, res) => {
  try {
    // Récupération de toutes les œuvres
    const oeuvres = await OeuvreGraphique.find();

    // Envoi au client
    res.json(oeuvres);
  } catch (err) {
    // En cas d’erreur serveur
    console.error("Erreur GET /oeuvres-graphique :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ----------------------------------------------------
// POST /api/oeuvres-graphique/
// ----------------------------------------------------
// Créer une nouvelle œuvre graphique à partir de données JSON
router.post("/", isAdmin, async (req, res) => {
  try {
    // Récupération des données envoyées par le client
    const { titre, image, prix, description } = req.body;

    // Vérifie que les champs obligatoires sont présents
    if (!titre || !image || !prix) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Création d’une instance du modèle avec les données fournies
    const nouvelleOeuvre = new OeuvreGraphique({
      titre,
      image,
      prix,
      description,
    });

    // Sauvegarde dans la base MongoDB
    const oeuvreEnregistree = await nouvelleOeuvre.save();

    // Retourne l’œuvre nouvellement enregistrée
    res.status(201).json(oeuvreEnregistree);
  } catch (err) {
    // Gestion des erreurs serveur
    console.error("Erreur POST /oeuvres-graphique :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout", error: err.message });
  }
});

// ----------------------------------------------------
// PUT /api/oeuvres-graphique/:id
// ----------------------------------------------------
// Modifier une œuvre graphique en fonction de son ID
router.put("/:id", isAdmin, async (req, res) => {
  try {
    // Recherche l’œuvre par son ID et applique les modifications
    const updatedOeuvre = await OeuvreGraphique.findByIdAndUpdate(
      req.params.id, // ID dans l’URL
      req.body, // Données à modifier
      { new: true } // Renvoie l’objet mis à jour au lieu de l’ancien
    );

    // Retourne l’œuvre mise à jour
    res.status(200).json(updatedOeuvre);
  } catch (err) {
    // Gestion des erreurs
    res
      .status(500)
      .json({ message: "Erreur modification", error: err.message });
  }
});

// ----------------------------------------------------
// DELETE /api/oeuvres-graphique/:id
// ----------------------------------------------------
// Supprimer une œuvre graphique via son identifiant
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    // Supprime le document correspondant à l’ID
    await OeuvreGraphique.findByIdAndDelete(req.params.id);

    // Répond avec un message de confirmation
    res.status(200).json({ message: "Œuvre supprimée" });
  } catch (err) {
    // Gestion des erreurs
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

// ----------------------------------------------------
// POST /api/oeuvres-graphique/upload
// ----------------------------------------------------
router.post("/upload", isAdmin, (req, res) => {
  return res.status(400).json({
    message: "L'upload local est désactivé. Utilisez /api/upload-cloudinary.",
  });
});

// ----------------------------------------------------
// EXPORTATION DU ROUTEUR
// ----------------------------------------------------
// Ce routeur sera monté dans app.js sur /api/oeuvres-graphique
module.exports = router;
