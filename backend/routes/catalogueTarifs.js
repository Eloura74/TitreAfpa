const express = require('express');
const router = express.Router();
const CatalogueTarif = require('../models/CatalogueTarif');
const { isAdmin } = require('../middleware/auth');

// GET /api/catalogue-tarifs - Récupérer tous les tarifs du catalogue
router.get('/', async (req, res) => {
  try {
    const tarifs = await CatalogueTarif.find().sort({ gamme: 1, format: 1 });
    res.json(tarifs);
  } catch (error) {
    console.error('Erreur lors de la récupération des tarifs:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/catalogue-tarifs/gammes - Récupérer la liste des gammes
router.get('/gammes', async (req, res) => {
  try {
    const gammes = await CatalogueTarif.distinct('gamme');
    res.json(gammes);
  } catch (error) {
    console.error('Erreur lors de la récupération des gammes:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/catalogue-tarifs/gamme/:gamme - Récupérer les tarifs d'une gamme
router.get('/gamme/:gamme', async (req, res) => {
  try {
    const { gamme } = req.params;
    const tarifs = await CatalogueTarif.find({ gamme }).sort({ format: 1 });
    res.json(tarifs);
  } catch (error) {
    console.error('Erreur lors de la récupération des tarifs de la gamme:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/catalogue-tarifs/:id - Récupérer un tarif spécifique
router.get('/:id', async (req, res) => {
  try {
    const tarif = await CatalogueTarif.findById(req.params.id);
    if (!tarif) {
      return res.status(404).json({ message: 'Tarif non trouvé' });
    }
    res.json(tarif);
  } catch (error) {
    console.error('Erreur lors de la récupération du tarif:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/catalogue-tarifs - Créer un nouveau tarif (admin uniquement)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { gamme, format, coutFournisseurTTC, coefficient, prixSite, netApresURSSAF, margeNette } = req.body;
    
    const nouveauTarif = new CatalogueTarif({
      gamme,
      format,
      coutFournisseurTTC,
      coefficient,
      prixSite,
      netApresURSSAF,
      margeNette
    });
    
    const tarifSauvegarde = await nouveauTarif.save();
    res.status(201).json(tarifSauvegarde);
  } catch (error) {
    console.error('Erreur lors de la création du tarif:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/catalogue-tarifs/:id - Mettre à jour un tarif (admin uniquement)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { gamme, format, coutFournisseurTTC, coefficient, prixSite, netApresURSSAF, margeNette } = req.body;
    
    const tarifMisAJour = await CatalogueTarif.findByIdAndUpdate(
      req.params.id,
      {
        gamme,
        format,
        coutFournisseurTTC,
        coefficient,
        prixSite,
        netApresURSSAF,
        margeNette
      },
      { new: true, runValidators: true }
    );
    
    if (!tarifMisAJour) {
      return res.status(404).json({ message: 'Tarif non trouvé' });
    }
    
    res.json(tarifMisAJour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tarif:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/catalogue-tarifs/:id - Supprimer un tarif (admin uniquement)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const tarifSupprime = await CatalogueTarif.findByIdAndDelete(req.params.id);
    
    if (!tarifSupprime) {
      return res.status(404).json({ message: 'Tarif non trouvé' });
    }
    
    res.json({ message: 'Tarif supprimé avec succès', tarif: tarifSupprime });
  } catch (error) {
    console.error('Erreur lors de la suppression du tarif:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
