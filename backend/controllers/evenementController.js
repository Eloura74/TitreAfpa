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
    const evenement = await Evenement.findById(req.params.id).populate("photos");
    if (!evenement) return res.status(404).json({ erreur: "Événement non trouvé" });

    // Si public, accès autorisé
    if (evenement.visibilite === "public") {
      return res.json(evenement);
    }

    // Si privé, vérification des droits
    // Admin ou le client assigné
    if (req.user && (req.user.role === "admin" || (evenement.client && evenement.client.toString() === req.user.id))) {
      return res.json(evenement);
    }

    return res.status(403).json({ erreur: "Accès refusé à cet événement privé." });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Obtenir mes événements (Client)
// ***************************
exports.getMyEvents = async (req, res) => {
  try {
    const evenements = await Evenement.find({ client: req.user.id }).populate("photos");
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
        return res.status(400).json({ erreur: `Client avec l'email ${data.clientEmail} introuvable.` });
      }
      delete data.clientEmail;
    }

    const nouvelEvenement = new Evenement(data);
    await nouvelEvenement.save();
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
      { new: true }
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
      return res.status(400).json({ erreur: "Liste d'IDs de photos invalide." });
    }

    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) return res.status(404).json({ erreur: "Événement non trouvé" });

    // Ajout des photos sans doublons
    photoIds.forEach(id => {
      if (!evenement.photos.includes(id)) {
        evenement.photos.push(id);
      }
    });

    await evenement.save();
    res.json(evenement);
  } catch (err) {
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
