// Contrôleur pour la gestion des événements
const Evenement = require('../models/Evenement');

// Obtenir tous les événements
exports.getAll = async (req, res) => {
  const evenements = await Evenement.find();
  res.json(evenements);
};

// Ajouter un événement
exports.create = async (req, res) => {
  try {
    const nouvelEvenement = new Evenement(req.body);
    await nouvelEvenement.save();
    res.status(201).json(nouvelEvenement);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Modifier un événement
exports.update = async (req, res) => {
  try {
    const evenementModifie = await Evenement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(evenementModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Supprimer un événement
exports.remove = async (req, res) => {
  try {
    await Evenement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Événement supprimé' });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
