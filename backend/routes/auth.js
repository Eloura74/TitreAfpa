const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, motdepasse } = req.body;
    // Détection de l'admin
    let role = 'user';
    if (email === 'fabien.licata@gmail.com' && motdepasse === 'admin') {
      role = 'admin';
    }
    const user = new User({ email, motdepasse, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, motdepasse } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(motdepasse))) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
