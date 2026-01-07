// Route Express pour l’upload d’image vers Cloudinary
// Cette route permet à un client (navigateur ou frontend) d’envoyer une image,
// qui sera temporairement stockée en mémoire (RAM) puis transférée à Cloudinary.

const express = require("express");
const router = express.Router(); // Initialisation du routeur Express

const cloudinary = require("cloudinary").v2; // Cloudinary gère l’hébergement et le traitement des images

// -------------------------------------------------------------
// CONFIGURATION DE CLOUDINARY À PARTIR DES VARIABLES D'ENVIRONNEMENT
// -------------------------------------------------------------
// Ces variables sont à définir dans ton fichier `.env` ou dans Render/Vercel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Nom de ton compte Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY, // Clé API publique
  api_secret: process.env.CLOUDINARY_API_SECRET, // Clé secrète API (ne jamais exposer côté frontend)
});

// -------------------------------------------------------------
// CONFIGURATION DE MULTER POUR GÉRER L’UPLOAD EN MÉMOIRE
// -------------------------------------------------------------
// Le fichier est temporairement gardé en mémoire (pas stocké sur le disque)
// -------------------------------------------------------------
// GET /api/upload-cloudinary/sign
// -------------------------------------------------------------
// Génère une signature pour permettre au frontend d'uploader directement vers Cloudinary
// Cela permet de contourner la limite de taille de Vercel (4.5MB)
const { authenticate } = require("../middleware/auth");

router.get("/sign", authenticate, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "galerie";

    // Paramètres à signer (doivent correspondre exactement à ceux envoyés par le front)
    const paramsToSign = {
      folder: folder,
      timestamp: timestamp,
      // upload_preset: "ml_default", // Si tu utilises un preset, sinon on signe les params
    };

    // Génération de la signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (err) {
    console.error("Erreur signature Cloudinary:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la génération de la signature" });
  }
});

// -------------------------------------------------------------
// CONFIGURATION DE MULTER
// -------------------------------------------------------------
const multer = require("multer");
const storage = multer.memoryStorage(); // Stockage en mémoire pour traitement rapide
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite à 10MB
});

// -------------------------------------------------------------
// POST /api/upload-cloudinary
// -------------------------------------------------------------
// Upload d'une image vers Cloudinary (via le serveur)
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni." });
    }

    // Conversion du buffer en base64 pour l'envoi à Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "galerie", // Dossier de destination sur Cloudinary
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Erreur upload Cloudinary:", err);
    res.status(500).json({
      error: "Erreur lors de l'upload vers Cloudinary",
      details: err.message,
    });
  }
});

// -------------------------------------------------------------
// EXPORT DU ROUTEUR
// -------------------------------------------------------------
// Ce fichier est monté dans app.js via : app.use('/api/upload-cloudinary', ...)
module.exports = router;
