const express = require("express");
const router = express.Router();
const pictoController = require("../controllers/pictoController");

// Route pour récupérer toutes les catégories
router.get("/categories", pictoController.getAllCategories);

module.exports = router;
