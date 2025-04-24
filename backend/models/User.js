// Importation de la bibliothèque Mongoose pour gérer la base de données MongoDB
const mongoose = require("mongoose");

// Importation de bcrypt, une bibliothèque utilisée pour sécuriser les mots de passe en les hashant
const bcrypt = require("bcrypt");

// Définition du schéma utilisateur (User) avec Mongoose
const userSchema = new mongoose.Schema({
  // Champ email : de type String, obligatoire et unique (aucun utilisateur ne peut avoir le même email)
  email: { type: String, required: true, unique: true },

  // Champ motdepasse : de type String et obligatoire (le mot de passe sera stocké sous forme hashée)
  motdepasse: { type: String, required: true },

  // Champ rôle : définit si l'utilisateur est un 'admin' ou un 'user' (par défaut, 'user')
  role: {
    type: String,
    enum: ["admin", "user"], // Limite les valeurs possibles à 'admin' ou 'user'
    default: "user", // Si aucun rôle n'est spécifié, 'user' est attribué
  },
});

// Middleware (pré-hook) exécuté **avant la sauvegarde** d'un document utilisateur
// Objectif : Hasher le mot de passe si celui-ci a été modifié ou est nouveau
userSchema.pre("save", async function (next) {
  // Vérifie si le mot de passe a été modifié ; si non, passe à l'étape suivante sans rien faire
  if (!this.isModified("motdepasse")) return next();

  // Hashage du mot de passe avec un "salt" de 10 tours pour renforcer la sécurité
  this.motdepasse = await bcrypt.hash(this.motdepasse, 10);

  // Passe au middleware suivant ou termine le processus de sauvegarde
  next();
});

// Définition d'une méthode personnalisée sur le schéma pour comparer un mot de passe fourni avec le hash stocké
// Cette méthode sera disponible sur toutes les instances du modèle User
userSchema.methods.comparePassword = function (candidate) {
  // Compare le mot de passe en clair fourni par l'utilisateur (candidate) avec le hash enregistré
  return bcrypt.compare(candidate, this.motdepasse);
};

// Exportation du modèle User
// Ce modèle permet d'interagir avec la collection "users" dans MongoDB
module.exports = mongoose.model("User", userSchema);
