const express = require("express");
const router = express.Router();
const GraphismeDescription = require("../models/GraphismeDescription");
const { isAdmin } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    let description = await GraphismeDescription.findOne();

    if (!description) {
      description = await GraphismeDescription.create({
        titre: "Le Graphisme selon Fabien",
        description:
          "Le graphisme est l'art de communiquer visuellement des idées, des émotions et des messages à travers la composition, la typographie, les couleurs et les formes. C'est une discipline qui allie créativité et technique pour créer des visuels impactants et mémorables.",
      });
    }

    res.json(description);
  } catch (error) {
    console.error("Erreur lors de la récupération de la description:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la description",
      error: error.message,
    });
  }
});

router.put("/", isAdmin, async (req, res) => {
  try {
    const { titre, description } = req.body;

    if (!titre || !description) {
      return res.status(400).json({
        message: "Le titre et la description sont requis",
      });
    }

    let graphismeDesc = await GraphismeDescription.findOne();

    if (!graphismeDesc) {
      graphismeDesc = await GraphismeDescription.create({
        titre,
        description,
      });
    } else {
      graphismeDesc.titre = titre;
      graphismeDesc.description = description;
      await graphismeDesc.save();
    }

    res.json({
      message: "Description mise à jour avec succès",
      data: graphismeDesc,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la description:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la description",
      error: error.message,
    });
  }
});

module.exports = router;
