// Middleware pour vérifier que l'utilisateur est admin
module.exports = (req, res, next) => {
  // if (req.user && req.user.isAdmin) {
  if (req.user && (req.user.role === "admin" || req.user.isAdmin === true)) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Accès réservé aux administrateurs." });
};
