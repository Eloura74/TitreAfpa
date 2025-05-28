// Fichier de routes Express pour la gestion des paiements
// Toutes les opérations sont protégées par authentification JWT (auth)
// et réservées uniquement aux administrateurs (isAdmin)

const express = require("express");
const router = express.Router(); // Création du routeur Express

// Importation du contrôleur contenant les fonctions métier pour les paiements
const ctrl = require("../controllers/paiementController");

// Importation des middlewares de sécurité
const auth = require("../middleware/auth").authenticate; // Vérifie le token JWT
const isAdmin = require("../middleware/isAdmin"); // Vérifie que l'utilisateur est admin

// ===================================================================
// ROUTES PROTÉGÉES : seuls les administrateurs authentifiés y accèdent
// ===================================================================

// ----------------------------------------------------
// GET /api/paiements
// ----------------------------------------------------
// Récupère la liste de tous les paiements enregistrés en base
// ⚠️ Accessible uniquement aux administrateurs connectés
router.get("/", auth, isAdmin, ctrl.getAll);

// ----------------------------------------------------
// POST /api/paiements
// ----------------------------------------------------
// Ajoute un nouveau paiement à la base de données
// ⚠️ L'utilisateur doit être authentifié et avoir le rôle "admin"
router.post("/", auth, isAdmin, ctrl.create);

// ----------------------------------------------------
// PUT /api/paiements/:id
// ----------------------------------------------------
// Modifie un paiement existant (par son ID)
// ⚠️ Accès limité aux administrateurs
router.put("/:id", auth, isAdmin, ctrl.update);

// ----------------------------------------------------
// DELETE /api/paiements/:id
// ----------------------------------------------------
// Supprime un paiement spécifique (par son ID)
// ⚠️ Réservé aux utilisateurs ayant le rôle admin
router.delete("/:id", auth, isAdmin, ctrl.remove);

// ----------------------------------------------------
// EXPORTATION DU ROUTEUR
// ----------------------------------------------------
// Ce module sera monté dans app.js via : app.use('/api/paiements', paiementRoutes)
module.exports = router;
