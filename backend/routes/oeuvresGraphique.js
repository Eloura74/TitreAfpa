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

console.log("✅ Route oeuvresGraphique.js bien chargée !");

// ----------------------------------------------------
// CONFIGURATION DE MULTER POUR L’UPLOAD DE FICHIERS
// ----------------------------------------------------

const storage = multer.diskStorage({
  // Détermine le dossier de destination
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");

    // Vérifie si le dossier existe, sinon le crée
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("✅ Dossier uploads créé : ", uploadDir);
    }

    // Passe le chemin au callback
    cb(null, uploadDir);
  },

  // Détermine le nom du fichier une fois sauvegardé
  filename: function (req, file, cb) {
    const fileName = Date.now() + "-" + file.originalname.replace(/\s/g, "_"); // Remplace les espaces
    console.log("📸 Nom du fichier généré : ", fileName);
    cb(null, fileName);
  },
});

// Création du middleware multer prêt à l’emploi
const upload = multer({ storage });

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
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
// Permet d’uploader une image seule (avant ou après la création d’une œuvre)
router.post("/upload", upload.single("image"), (req, res) => {
  // Vérifie qu’un fichier a bien été reçu
  if (!req.file) {
    console.error("❌ Erreur upload : aucun fichier reçu");
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }

  // Crée le chemin d'accès public pour l’image
  const imagePath = `/uploads/${req.file.filename}`;

  // Vérifie que le fichier existe réellement sur le disque
  const filePath = path.join(__dirname, "../uploads", req.file.filename);
  console.log("📁 Fichier uploadé : ", filePath);
  console.log("🔗 Chemin d'accès public : ", imagePath);

  // Vérifie que le fichier existe bien sur le disque avec fs.existsSync()
  if (fs.existsSync(filePath)) {
    console.log("✅ Vérification : le fichier existe bien sur le disque");
  } else {
    console.error(
      "❌ Erreur : le fichier n'existe pas sur le disque après upload"
    );
  }

  // Retourne le chemin de l’image au client
  res.status(200).json({ imagePath });
});

// ----------------------------------------------------
// EXPORTATION DU ROUTEUR
// ----------------------------------------------------
// Ce routeur sera monté dans app.js sur /api/oeuvres-graphique
module.exports = router;
