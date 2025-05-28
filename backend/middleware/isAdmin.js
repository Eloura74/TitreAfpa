// Middleware pour vérifier que l'utilisateur est administrateur
// Ce middleware est utilisé pour protéger certaines routes qui doivent être accessibles uniquement aux administrateurs.

module.exports = (req, res, next) => {
  // Vérifie si l'utilisateur est connecté (req.user existe)
  // ET si son rôle est "admin" OU si une propriété isAdmin est définie à true
  if (req.user && (req.user.role === "admin" || req.user.isAdmin === true)) {
    // Si la condition est vraie, l'utilisateur est autorisé à accéder à la ressource
    return next(); // Passe au middleware suivant ou à la route
  }

  // Si l'utilisateur n'est pas admin, on renvoie une erreur 403 (Accès interdit)
  return res
    .status(403)
    .json({ message: "Accès réservé aux administrateurs." });
};
