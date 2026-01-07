// Importation du framework Express pour gérer les routes HTTP
const express = require("express");

// Création d'un routeur Express pour définir des routes spécifiques liées aux utilisateurs
const router = express.Router();

// Importation de bcrypt pour le hashage et la vérification des mots de passe
const bcrypt = require("bcryptjs");

// Importation de jsonwebtoken pour générer des tokens JWT (authentification sécurisée)
const jwt = require("jsonwebtoken");

// Importation du modèle User pour interagir avec la collection des utilisateurs dans MongoDB
const User = require("../models/User.js");

// Importation du middleware d'authentification
const { authenticate } = require("../middleware/auth");

// Importation de express-validator pour la validation des entrées
const { body, validationResult } = require("express-validator");

// ==========================
// Route POST : Inscription
// ==========================
router.post(
  "/register",
  [
    // Validation des champs
    body("email").isEmail().withMessage("Email invalide"), // Suppression de .normalizeEmail() qui modifiait l'email (ex: suppression des points)
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
      console.log("[AUTH] Register validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Récupération des données envoyées par le client dans le corps de la requête
      console.log("[AUTH] Register request received for:", req.body.email);
      let { email, motdepasse, nom, prenom, telephone, adresse } = req.body;

      // Normalisation manuelle pour garantir la cohérence avec le login (minuscules + trim, mais conservation des points)
      if (email) {
        email = email.toLowerCase().trim();
      }

      // Définition du rôle par défaut : 'user'
      let role = "user";

      // Création d'une nouvelle instance de l'utilisateur avec les données fournies
      // Le mot de passe sera automatiquement hashé grâce au middleware défini dans le modèle User
      const user = new User({
        email,
        motdepasse,
        role,
        nom,
        prenom,
        telephone,
        adresse,
      });

      // Sauvegarde de l'utilisateur dans la base de données MongoDB
      console.log(`[AUTH] Saving new user: ${email}`);
      await user.save();
      console.log(`[AUTH] User saved successfully: ${email}`);

      // Envoi de l'email de bienvenue (asynchrone, on n'attend pas forcément le résultat pour répondre)
      // Import dynamique ou require en haut de fichier (je vais ajouter le require en haut)
      const { sendWelcomeEmail } = require("../services/emailService");
      sendWelcomeEmail(email, prenom).catch((err) =>
        console.error("Erreur envoi email bienvenue:", err)
      );

      // Réponse avec un statut 201 (Créé) et un message de succès
      res.status(201).json({ message: "Utilisateur créé" });
    } catch (err) {
      // En cas d'erreur (ex: email déjà utilisé), renvoi d'une réponse avec un statut 400 (Bad Request) et le message d'erreur
      console.error("[AUTH] Register error:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

// ==========================
// Route POST : Connexion
// ==========================
router.post("/login", async (req, res) => {
  try {
    // Récupération des identifiants fournis par l'utilisateur
    // Récupération des identifiants fournis par l'utilisateur
    let { email, motdepasse } = req.body;

    // Normalisation de l'email (minuscules et suppression des espaces) pour correspondre au format d'enregistrement
    if (email) {
      email = email.toLowerCase().trim();
    }

    console.log(`[AUTH] Login request for: '${email}'`);

    // Recherche de l'utilisateur dans la base de données via son email
    const user = await User.findOne({ email });
    console.log(`[AUTH] User found result: ${user ? "YES" : "NO"}`);

    if (!user) {
      console.log(
        `[AUTH] Login failed: User '${email}' NOT FOUND in database.`
      );
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Vérification du mot de passe
    const isMatch = await user.comparePassword(motdepasse);
    console.log(`[AUTH] Password match result for '${email}': ${isMatch}`);

    if (!isMatch) {
      console.log(`[AUTH] Login failed: Password INCORRECT for '${email}'.`);
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    console.log(`[AUTH] Login success for ${email}`);

    // Génération d'un token JWT contenant l'ID utilisateur et son rôle
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Configuration du cookie
    const cookieOptions = {
      httpOnly: true, // Empêche l'accès via JS (protection XSS)
      secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' pour Vercel (cross-site), 'lax' en local
      maxAge: 2 * 60 * 60 * 1000, // 2 heures en millisecondes
    };

    // Envoi du cookie
    res.cookie("token", token, cookieOptions);

    // Réponse JSON (sans le token dans le body)
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
    // Gestion des erreurs avec une réponse 400 en cas de problèmes
    res.status(400).json({ error: err.message });
  }
});

// Route de test protégée
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ==========================
// Route POST : Déconnexion
// ==========================
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Déconnexion réussie" });
});

// Exportation du routeur pour pouvoir l'utiliser dans l'application principale (app.js ou server.js)
module.exports = router;
