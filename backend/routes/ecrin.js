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
const jwt = require("jsonwebtoken");

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

router.get("/info/:slug", async (req, res) => {
  try {
    // Rétrocompatibilité : on cherche par slug, ou par codeAcces pour les anciens événements
    const searchVal = req.params.slug;
    const acces = await AccesPrive.findOne({
      $or: [{ slug: searchVal }, { codeAcces: searchVal.toUpperCase().trim() }],
    }).select("titre image");

    if (!acces) {
      return res
        .status(404)
        .json({ success: false, message: "Album introuvable" });
    }
    res.json({ success: true, acces });
  } catch (error) {
    console.error("Erreur ecrin info:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { codeAcces, slug } = req.body;

    if (!codeAcces) {
      return res.status(400).json({
        success: false,
        message: "Code d'accès requis",
      });
    }

    let query = { codeAcces: codeAcces.toUpperCase().trim() };
    if (slug) query.slug = slug;

    const acces = await AccesPrive.findOne(query).populate(
      "client",
      "nom prenom email",
    );

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

    // --- JWT au lieu de express-session ---
    const ecrinToken = jwt.sign(
      { accesId: acces._id.toString(), codeAcces: acces.codeAcces },
      process.env.SESSION_SECRET ||
        "ecrin-prive-secret-key-change-in-production",
      { expiresIn: "24h" },
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    };

    res.cookie("ecrinToken", ecrinToken, cookieOptions);

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
    const ecrinToken = req.cookies?.ecrinToken;

    if (!ecrinToken) {
      return res.status(401).json({
        success: false,
        message: "Non connecté (Aucun token trouvé)",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        ecrinToken,
        process.env.SESSION_SECRET ||
          "ecrin-prive-secret-key-change-in-production",
      );
    } catch (err) {
      res.clearCookie("ecrinToken");
      return res.status(401).json({
        success: false,
        message: "Session invalide ou expirée",
      });
    }

    const acces = await AccesPrive.findById(decoded.accesId)
      .populate("client", "nom prenom email")
      .populate("photos");

    if (!acces) {
      res.clearCookie("ecrinToken");
      return res.status(404).json({
        success: false,
        message: "Accès introuvable",
      });
    }

    if (!acces.verifierValidite()) {
      await acces.save();
      res.clearCookie("ecrinToken");
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
  res.clearCookie("ecrinToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({
    success: true,
    message: "Déconnexion réussie",
  });
});

// =====================================
// ROUTE : Génération d'URL pré-signée pour upload direct vers R2
// =====================================
// Cette route permet au frontend d'uploader directement vers Cloudflare R2
// sans passer par le backend Vercel (contourne la limite de 4.5MB)
router.post("/generate-upload-url", async (req, res) => {
  try {
    const { accesId, codeAcces, fileName, fileType } = req.body;

    // Validation des paramètres requis
    if (!accesId || !codeAcces || !fileName) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants (accesId, codeAcces, fileName)",
      });
    }

    // Vérification de l'accès privé
    const acces = await AccesPrive.findById(accesId);

    if (!acces) {
      return res.status(404).json({
        success: false,
        message: "Accès introuvable",
      });
    }

    // Vérification du code d'accès
    if (acces.codeAcces !== codeAcces.toUpperCase().trim()) {
      return res.status(403).json({
        success: false,
        message: "Code d'accès invalide",
      });
    }

    // Génération de la clé R2 unique
    const r2Key = `${codeAcces}/${Date.now()}-${fileName}`;

    // Création de la commande PutObject pour générer l'URL pré-signée
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
      ContentType: fileType || "application/octet-stream",
    });

    // Génération de l'URL pré-signée (valide 1 heure)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Retour de l'URL et des métadonnées
    res.json({
      success: true,
      uploadUrl,
      r2Key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Erreur génération URL upload:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération de l'URL d'upload",
    });
  }
});

// =====================================
// ROUTE : Confirmation d'upload et enregistrement en base
// =====================================
// Appelée après un upload direct réussi pour enregistrer la photo dans MongoDB
router.post("/confirm-upload", async (req, res) => {
  try {
    const { accesId, codeAcces, r2Key, fileName, fileSize, fileType } =
      req.body;

    // Validation des paramètres
    if (!accesId || !codeAcces || !r2Key || !fileName) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants",
      });
    }

    // Vérification de l'accès
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

    // Création de l'objet photo
    const photoData = {
      nom: fileName,
      fichierR2: r2Key,
      miniature: null,
      taille: fileSize || 0,
      format: path.extname(fileName).substring(1).toUpperCase(),
      dateUpload: new Date(),
      nbTelechargements: 0,
    };

    // Ajout de la photo dans MongoDB
    const accesFromDb = await AccesPrive.findById(acces._id);
    accesFromDb.photosOriginales.push(photoData);
    const savedAcces = await accesFromDb.save({
      writeConcern: { w: "majority", j: true },
    });

    console.log("[CONFIRM-UPLOAD] Photo enregistrée:", photoData.nom);

    res.json({
      success: true,
      message: "Photo enregistrée avec succès",
      photo: photoData,
      nbPhotosTotal: savedAcces.photosOriginales.length,
    });
  } catch (error) {
    console.error("Erreur confirmation upload:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la photo",
    });
  }
});

// =====================================
// ROUTE LEGACY : Upload via backend (DÉCONSEILLÉ pour fichiers > 4.5MB)
// =====================================
// Cette route est conservée pour compatibilité mais limitée par Vercel
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

    // Récupérer le document frais depuis MongoDB
    const accesFromDb = await AccesPrive.findById(acces._id);
    console.log(
      "[UPLOAD] Document récupéré - Nombre de photos actuel:",
      accesFromDb.photosOriginales.length,
    );

    // Ajouter la photo
    accesFromDb.photosOriginales.push(photoData);
    console.log(
      "[UPLOAD] Après push - Nombre de photos:",
      accesFromDb.photosOriginales.length,
    );

    // Sauvegarder avec writeConcern
    const savedAcces = await accesFromDb.save({
      writeConcern: { w: "majority", j: true },
    });
    console.log(
      "[UPLOAD] Après save - Nombre de photos:",
      savedAcces.photosOriginales.length,
    );

    // Vérification MongoDB native pour confirmer la persistance
    const verif = await AccesPrive.findById(acces._id).lean();
    console.log(
      "[UPLOAD] Vérification MongoDB native - Nombre de photos:",
      verif.photosOriginales.length,
    );
    console.log("[UPLOAD] Photo enregistrée avec succès");

    res.json({
      success: true,
      message: "Photo uploadée avec succès",
      photo: photoData,
      version: "v3-findById-save",
      nbPhotosApresUpdate: savedAcces.photosOriginales.length,
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
    const ecrinToken = req.cookies?.ecrinToken;
    if (!ecrinToken) {
      return res.status(401).json({
        success: false,
        message: "Non connecté (Aucun token)",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        ecrinToken,
        process.env.SESSION_SECRET ||
          "ecrin-prive-secret-key-change-in-production",
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Session invalide ou expirée",
      });
    }

    const { photoId } = req.body;

    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: "ID photo requis",
      });
    }

    const acces = await AccesPrive.findById(decoded.accesId);

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
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(photo.nom)}"`,
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
