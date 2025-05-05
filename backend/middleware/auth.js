// Middleware d'authentification JWT pour Express
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware d'authentification : vérifie le token JWT et attache l'utilisateur à req.user
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // On récupère l'utilisateur depuis la base pour avoir le rôle à jour
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

/**
 * Middleware admin : nécessite d'être authentifié ET d'avoir le rôle admin
 */
const isAdmin = async (req, res, next) => {
  await authenticate(req, res, async () => {
    // Vérifie le champ role (et pas isAdmin)
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }
    next();
  });
};

module.exports = { authenticate, isAdmin };
