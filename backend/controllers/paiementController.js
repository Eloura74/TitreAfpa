// Contrôleur pour la gestion des paiements
const Paiement = require('../models/Paiement');

// Obtenir tous les paiements
exports.getAll = async (req, res) => {
  const paiements = await Paiement.find();
  res.json(paiements);
};

// Ajouter un paiement
exports.create = async (req, res) => {
  try {
    const nouveauPaiement = new Paiement(req.body);
    await nouveauPaiement.save();
    res.status(201).json(nouveauPaiement);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Modifier un paiement
exports.update = async (req, res) => {
  try {
    const paiementModifie = await Paiement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(paiementModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Supprimer un paiement
exports.remove = async (req, res) => {
  try {
    await Paiement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Paiement supprimé' });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
