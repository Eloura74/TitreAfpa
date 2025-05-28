// Contrôleur pour la gestion des événements
const Evenement = require("../models/Evenement");
// ***************************
// Obtenir tous les événements
// ***************************
// fonction asynchrone pour récupérer tous les événements de la base de données
// avec les paramètres req et res
exports.getAll = async (req, res) => {
  // rechercher (trouver) tous les documents de la collection MongoDB associée.
  const evenements = await Evenement.find();
  // envoyer la réponse au client sous forme de JSON
  res.json(evenements);
};

// ***************************
// Ajouter un événement
// ***************************
// fonction asynchrone pour ajouter un événement à la base de données
exports.create = async (req, res) => {
  try {
    // Créer un nouveau document Evenement avec les données fournies dans le corps de la requête
    const nouvelEvenement = new Evenement(req.body);
    // Enregistrer le nouveau document dans la base de données
    await nouvelEvenement.save();
    // Envoyer la réponse au client sous forme de JSON
    res.status(201).json(nouvelEvenement);
  } catch (err) {
    // Envoyer la réponse au client sous forme de JSON
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Modifier un événement
// ***************************
// fonction asynchrone pour modifier un événement dans la base de données
exports.update = async (req, res) => {
  // Rechercher (trouver) un document spécifique dans la collection MongoDB associée.
  try {
    const evenementModifie = await Evenement.findByIdAndUpdate(
      // methode findByIdAndUpdate pour modifier un document spécifique
      req.params.id, // id de l'événement à modifier
      req.body, // données à modifier
      { new: true } // retourner le document modifié
    );
    res.json(evenementModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Supprimer un événement
// ***************************
// fonction asynchrone pour supprimer un événement dans la base de données
exports.remove = async (req, res) => {
  try {
    await Evenement.findByIdAndDelete(req.params.id); // methode findByIdAndDelete pour supprimer un document spécifique
    res.json({ message: "Événement supprimé" });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
