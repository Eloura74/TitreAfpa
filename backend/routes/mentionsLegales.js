const express = require("express");
const router = express.Router();
const MentionsLegales = require("../models/MentionsLegales");
const { isAdmin } = require("../middleware/auth");

// GET /api/mentions-legales - Récupérer les mentions légales et CGV (public)
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
      mentionsLegales: mentions.mentionsLegales,
      cgv: mentions.cgv,
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

// PUT /api/mentions-legales - Mettre à jour les mentions légales et CGV (admin)
router.put("/", isAdmin, async (req, res) => {
  try {
    const { mentionsLegales, cgv } = req.body;

    // Nettoyer le HTML vide de Quill (ex: '<p><br></p>')
    const cleanMentions =
      mentionsLegales?.replace(/<p><br><\/p>/g, "").trim() || "";
    const cleanCgv = cgv?.replace(/<p><br><\/p>/g, "").trim() || "";

    // Validation : au moins un contenu doit être rempli
    if (!cleanMentions && !cleanCgv) {
      return res.status(400).json({
        success: false,
        message:
          "Veuillez remplir au moins un des deux contenus (Mentions Légales ou CGV)",
      });
    }

    let mentions = await MentionsLegales.findOne();

    if (!mentions) {
      mentions = new MentionsLegales({
        mentionsLegales: mentionsLegales || "",
        cgv: cgv || "",
      });
    } else {
      if (mentionsLegales !== undefined)
        mentions.mentionsLegales = mentionsLegales;
      if (cgv !== undefined) mentions.cgv = cgv;
      mentions.derniereModification = new Date();
    }

    await mentions.save();

    res.json({
      success: true,
      message: "Mentions légales et CGV mises à jour avec succès",
      mentionsLegales: mentions.mentionsLegales,
      cgv: mentions.cgv,
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
