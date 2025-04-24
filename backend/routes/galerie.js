// Importation des modules nécessaires
const express = require("express"); // Framework pour gérer les routes HTTP
const multer = require("multer"); // Middleware pour gérer l'upload de fichiers
const path = require("path"); // Module Node.js pour gérer les chemins de fichiers
const Photo = require("../models/Photo.js"); // Modèle Mongoose pour interagir avec les photos en base

// ------------------------------
// Initialisation du routeur Express
// ------------------------------
const router = express.Router();

// ------------------------------
// Configuration de Multer pour gérer l'upload des images
// ------------------------------
const storage = multer.diskStorage({
  // Définition du dossier de destination où seront stockées les images uploadées
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // Stockage dans le dossier "uploads/"
  },

  // Génération d'un nom de fichier unique basé sur la date actuelle pour éviter les conflits
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Exemple : 1617891234567-image.jpg
  },
});

// Initialisation de Multer avec la configuration définie
const upload = multer({ storage });

// ------------------------------
// Route GET – Récupérer toutes les photos de la base de données
// ------------------------------
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find(); // Récupération de toutes les photos via Mongoose
    res.json(photos); // Envoi des données au format JSON
  } catch (err) {
    console.error("❌ Erreur GET /galerie :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ------------------------------
// Route POST – Upload d'une image seule via Multer
// ------------------------------
router.post("/upload", upload.single("image"), (req, res) => {
  // Vérifie si un fichier a bien été envoyé
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé." });
  }

  // Construction du chemin d'accès à l'image stockée
  const imagePath = `/uploads/${req.file.filename}`;
  console.log("📸 Fichier reçu :", imagePath);

  // Réponse avec le chemin de l'image pour l'utiliser côté frontend
  res.status(200).json({ imagePath });
});

// ------------------------------
// Route POST – Enregistrer les informations d'une photo en base de données
// ------------------------------
router.post("/", async (req, res) => {
  try {
    // Destructuration des champs attendus dans le corps de la requête
    const { src, alt, titre, description, prix, categorie } = req.body;

    // Vérification que tous les champs requis sont présents
    if (!src || !alt || !titre || !description || !prix || !categorie) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Création d'une nouvelle instance de Photo avec les données reçues
    const nouvellePhoto = new Photo({
      src,
      alt,
      titre,
      description,
      prix,
      categorie,
    });

    // Sauvegarde dans MongoDB
    const photoEnregistree = await nouvellePhoto.save();
    console.log("✅ Photo enregistrée :", photoEnregistree.titre);

    // Réponse avec la photo enregistrée
    res.status(201).json(photoEnregistree);
  } catch (err) {
    console.error("❌ Erreur POST /galerie :", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout", error: err.message });
  }
});

// ------------------------------
// Route PUT – Modifier une photo existante via son ID
// ------------------------------
router.put("/:id", async (req, res) => {
  try {
    // Mise à jour de la photo correspondant à l'ID fourni avec les nouvelles données du corps de la requête
    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id, // ID de la photo à modifier
      req.body, // Nouvelles données
      { new: true } // Option pour retourner la version mise à jour du document
    );

    res.status(200).json(updatedPhoto);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur modification", error: err.message });
  }
});

// ------------------------------
// Route DELETE – Supprimer une photo via son ID
// ------------------------------
router.delete("/:id", async (req, res) => {
  try {
    // Suppression de la photo correspondant à l'ID fourni
    await Photo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Photo supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur suppression", error: err.message });
  }
});

// ------------------------------
// Exportation du routeur
// ------------------------------
module.exports = router;
