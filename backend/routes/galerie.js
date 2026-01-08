// Fichier de routes Express pour la gestion des photos (galerie)
// Cette API permet d’ajouter, lire, modifier et supprimer des photos dans la base de données,
// ainsi que de gérer l’upload d’images depuis le client.

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../models/Photo.js"); // Modèle Mongoose "Photo"

const router = express.Router(); // Création d’un routeur Express

// =====================================
// ROUTES
// =====================================

// NOTE: L'upload local (multer diskStorage) a été désactivé pour la compatibilité Vercel.
// Veuillez utiliser la route /api/upload-cloudinary pour uploader des images.

// ------------------------------
// GET /api/galerie
// ------------------------------
// Récupère toutes les photos enregistrées en base
router.get("/", async (req, res) => {
  try {
    // Récupération brute depuis MongoDB (Exclusion des photos privées via Regex insensible à la casse)
    const photos = await Photo.find({ categorie: { $not: /EvenementPrive/i } });

    // Convertit les documents Mongoose en objets JavaScript simples
    const photosObj = photos.map((p) => p.toObject());

    // Pour chaque photo, on vérifie s’il y a des tarifs associés
    // Si non, on ajoute un tarif par défaut à afficher dans le front
    const photosModifiees = photosObj.map((photo) => ({
      ...photo,
      tarifs:
        // Si le champ tarifs est un tableau et qu’il contient des éléments
        Array.isArray(photo.tarifs) && photo.tarifs.length > 0
          ? photo.tarifs // Utilise les tarifs existants
          : [
              {
                id: "default-" + photo._id, // Génère un ID temporaire
                format: "Standard", // Format par défaut
                support: "Papier photo", // Support par défaut
                prix: photo.prix || 0, // Utilise le prix global si disponible
              },
            ],
    }));

    // Envoie le tableau final au client
    res.json(photosModifiees);
  } catch (err) {
    // En cas d’erreur (connexion DB, etc.)
    console.error("❌ Erreur GET /galerie :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ------------------------------
// POST /api/galerie/upload
// ------------------------------
router.post("/upload", (req, res) => {
  return res.status(400).json({
    message: "L'upload local est désactivé. Utilisez /api/upload-cloudinary.",
  });
});

// ------------------------------
// POST /api/galerie
// ------------------------------
// Création d’une photo depuis des données JSON (sans fichier)
router.post("/", async (req, res) => {
  console.log("=== 🖼️ POST /api/galerie ===");
  console.log("📥 Données reçues :", req.body);

  try {
    // Récupère les champs avec valeurs par défaut si manquants
    const {
      src = "/uploads/default.jpg", // Chemin de l'image
      alt = "Photo", // Texte alternatif
      titre = "Sans titre", // Titre affiché
      description = "", // Description facultative
      categorie = "Divers", // Catégorie (ex: mariage)
      tarifs: rawTarifs = [], // Liste des tarifs (brut)
      availableTariffIds = [], // Nouveaux IDs hiérarchiques
    } = req.body;

    // Initialisation du tableau de tarifs final
    let tarifs = [];

    try {
      if (Array.isArray(rawTarifs)) {
        // Si les tarifs sont déjà un tableau JSON
        tarifs = rawTarifs.map((tarif) => ({
          _id: tarif.id || tarif._id, // Identifiant (optionnel)
          format: tarif.format,
          support: tarif.support,
          prix: tarif.prix,
        }));
      } else if (typeof rawTarifs === "string") {
        // Si les tarifs sont une chaîne JSON (cas des formulaires)
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
        tarifs = []; // Sinon, vide
      }

      console.log("✅ Tarifs validés :", tarifs);
    } catch (err) {
      // Si JSON.parse échoue
      console.warn("⚠️ Tarifs invalides :", err);
      return res
        .status(400)
        .json({ message: "Tarifs invalides (JSON non conforme)" });
    }

    // Création de l'objet photo avec les données nettoyées
    const nouvellePhoto = new Photo({
      src,
      alt,
      titre,
      description,
      categorie,
      tarifs,
      availableTariffIds,
    });

    // Sauvegarde en base
    await nouvellePhoto.save();

    console.log("✅ Photo enregistrée :", nouvellePhoto);
    return res.status(201).json(nouvellePhoto);
  } catch (err) {
    // En cas d'erreur inattendue
    console.error("❌ Erreur création photo :", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de la photo.",
    });
  }
});

// ------------------------------
// PUT /api/galerie/:id
// ------------------------------
// Modification d’une photo existante via son ID
router.put("/:id", async (req, res) => {
  try {
    // Recherche de la photo par ID et mise à jour avec les nouvelles données
    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Renvoie l’objet mis à jour
      }
    );

    // Envoie la photo modifiée au client
    res.status(200).json(updatedPhoto);
  } catch (err) {
    // Erreur lors de la mise à jour
    res.status(500).json({
      message: "Erreur modification",
      error: err.message,
    });
  }
});

// ------------------------------
// DELETE /api/galerie/:id
// ------------------------------
// Suppression d’une photo par son identifiant
router.delete("/:id", async (req, res) => {
  try {
    // Supprime le document photo de la base
    await Photo.findByIdAndDelete(req.params.id);

    // Renvoie un message de confirmation
    res.status(200).json({ message: "Photo supprimée" });
  } catch (err) {
    // Erreur lors de la suppression
    res.status(500).json({
      message: "Erreur suppression",
      error: err.message,
    });
  }
});

// Exportation du routeur pour inclusion dans app.js
module.exports = router;
