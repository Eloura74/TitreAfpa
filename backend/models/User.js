const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  motdepasse: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('motdepasse')) return next();
  this.motdepasse = await bcrypt.hash(this.motdepasse, 10);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.motdepasse);
};

module.exports = mongoose.model('User', userSchema);
