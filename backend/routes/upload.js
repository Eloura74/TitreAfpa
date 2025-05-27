const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer pour lire le fichier temporairement
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route POST /api/upload-cloudinary
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Buffer image (stockée temporairement en RAM)
    const fileStr = req.file.buffer.toString("base64");
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileStr}`,
      { folder: "galerie" } // Optionnel: pour classer dans un dossier
    );
    // Retourne l’URL Cloudinary
    res.json({ url: uploadResponse.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur upload Cloudinary" });
  }
});

module.exports = router;
