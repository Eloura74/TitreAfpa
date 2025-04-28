const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paiementController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Toutes les routes protégées par auth + admin
router.get('/', auth, isAdmin, ctrl.getAll);
router.post('/', auth, isAdmin, ctrl.create);
router.put('/:id', auth, isAdmin, ctrl.update);
router.delete('/:id', auth, isAdmin, ctrl.remove);

module.exports = router;
