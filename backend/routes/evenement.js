// Fichier de routes Express pour les événements
// Ce fichier définit les endpoints disponibles pour accéder ou gérer les événements via l'API.

// -----------------------------
// Importations des dépendances
// -----------------------------
const express = require("express"); // Import du framework Express
const router = express.Router(); // Création d’un routeur Express
const ctrl = require("../controllers/evenementController"); // Import du contrôleur d’événements
const auth = require("../middleware/auth").authenticate; // Middleware pour vérifier le token JWT
const isAdmin = require("../middleware/isAdmin"); // Middleware pour vérifier que l'utilisateur est admin

// ---------------------------------------------
// ROUTES API POUR LES ÉVÉNEMENTS
// Toutes les routes commencent par /api/evenements
// ---------------------------------------------

// **************************************
// GET /api/evenements/
// **************************************
// Route publique : permet à n’importe qui de voir la liste des événements
router.get("/", ctrl.getAll);

// **************************************
// GET /api/evenements/me
// **************************************
// Route protégée : permet à un client connecté de voir ses propres événements
router.get("/me", auth, ctrl.getMyEvents);

// **************************************
// GET /api/evenements/:id
// **************************************
// Route protégée (vérification droits dans le contrôleur)
router.get("/:id", auth, ctrl.getOne);

// **************************************
// POST /api/evenements/
// **************************************
// Route protégée : seuls les administrateurs peuvent ajouter un événement
// Chaîne de middlewares :
// - auth : vérifie que l'utilisateur est connecté
// - isAdmin : vérifie que l'utilisateur a le rôle administrateur
router.post("/", auth, isAdmin, ctrl.create);

// **************************************
// POST /api/evenements/:id/photos
// **************************************
// Route protégée : permet à un admin d'ajouter des photos à un événement
router.post("/:id/photos", auth, isAdmin, ctrl.addPhotos);

// **************************************
// PUT /api/evenements/:id
// **************************************
// Route protégée : permet à un admin de modifier un événement existant via son ID
router.put("/:id", auth, isAdmin, ctrl.update);

// **************************************
// DELETE /api/evenements/:id
// **************************************
// Route protégée : permet à un admin de supprimer un événement via son ID
router.delete("/:id", auth, isAdmin, ctrl.remove);

// -----------------------------
// Exportation du routeur
// -----------------------------
// Ce module est importé dans app.js pour être monté sur une route globale (ex : /api/evenements)
module.exports = router;
