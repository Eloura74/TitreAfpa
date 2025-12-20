const express = require("express");
const router = express.Router();
const paypalController = require("../controllers/paypalController");

// Route pour créer une commande PayPal
router.post("/create-order", paypalController.createOrder);

// Route pour capturer (valider) une commande PayPal après approbation
router.post("/capture-order/:orderID", paypalController.captureOrder);

module.exports = router;
