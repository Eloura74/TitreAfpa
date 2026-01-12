const AccesPrive = require("../models/AccesPrive");
const User = require("../models/User");

// GET ALL (Admin voit tout, Client voit les siens)
// Retourne un format standardisé cohérent avec les autres contrôleurs
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    // Si ce n'est pas un admin, on filtre par l'ID du client connecté
    if (req.user.role !== "admin") {
      filter.client = req.user.id;
    }
    const items = await AccesPrive.find(filter)
      .populate("photos")
      .populate("client", "email nom prenom");
    
    // Format de réponse standardisé pour cohérence avec paiementController
    res.json({
      status: "success",
      results: items.length,
      data: items,
    });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// GET ONE
exports.getOne = async (req, res) => {
  try {
    const item = await AccesPrive.findById(req.params.id)
      .populate("photos")
      .populate("client");
    if (!item)
      return res.status(404).json({ erreur: "Accès privé non trouvé" });

    // Vérification droits : Admin ou le client propriétaire
    if (
      req.user.role !== "admin" &&
      item.client._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ erreur: "Accès non autorisé." });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// CREATE (Admin only)
exports.create = async (req, res) => {
  try {
    const data = { ...req.body };

    // Validation du client
    if (!data.clientEmail) {
      return res
        .status(400)
        .json({ erreur: "L'email du client est obligatoire." });
    }

    const clientUser = await User.findOne({ email: data.clientEmail });
    if (!clientUser) {
      return res
        .status(400)
        .json({
          erreur: `Client avec l'email ${data.clientEmail} introuvable.`,
        });
    }

    data.client = clientUser._id;
    delete data.clientEmail;

    const newItem = new AccesPrive(data);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Erreur création accès privé:", err);
    res.status(400).json({ erreur: err.message });
  }
};

// UPDATE (Admin only)
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.clientEmail) {
      const clientUser = await User.findOne({ email: data.clientEmail });
      if (clientUser) {
        data.client = clientUser._id;
      }
      delete data.clientEmail;
    }

    const updatedItem = await AccesPrive.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// DELETE (Admin only)
exports.remove = async (req, res) => {
  try {
    await AccesPrive.findByIdAndDelete(req.params.id);
    res.json({ message: "Accès privé supprimé" });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// ADD PHOTOS
exports.addPhotos = async (req, res) => {
  try {
    const { photoIds } = req.body;
    if (!photoIds || !Array.isArray(photoIds)) {
      return res.status(400).json({ erreur: "Liste d'IDs invalide." });
    }

    const updatedItem = await AccesPrive.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photos: { $each: photoIds } } },
      { new: true }
    ).populate("photos");

    if (!updatedItem)
      return res.status(404).json({ erreur: "Accès privé non trouvé" });

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};
