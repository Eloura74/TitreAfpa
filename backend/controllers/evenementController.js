// Contrôleur pour la gestion des événements
const Evenement = require("../models/Evenement");
const User = require("../models/User"); // Import du modèle User pour la recherche par email

// ***************************
// Obtenir tous les événements
// ***************************
exports.getAll = async (req, res) => {
  try {
    // Si l'utilisateur est admin, il voit tout, sinon seulement les publics
    const filter = {};
    if (!req.user || req.user.role !== "admin") {
      filter.visibilite = "public";
    }
    const evenements = await Evenement.find(filter).populate("photos");
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Obtenir un événement par ID
// ***************************
exports.getOne = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id).populate(
      "photos",
    );
    if (!evenement)
      return res.status(404).json({ erreur: "Événement non trouvé" });

    // Si public, accès autorisé
    if (evenement.visibilite === "public") {
      return res.json(evenement);
    }

    // Si privé, vérification des droits
    // Admin ou le client assigné
    if (
      req.user &&
      (req.user.role === "admin" ||
        (evenement.client && evenement.client.toString() === req.user.id))
    ) {
      return res.json(evenement);
    }

    return res
      .status(403)
      .json({ erreur: "Accès refusé à cet événement privé." });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Obtenir mes événements (Client)
// ***************************
exports.getMyEvents = async (req, res) => {
  try {
    const evenements = await Evenement.find({ client: req.user.id }).populate(
      "photos",
    );
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Ajouter un événement
// ***************************
exports.create = async (req, res) => {
  try {
    const data = { ...req.body };

    // Si un email client est fourni, on cherche l'utilisateur correspondant
    if (data.clientEmail) {
      const clientUser = await User.findOne({ email: data.clientEmail });
      if (clientUser) {
        data.client = clientUser._id;
      } else {
        return res.status(400).json({
          erreur: `Client avec l'email ${data.clientEmail} introuvable.`,
        });
      }
      delete data.clientEmail;
    }

    console.log(
      "[EVENEMENT CREATE] Données reçues:",
      JSON.stringify(data, null, 2),
    );
    const nouvelEvenement = new Evenement(data);
    await nouvelEvenement.save();
    console.log(
      "[EVENEMENT CREATE] Événement sauvegardé avec customization:",
      nouvelEvenement.customization,
    );
    res.status(201).json(nouvelEvenement);
  } catch (err) {
    console.error("Erreur création événement:", err);
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Modifier un événement
// ***************************
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    // Si un email client est fourni, on cherche l'utilisateur correspondant
    if (data.clientEmail) {
      const clientUser = await User.findOne({ email: data.clientEmail });
      if (clientUser) {
        data.client = clientUser._id;
      }
      delete data.clientEmail;
    }

    const evenementModifie = await Evenement.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true },
    );
    res.json(evenementModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Ajouter des photos à un événement
// ***************************
exports.addPhotos = async (req, res) => {
  try {
    const { photoIds } = req.body; // Tableau d'IDs de photos
    if (!photoIds || !Array.isArray(photoIds)) {
      return res
        .status(400)
        .json({ erreur: "Liste d'IDs de photos invalide." });
    }

    // Étape 1: Mettre à jour l'événement
    await Evenement.findByIdAndUpdate(req.params.id, {
      $addToSet: { photos: { $each: photoIds } },
    });

    // Étape 2: Récupérer l'événement avec populate (requête séparée)
    const evenementPopulated = await Evenement.findById(req.params.id)
      .populate("photos")
      .exec();

    if (!evenementPopulated) {
      return res.status(404).json({ erreur: "Événement non trouvé" });
    }

    console.log(
      "[ADD PHOTOS] Photos après populate:",
      evenementPopulated.photos,
    );
    console.log(
      "[ADD PHOTOS] Type du premier:",
      typeof evenementPopulated.photos[0],
    );
    console.log("[ADD PHOTOS] Premier élément:", evenementPopulated.photos[0]);

    res.json(evenementPopulated);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Supprimer une photo d'un événement
// ***************************
exports.removePhoto = async (req, res) => {
  try {
    const { id, photoId } = req.params;

    // Étape 1: Mettre à jour l'événement
    await Evenement.findByIdAndUpdate(id, { $pull: { photos: photoId } });

    // Étape 2: Récupérer l'événement avec populate (requête séparée)
    const evenementPopulated = await Evenement.findById(id)
      .populate("photos")
      .exec();

    if (!evenementPopulated) {
      return res.status(404).json({ erreur: "Événement non trouvé" });
    }

    res.json({
      message: "Photo supprimée avec succès",
      evenement: evenementPopulated,
    });
  } catch (err) {
    console.error("Erreur suppression photo:", err);
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Supprimer un événement
// ***************************
exports.remove = async (req, res) => {
  try {
    await Evenement.findByIdAndDelete(req.params.id);
    res.json({ message: "Événement supprimé" });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
