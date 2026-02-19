const About = require("../models/About");
const logger = require("../utils/logger");

exports.getAbout = async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      // Si aucune donnée n'existe, on crée celle par défaut définie dans le modèle
      about = new About();
      await about.save();
    }
    res.status(200).json(about);
  } catch (err) {
    logger.error("Erreur lors de la récupération de la page À Propos", {
      error: err.message,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const {
      image,
      jobTitle,
      name,
      introduction,
      parcours,
      expertise,
      studio,
      quote,
      tirages,
    } = req.body;

    let about = await About.findOne();
    if (!about) {
      about = new About();
    }

    // Mise à jour des champs
    if (image !== undefined) about.image = image;
    if (jobTitle !== undefined) about.jobTitle = jobTitle;
    if (name !== undefined) about.name = name;
    if (introduction !== undefined) about.introduction = introduction;

    if (parcours) {
      if (parcours.title !== undefined) about.parcours.title = parcours.title;
      if (parcours.content !== undefined)
        about.parcours.content = parcours.content;
    }
    if (expertise) {
      if (expertise.title !== undefined)
        about.expertise.title = expertise.title;
      if (expertise.content !== undefined)
        about.expertise.content = expertise.content;
    }
    if (studio) {
      if (studio.title !== undefined) about.studio.title = studio.title;
      if (studio.content !== undefined) about.studio.content = studio.content;
    }
    if (quote !== undefined) about.quote = quote;
    if (tirages) {
      if (tirages.title !== undefined) about.tirages.title = tirages.title;
      if (tirages.content !== undefined)
        about.tirages.content = tirages.content;
    }

    await about.save();

    logger.info("Page À Propos mise à jour avec succès");
    res.status(200).json({ message: "Mise à jour réussie", about });
  } catch (err) {
    logger.error("Erreur lors de la mise à jour de la page À Propos", {
      error: err.message,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};
