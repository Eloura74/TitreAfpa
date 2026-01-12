// Importation du framework Express pour gérer les routes HTTP
const express = require("express");

// Création d'un routeur Express pour définir des routes spécifiques liées aux utilisateurs
const router = express.Router();

// Importation de bcrypt pour le hashage et la vérification des mots de passe
const bcrypt = require("bcryptjs");

// Importation de jsonwebtoken pour générer des tokens JWT (authentification sécurisée)
const jwt = require("jsonwebtoken");

// Importation de crypto pour générer le token de vérification
const crypto = require("crypto");

// Importation du modèle User pour interagir avec la collection des utilisateurs dans MongoDB
const User = require("../models/User.js");
const RefreshToken = require("../models/RefreshToken");

// Importation du service d'email
const {
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../services/emailService");

// Importation du middleware d'authentification
const { authenticate } = require("../middleware/auth");

// Importation de express-validator pour la validation des entrées
const { body, validationResult } = require("express-validator");

// Importation du logger
const logger = require("../utils/logger");

// ==========================
// Route POST : Inscription
// ==========================
router.post(
  "/register",
  [
    // Validation des champs
    body("email").isEmail().withMessage("Email invalide"),
    body("motdepasse")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("nom").trim().escape(),
    body("prenom").trim().escape(),
    body("telephone").trim().escape(),
    body("adresse.rue").trim().escape(),
    body("adresse.ville").trim().escape(),
    body("adresse.codePostal").trim().escape(),
    body("adresse.pays").trim().escape(),
  ],
  async (req, res) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Récupération des données envoyées par le client dans le corps de la requête
      console.log("[AUTH] Register request received for:", req.body.email);
      let { email, motdepasse, nom, prenom, telephone, adresse } = req.body;

      // Normalisation manuelle pour garantir la cohérence avec le login
      if (email) {
        email = email.toLowerCase().trim();
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }

      // Définition du rôle par défaut : 'user'
      let role = "user";

      // Génération du token de vérification
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Création d'une nouvelle instance de l'utilisateur
      const user = new User({
        email,
        motdepasse,
        role,
        nom,
        prenom,
        telephone,
        adresse,
        isVerified: false, // Par défaut non vérifié
        verificationToken,
      });

      // Sauvegarde de l'utilisateur
      console.log(`[AUTH] Saving new user: ${email}`);
      await user.save();
      console.log(`[AUTH] User saved successfully: ${email}`);

      // Envoi de l'email de vérification
      try {
        await sendVerificationEmail(email, verificationToken);
        res.status(201).json({
          message:
            "Inscription réussie. Veuillez vérifier votre email pour activer votre compte.",
        });
      } catch (emailError) {
        console.error("Erreur envoi email vérification:", emailError);
        // On ne supprime pas l'utilisateur, mais on prévient le front
        res.status(201).json({
          message:
            "Inscription réussie, mais l'email de vérification n'a pas pu être envoyé. Contactez le support.",
        });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ==========================
// Route POST : Création Client (Admin) - Auto-Vérifié
// ==========================
router.post(
  "/create-client",
  authenticate, // Doit être connecté
  async (req, res, next) => {
    // Vérification admin manuelle ou via middleware si dispo
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé. Admin uniquement." });
    }
    next();
  },
  [
    body("email").isEmail().withMessage("Email invalide"),
    body("motdepasse")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("nom").trim().escape(),
    body("prenom").trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let { email, motdepasse, nom, prenom, telephone, adresse } = req.body;

      if (email) email = email.toLowerCase().trim();

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }

      // Création utilisateur DIRECTEMENT VÉRIFIÉ
      const user = new User({
        email,
        motdepasse,
        role: "user",
        nom,
        prenom,
        telephone,
        adresse,
        isVerified: true, // <--- C'est ici que ça change tout !
        verificationToken: undefined,
      });

      await user.save();
      console.log(`[AUTH] Admin created verified user: ${email}`);

      // Optionnel : Envoyer un email de bienvenue avec les identifiants
      // sendWelcomeEmail(email, prenom);

      res.status(201).json({
        message: "Client créé avec succès et activé.",
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
        },
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ==========================
// Route GET : Vérification Email
// ==========================
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Trouver l'utilisateur avec ce token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Lien de vérification invalide ou expiré." });
    }

    // Activer le compte
    user.isVerified = true;
    user.verificationToken = undefined; // Supprimer le token
    await user.save();

    // Envoyer email de bienvenue
    sendWelcomeEmail(user.email, user.prenom).catch((err) =>
      console.error(err)
    );

    // --- AUTO-LOGIN ---
    // Génération du token JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Configuration du cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 60 * 60 * 1000,
    };

    // Envoi du cookie
    res.cookie("token", jwtToken, cookieOptions);

    res.json({
      message: "Email vérifié avec succès. Connexion en cours...",
      user: {
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        adresse: user.adresse,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la vérification." });
  }
});

// ==========================
// Route POST : Connexion
// ==========================
router.post("/login", async (req, res) => {
  try {
    let { email, motdepasse } = req.body;

    if (email) {
      email = email.toLowerCase().trim();
    }

    console.log(`[AUTH] Login request for: '${email}'`);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Vérification du mot de passe
    const isMatch = await user.comparePassword(motdepasse);

    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Vérification si le compte est activé (sauf pour les admins)
    if (!user.isVerified && user.role !== "admin") {
      return res.status(403).json({
        error: "Veuillez vérifier votre email avant de vous connecter.",
      });
    }

    logger.info("Login réussi", { email, userId: user._id });

    // ✅ Génération de l'access token (courte durée : 15min)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Génération du refresh token (longue durée : 7 jours)
    const refreshTokenValue = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    // Enregistrement du refresh token en base de données
    await RefreshToken.create({
      token: refreshTokenValue,
      userId: user._id,
      expiresAt: refreshTokenExpiry,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // ✅ Envoi des cookies sécurisés
    const accessCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    };

    res.cookie("token", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshTokenValue, refreshCookieOptions);

    res.json({
      message: "Connexion réussie",
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      adresse: user.adresse,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route de test protégée
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ==========================
// Route POST : Refresh Token
// ==========================
/**
 * Permet de renouveler l'access token avec un refresh token valide
 * Appelé automatiquement quand l'access token expire (15min)
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token manquant" });
    }

    // Vérification du refresh token en base de données
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return res.status(401).json({ error: "Refresh token invalide" });
    }

    // Vérification de l'expiration
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({ error: "Refresh token expiré" });
    }

    // Récupération de l'utilisateur
    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    // ✅ Génération d'un nouvel access token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Envoi du nouveau cookie access token
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    logger.info("Access token renouvelé", { userId: user._id });

    res.json({ message: "Token renouvelé avec succès" });
  } catch (err) {
    logger.error("Erreur refresh token", { error: err.message });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ==========================
// Route POST : Déconnexion
// ==========================
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Suppression du refresh token de la base de données
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Suppression des cookies
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    logger.error("Erreur logout", { error: err.message });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
