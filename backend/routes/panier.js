// Fichier de routes Express pour la gestion des paniers
// Toutes les opérations sont protégées par un système de sécurité :
// - l'utilisateur doit être authentifié via un token JWT (middleware `auth`)
// - l'utilisateur doit avoir le rôle "admin" (middleware `isAdmin`)

const express = require("express");
const router = express.Router(); // Création d’un routeur Express

// Importation du contrôleur contenant les fonctions de traitement métier
const ctrl = require("../controllers/panierController");

// Importation des middlewares d'authentification et d'autorisation
const auth = require("../middleware/auth").authenticate; // Vérifie le token JWT et charge l'utilisateur
const isAdmin = require("../middleware/isAdmin"); // Vérifie si l'utilisateur a le rôle admin

// =====================================================
// ROUTES PROTÉGÉES POUR LA GESTION DES PANIERS
// =====================================================
// Ces routes sont uniquement accessibles par des administrateurs connectés

// ------------------------------------------
// GET /api/paniers/
// ------------------------------------------
// Récupère la liste de tous les paniers dans la base MongoDB
// ⚠️ Nécessite : utilisateur connecté + rôle admin
router.get("/", auth, isAdmin, ctrl.getAll);

// ------------------------------------------
// POST /api/paniers/
// ------------------------------------------
// Crée un nouveau panier (lié à un utilisateur et contenant des articles)
// ⚠️ Nécessite : utilisateur connecté + rôle admin
router.post("/", auth, isAdmin, ctrl.create);

// ------------------------------------------
// PUT /api/paniers/:id
// ------------------------------------------
// Modifie un panier existant via son identifiant (ID dans l’URL)
// ⚠️ Nécessite : utilisateur connecté + rôle admin
router.put("/:id", auth, isAdmin, ctrl.update);

// ------------------------------------------
// DELETE /api/paniers/:id
// ------------------------------------------
// Supprime un panier de la base à partir de son ID
// ⚠️ Nécessite : utilisateur connecté + rôle admin
router.delete("/:id", auth, isAdmin, ctrl.remove);

// ------------------------------------------
// EXPORT DU ROUTEUR
// ------------------------------------------
// Ce routeur est ensuite monté dans app.js via app.use('/api/paniers', panierRoutes)
module.exports = router;
