// Importation du framework Express pour gérer les routes HTTP
const express = require("express");

// Création d'un routeur Express pour définir des routes spécifiques liées aux utilisateurs
const router = express.Router();

// Importation de bcrypt pour le hashage et la vérification des mots de passe
const bcrypt = require("bcrypt");

// Importation de jsonwebtoken pour générer des tokens JWT (authentification sécurisée)
const jwt = require("jsonwebtoken");

// Importation du modèle User pour interagir avec la collection des utilisateurs dans MongoDB
const User = require("../models/User.js");

// Importation du middleware d'authentification
const { authenticate } = require("../middleware/auth");

// ==========================
// Route POST : Inscription
// ==========================
router.post("/register", async (req, res) => {
  try {
    // Récupération des données envoyées par le client dans le corps de la requête (email et mot de passe)
    const { email, motdepasse } = req.body;

    // Définition du rôle par défaut : 'user'
    let role = "user";

    // Vérification simple pour attribuer le rôle 'admin' si l'email et le mot de passe correspondent à des valeurs précises
    if (email === "fabien.licata@gmail.com" && motdepasse === "admin") {
      role = "admin";
    }

    // Création d'une nouvelle instance de l'utilisateur avec les données fournies
    // Le mot de passe sera automatiquement hashé grâce au middleware défini dans le modèle User
    const user = new User({ email, motdepasse, role });

    // Sauvegarde de l'utilisateur dans la base de données MongoDB
    await user.save();

    // Réponse avec un statut 201 (Créé) et un message de succès
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    // En cas d'erreur (ex: email déjà utilisé), renvoi d'une réponse avec un statut 400 (Bad Request) et le message d'erreur
    res.status(400).json({ error: err.message });
  }
});

// ==========================
// Route POST : Connexion
// ==========================
router.post("/login", async (req, res) => {
  try {
    // Récupération des identifiants fournis par l'utilisateur
    const { email, motdepasse } = req.body;

    // Recherche de l'utilisateur dans la base de données via son email
    const user = await User.findOne({ email });

    // Vérification si l'utilisateur existe et si le mot de passe est correct via la méthode comparePassword
    if (!user || !(await user.comparePassword(motdepasse))) {
      // Si l'utilisateur n'existe pas ou que le mot de passe est incorrect, renvoi d'une erreur 401 (Unauthorized)
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Génération d'un token JWT contenant l'ID utilisateur et son rôle
    // Le token est signé avec une clé secrète stockée dans les variables d'environnement (process.env.JWT_SECRET)
    // Le token expire après 2 heures
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload du token
      process.env.JWT_SECRET, // Clé secrète pour signer le token
      { expiresIn: "2h" } // Durée de validité du token
    );

    // Envoi du token ainsi que des informations de l'utilisateur (email et rôle) au client
    res.json({ token, email: user.email, role: user.role });
  } catch (err) {
    // Gestion des erreurs avec une réponse 400 en cas de problème
    res.status(400).json({ error: err.message });
  }
});

// Route de test protégée
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Exportation du routeur pour pouvoir l'utiliser dans l'application principale (app.js ou server.js)
module.exports = router;
