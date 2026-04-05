const express = require("express");
const router = express.Router();
const MentionsLegales = require("../models/MentionsLegales");
const { isAdmin } = require("../middleware/auth");

// GET /api/mentions-legales - Récupérer les mentions légales (public)
router.get("/", async (req, res) => {
  try {
    let mentions = await MentionsLegales.findOne();
    
    // Si aucun document n'existe, en créer un avec le contenu par défaut
    if (!mentions) {
      mentions = new MentionsLegales();
      await mentions.save();
    }
    
    res.json({
      success: true,
      contenu: mentions.contenu,
      derniereModification: mentions.derniereModification,
    });
  } catch (error) {
    console.error("Erreur récupération mentions légales:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des mentions légales",
    });
  }
});

// PUT /api/mentions-legales - Mettre à jour les mentions légales (admin)
router.put("/", isAdmin, async (req, res) => {
  try {
    const { contenu } = req.body;
    
    if (!contenu) {
      return res.status(400).json({
        success: false,
        message: "Le contenu est requis",
      });
    }
    
    let mentions = await MentionsLegales.findOne();
    
    if (!mentions) {
      mentions = new MentionsLegales({ contenu });
    } else {
      mentions.contenu = contenu;
      mentions.derniereModification = new Date();
    }
    
    await mentions.save();
    
    res.json({
      success: true,
      message: "Mentions légales mises à jour avec succès",
      contenu: mentions.contenu,
      derniereModification: mentions.derniereModification,
    });
  } catch (error) {
    console.error("Erreur mise à jour mentions légales:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour des mentions légales",
    });
  }
});

module.exports = router;
