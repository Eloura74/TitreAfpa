const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Route publique pour récupérer les infos
router.get("/", aboutController.getAbout);

// Route protégée (admin seulement) pour modifier
router.put("/", authenticate, isAdmin, aboutController.updateAbout);

module.exports = router;
