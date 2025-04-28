// Contrôleur pour la gestion des paniers
const Panier = require('../models/Panier');

// Obtenir tous les paniers
exports.getAll = async (req, res) => {
  const paniers = await Panier.find();
  res.json(paniers);
};

// Ajouter un panier
exports.create = async (req, res) => {
  try {
    const nouveauPanier = new Panier(req.body);
    await nouveauPanier.save();
    res.status(201).json(nouveauPanier);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Modifier un panier
exports.update = async (req, res) => {
  try {
    const panierModifie = await Panier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(panierModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Supprimer un panier
exports.remove = async (req, res) => {
  try {
    await Panier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Panier supprimé' });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
