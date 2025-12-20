// Contrôleur pour la gestion des paiements
const Paiement = require("../models/Paiement");

// ***************************
// Obtenir tous les paiements
// ***************************
exports.getAll = async (req, res) => {
  try {
    const paiements = await Paiement.find().sort({ date: -1 }); // Tri par date décroissante
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Ajouter un paiement
// ***************************
exports.create = async (req, res) => {
  try {
    const nouveauPaiement = new Paiement(req.body);
    await nouveauPaiement.save();
    res.status(201).json(nouveauPaiement);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Modifier un paiement
// ***************************
exports.update = async (req, res) => {
  try {
    const paiementModifie = await Paiement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(paiementModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Obtenir les paiements de l'utilisateur connecté
// ***************************
exports.getMyPayments = async (req, res) => {
  try {
    // On cherche les paiements où 'utilisateur' correspond à l'ID du user connecté
    // OU où 'emailClient' correspond à l'email du user (cas PayPal avec même email)
    const paiements = await Paiement.find({
      $or: [{ utilisateur: req.user._id }, { emailClient: req.user.email }],
    }).sort({ date: -1 });

    res.json(paiements);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Supprimer un paiement
// ***************************
exports.remove = async (req, res) => {
  try {
    await Paiement.findByIdAndDelete(req.params.id);
    res.json({ message: "Paiement supprimé" });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
