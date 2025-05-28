// Middleware d'authentification JWT pour Express
// Ce fichier contient deux middlewares :
// 1. `authenticate` : vérifie que l'utilisateur est bien connecté avec un token JWT valide.
// 2. `isAdmin` : vérifie que l'utilisateur connecté est un administrateur.

const jwt = require("jsonwebtoken"); // Import de la bibliothèque JWT pour décoder les tokens
const User = require("../models/User"); // Import du modèle Mongoose "User" (utilisateur)

// ************************************************
// Middleware d'authentification pour les routes
// ************************************************
// Ce middleware est utilisé pour protéger les routes.
// Il vérifie la présence et la validité du token JWT envoyé par le client.
const authenticate = async (req, res, next) => {
  // Récupère le header "Authorization" de la requête
  const authHeader = req.headers.authorization;

  // Si le header est absent ou mal formé, on renvoie une erreur 401 (non autorisé)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  // Récupère le token réel en enlevant "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Vérifie le token JWT avec la clé secrète (définie dans .env via process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Recherche de l'utilisateur correspondant à l'ID contenu dans le token
    const user = await User.findById(decoded.id);

    // Si aucun utilisateur n'est trouvé, renvoyer une erreur
    if (!user)
      return res.status(401).json({ message: "Utilisateur non trouvé" });

    // Si l'utilisateur est valide, on l’attache à la requête pour les traitements suivants
    req.user = user;

    // On continue vers le prochain middleware ou la route
    next();
  } catch (err) {
    // Si le token est invalide ou expiré, renvoyer une erreur 401
    return res.status(401).json({ message: "Token invalide" });
  }
};

// ************************************************
// Middleware de vérification admin
// ************************************************
// Ce middleware vérifie que l'utilisateur est connecté ET a le rôle "admin"
const isAdmin = async (req, res, next) => {
  // On commence par exécuter le middleware authenticate
  await authenticate(req, res, async () => {
    // Vérifie que l'utilisateur existe ET que son rôle est bien "admin"
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403) // Erreur 403 : accès interdit
        .json({ message: "Accès réservé aux administrateurs" });
    }

    // L'utilisateur est bien un admin, on continue
    next();
  });
};

// Export des deux middlewares pour pouvoir les utiliser dans d'autres fichiers (routes par exemple)
module.exports = { authenticate, isAdmin };
