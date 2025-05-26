// Importation des modules nécessaires
const express = require("express"); // Framework pour gérer les routes HTTP
const multer = require("multer"); // Middleware pour gérer l'upload de fichiers
const path = require("path"); // Module Node.js pour gérer les chemins de fichiers
const Photo = require("../models/Photo.js"); // Modèle Mongoose pour interagir avec les photos en base
const fs = require("fs"); // Module Node.js pour gérer les fichiers

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
    // Récupération des photos avec tous les champs
    const photos = await Photo.find();

    // Conversion en objets JavaScript purs pour manipulation
    const photosObj = photos.map((p) => p.toObject());

    // Log détaillé pour déboguer
    console.log("=== Débogage GET /galerie ===");
    console.log("Nombre de photos récupérées:", photosObj.length);

    // Vérification détaillée de chaque photo
    const photosModifiees = photosObj.map((photo) => {
      console.log(
        `Photo ${photo.titre} - Champs disponibles:`,
        Object.keys(photo)
      );
      console.log(`Photo ${photo.titre} - tarifs:`, photo.tarifs);

      // SOLUTION RADICALE: Forcer l'ajout d'un champ tarifs avec au moins un élément
      // pour toutes les photos, même si elles n'en ont pas dans la base
      const photoAvecTarifs = {
        ...photo,
        // Si tarifs existe et est un tableau non vide, on le garde
        // Sinon, on crée un tableau avec un tarif par défaut basé sur le prix de la photo
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
      };

      console.log(
        `Photo ${photo.titre} - tarifs après modification:`,
        photoAvecTarifs.tarifs
      );
      return photoAvecTarifs;
    });

    console.log("Envoi des photos avec tarifs garantis");
    res.json(photosModifiees); // Envoi des données au format JSON avec tarifs garantis
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

// Middleware pour capturer le corps brut de la requête
router.use((req, res, next) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    try {
      if (data && req.method !== "GET") {
        console.log("Corps brut de la requête:", data);
      }
    } catch (e) {
      console.error("Erreur lors de la capture du corps brut:", e);
    }
    next();
  });
});

// ------------------------------
// ROUTE ULTIME SANS VALIDATION - Ajout de photo avec force brute
// ------------------------------
router.post("/", async (req, res) => {
  try {
    console.log("=== SOLUTION BRUTALE ACTIVEE ===");
    console.log("Données reçues:", req.body);

    // Insertion FORCEE dans MongoDB
    // Méthode la plus directe possible
    const resultat = await Photo.collection.insertOne({
      src: req.body.src || "/uploads/default.jpg",
      alt: req.body.alt || "Photo",
      titre: req.body.titre || "Sans titre",
      description: req.body.description || "",
      categorie: req.body.categorie || "Divers",
      tarifs: Array.isArray(req.body.tarifs) ? req.body.tarifs : []
    });

    console.log("RESULTAT FORCE DE L'INSERTION:", resultat);
    return res.status(201).json({ 
      _id: resultat.insertedId, 
      ...req.body,
      message: "Photo ajoutée avec force brute" 
    });
  } catch (err) {
    console.error("ERREUR MALGRE FORCE BRUTE:", err);
    return res.status(500).json({
      message: "Erreur serveur malgré force brute",
      error: err.message
    });
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
