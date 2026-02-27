const express = require("express");
const router = express.Router();
const AccesPrive = require("../models/AccesPrive");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = [
      ".jpg",
      ".jpeg",
      ".png",
      ".raw",
      ".cr2",
      ".nef",
      ".arw",
      ".dng",
      ".tiff",
      ".tif",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Format de fichier non supporté"));
    }
  },
});

router.post("/login", async (req, res) => {
  try {
    const { codeAcces } = req.body;

    if (!codeAcces) {
      return res.status(400).json({
        success: false,
        message: "Code d'accès requis",
      });
    }

    const acces = await AccesPrive.findOne({
      codeAcces: codeAcces.toUpperCase().trim(),
    }).populate("client", "nom prenom email");

    if (!acces) {
      return res.status(404).json({
        success: false,
        message: "Code d'accès invalide",
      });
    }

    if (!acces.verifierValidite()) {
      await acces.save();
      return res.status(403).json({
        success: false,
        message: "Cet accès a expiré ou a atteint sa limite de téléchargements",
      });
    }

    req.session.ecrinAccesId = acces._id.toString();
    req.session.ecrinCodeAcces = acces.codeAcces;

    res.json({
      success: true,
      message: "Connexion réussie",
      acces: {
        id: acces._id,
        titre: acces.titre,
        description: acces.description,
        client: acces.client,
        dateDebut: acces.dateDebut,
        dateFin: acces.dateFin,
        image: acces.image,
        nbPhotos: acces.photos?.length || 0,
        nbPhotosOriginales: acces.photosOriginales?.length || 0,
        typeValidite: acces.typeValidite,
        dateExpiration: acces.dateExpiration,
        typeLimiteTelechargement: acces.typeLimiteTelechargement,
        nbTelechargementTotal: acces.nbTelechargementTotal,
        maxTelechargementTotal: acces.maxTelechargementTotal,
      },
    });
  } catch (error) {
    console.error("Erreur login écrin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

router.get("/session", async (req, res) => {
  try {
    if (!req.session.ecrinAccesId) {
      return res.status(401).json({
        success: false,
        message: "Non connecté",
      });
    }

    const acces = await AccesPrive.findById(req.session.ecrinAccesId)
      .populate("client", "nom prenom email")
      .populate("photos");

    if (!acces) {
      req.session.destroy();
      return res.status(404).json({
        success: false,
        message: "Accès introuvable",
      });
    }

    if (!acces.verifierValidite()) {
      await acces.save();
      req.session.destroy();
      return res.status(403).json({
        success: false,
        message: "Accès expiré",
      });
    }

    res.json({
      success: true,
      acces: {
        id: acces._id,
        titre: acces.titre,
        description: acces.description,
        client: acces.client,
        dateDebut: acces.dateDebut,
        dateFin: acces.dateFin,
        image: acces.image,
        photos: acces.photos,
        photosOriginales: acces.photosOriginales,
        typeValidite: acces.typeValidite,
        dateExpiration: acces.dateExpiration,
        typeLimiteTelechargement: acces.typeLimiteTelechargement,
        maxTelechargementParPhoto: acces.maxTelechargementParPhoto,
        maxTelechargementTotal: acces.maxTelechargementTotal,
        nbTelechargementTotal: acces.nbTelechargementTotal,
      },
    });
  } catch (error) {
    console.error("Erreur session écrin:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erreur déconnexion",
      });
    }
    res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  });
});

router.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier fourni",
      });
    }

    const { accesId, codeAcces } = req.body;

    if (!accesId || !codeAcces) {
      return res.status(400).json({
        success: false,
        message: "ID d'accès et code requis",
      });
    }

    const acces = await AccesPrive.findById(accesId);

    if (!acces) {
      return res.status(404).json({
        success: false,
        message: "Accès introuvable",
      });
    }

    if (acces.codeAcces !== codeAcces.toUpperCase().trim()) {
      return res.status(403).json({
        success: false,
        message: "Code d'accès invalide",
      });
    }

    const fileName = req.file.originalname;
    const r2Key = `${codeAcces}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    let miniatureUrl = null;

    // Génération miniature temporairement désactivée
    // TODO: Configurer CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET sur Vercel
    /*
    try {
      const thumbnailBuffer = await sharp(req.file.buffer)
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `ecrin-prive/${codeAcces}`,
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto:good" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(thumbnailBuffer);
      });

      miniatureUrl = uploadResult.secure_url;
    } catch (thumbError) {
      console.error("Erreur génération miniature:", thumbError);
    }
    */

    const photoData = {
      nom: fileName,
      fichierR2: r2Key,
      miniature: miniatureUrl,
      taille: req.file.size,
      format: path.extname(fileName).substring(1).toUpperCase(),
      dateUpload: new Date(),
      nbTelechargements: 0,
    };

    console.log("[UPLOAD] Avant update - ID accès:", acces._id);
    console.log("[UPLOAD] Photo à ajouter:", photoData.nom);

    // Utiliser $push pour forcer MongoDB à persister
    const updatedAcces = await AccesPrive.findByIdAndUpdate(
      acces._id,
      { $push: { photosOriginales: photoData } },
      { new: true },
    );

    console.log(
      "[UPLOAD] Après update - Nombre de photos:",
      updatedAcces.photosOriginales.length,
    );
    console.log("[UPLOAD] Photo enregistrée avec succès");

    res.json({
      success: true,
      message: "Photo uploadée avec succès",
      photo: photoData,
      version: "v2-findByIdAndUpdate",
      nbPhotosApresUpdate: updatedAcces.photosOriginales.length,
    });
  } catch (error) {
    console.error("Erreur upload R2:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload vers R2",
    });
  }
});

router.post("/generate-download-url", async (req, res) => {
  try {
    if (!req.session.ecrinAccesId) {
      return res.status(401).json({
        success: false,
        message: "Non connecté",
      });
    }

    const { photoId } = req.body;

    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: "ID photo requis",
      });
    }

    const acces = await AccesPrive.findById(req.session.ecrinAccesId);

    if (!acces) {
      return res.status(404).json({
        success: false,
        message: "Accès introuvable",
      });
    }

    if (!acces.verifierValidite()) {
      await acces.save();
      return res.status(403).json({
        success: false,
        message: "Accès expiré ou limite atteinte",
      });
    }

    const photo = acces.photosOriginales.id(photoId);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo introuvable",
      });
    }

    if (!acces.verifierLimitePhoto(photoId)) {
      return res.status(403).json({
        success: false,
        message: "Limite de téléchargements atteinte pour cette photo",
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: photo.fichierR2,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    photo.nbTelechargements = (photo.nbTelechargements || 0) + 1;
    acces.nbTelechargementTotal = (acces.nbTelechargementTotal || 0) + 1;
    await acces.save();

    res.json({
      success: true,
      url,
      photo: {
        nom: photo.nom,
        taille: photo.taille,
        format: photo.format,
      },
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Erreur génération URL:", error);
    res.status(500).json({
      success: false,
      message: "Erreur génération URL de téléchargement",
    });
  }
});

module.exports = router;
