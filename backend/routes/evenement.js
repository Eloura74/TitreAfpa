const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/evenementController');
const auth = require('../middleware/auth').authenticate;
const isAdmin = require('../middleware/isAdmin');

// Lecture publique des événements
router.get('/', ctrl.getAll);
// Les autres routes restent protégées
router.post('/', auth, isAdmin, ctrl.create);
router.put('/:id', auth, isAdmin, ctrl.update);
router.delete('/:id', auth, isAdmin, ctrl.remove);

module.exports = router;
