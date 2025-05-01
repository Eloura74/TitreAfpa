const express = require('express');
const Tarif = require('../models/Tarif');
const { isAdmin } = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Fonction de sauvegarde automatique des tarifs avant modification
const backupTarifs = async () => {
  const tarifs = await Tarif.find();
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  fs.writeFileSync(
    path.join(backupDir, `tarifs-backup-${Date.now()}.json`),
    JSON.stringify(tarifs, null, 2)
  );
};

// GET public (liste tarifs actifs)
router.get('/', async (req, res) => {
  const tarifs = await Tarif.find({ actif: true });
  res.json(tarifs);
});

// ADMIN : CRUD
router.use(isAdmin);

// POST (ajout d'un tarif)
router.post('/', async (req, res) => {
  await backupTarifs();
  const tarif = new Tarif(req.body);
  await tarif.save();
  res.status(201).json(tarif);
});

// PUT (modification d'un tarif)
router.put('/:id', async (req, res) => {
  await backupTarifs();
  const tarif = await Tarif.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(tarif);
});

// DELETE (suppression d'un tarif)
router.delete('/:id', async (req, res) => {
  await backupTarifs();
  await Tarif.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
