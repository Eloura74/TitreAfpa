// Route Express pour l’upload d’image vers Cloudinary
// Cette route permet à un client (navigateur ou frontend) d’envoyer une image,
// qui sera temporairement stockée en mémoire (RAM) puis transférée à Cloudinary.

const express = require("express");
const router = express.Router(); // Initialisation du routeur Express

const multer = require("multer"); // Multer est utilisé pour gérer l’envoi de fichiers via formulaire
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
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Middleware pour une image unique dans le champ "image"

// -------------------------------------------------------------
// POST /api/upload-cloudinary
// -------------------------------------------------------------
// Cette route reçoit un fichier image depuis un formulaire ou un appel frontend
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // 1. Convertit le fichier en base64 à partir du buffer en RAM
    const fileStr = req.file.buffer.toString("base64");
    console.log("Upload Cloudinary - Mimetype:", req.file.mimetype);

    // 2. Envoie l’image à Cloudinary avec le bon format MIME
    // On force un nom de fichier explicite pour éviter le bug du "_"
    const sanitizedFilename = req.file.originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const publicId = `${Date.now()}_${sanitizedFilename}`;

    const uploadResponse = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileStr}`, 
      {
        folder: "galerie", 
        resource_type: "auto",
        public_id: publicId, // On force l'ID
        use_filename: true,
        unique_filename: false
      }
    );
    console.log("Réponse Cloudinary:", uploadResponse);

    // 3. Retourne l’URL sécurisée de l’image hébergée (https)
    res.json({ url: uploadResponse.secure_url });
  } catch (err) {
    // Gestion des erreurs : problème avec l’upload ou les identifiants API
    console.error(err);
    res.status(500).json({ message: "Erreur upload Cloudinary" });
  }
});

// -------------------------------------------------------------
// EXPORT DU ROUTEUR
// -------------------------------------------------------------
// Ce fichier est monté dans app.js via : app.use('/api/upload-cloudinary', ...)
module.exports = router;
