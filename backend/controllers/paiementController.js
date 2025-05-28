// Contrôleur pour la gestion des paiements
const Paiement = require("../models/Paiement");

// Obtenir tous les paiements
exports.getAll = async (req, res) => {
  // Rechercher (trouver) tous les documents de la collection MongoDB associée.
  const paiements = await Paiement.find();
  // envoyer la réponse au client sous forme de JSON
  res.json(paiements);
};

// Ajouter un paiement
exports.create = async (req, res) => {
  try {
    const nouveauPaiement = new Paiement(req.body);
    await nouveauPaiement.save(); // Contrôleur pour la gestion des paiements
    // Ce fichier contient les fonctions qui permettent de gérer les opérations CRUD (Créer, Lire, Modifier, Supprimer)
    // sur les paiements enregistrés dans la base de données MongoDB.

    const Paiement = require("../models/Paiement"); // Import du modèle Mongoose "Paiement"

    // ***************************
    // Obtenir tous les paiements
    // ***************************
    // Fonction asynchrone pour récupérer tous les paiements depuis la base de données
    // Elle utilise la méthode find() de Mongoose pour obtenir tous les documents de la collection "paiements"
    exports.getAll = async (req, res) => {
      const paiements = await Paiement.find(); // Recherche de tous les paiements dans la base
      res.json(paiements); // Envoi de la réponse au client en format JSON
    };

    // ***************************
    // Ajouter un paiement
    // ***************************
    // Fonction asynchrone pour ajouter un nouveau paiement dans la base de données
    exports.create = async (req, res) => {
      try {
        // Création d’un nouveau paiement à partir des données reçues dans le corps de la requête (req.body)
        const nouveauPaiement = new Paiement(req.body);

        // Sauvegarde du paiement dans la base de données MongoDB
        await nouveauPaiement.save();

        // Réponse avec un code HTTP 201 (Créé) et le paiement ajouté en JSON
        res.status(201).json(nouveauPaiement);
      } catch (err) {
        // En cas d’erreur (ex: données invalides), on renvoie une réponse avec un code HTTP 400 (Bad Request)
        res.status(400).json({ erreur: err.message });
      }
    };

    // ***************************
    // Modifier un paiement
    // ***************************
    // Fonction asynchrone pour modifier un paiement existant dans la base de données
    exports.update = async (req, res) => {
      try {
        // Recherche du paiement par son identifiant (ID passé dans l'URL) et mise à jour avec les nouvelles données
        const paiementModifie = await Paiement.findByIdAndUpdate(
          req.params.id, // ID du paiement à modifier (reçu via l'URL)
          req.body, // Nouvelles données à appliquer (reçues dans le corps de la requête)
          { new: true } // Option pour retourner le document mis à jour (et pas l'ancien)
        );

        // Envoi de la réponse avec le paiement modifié
        res.json(paiementModifie);
      } catch (err) {
        // En cas d’erreur (ex: ID invalide ou données incorrectes), réponse avec code HTTP 400
        res.status(400).json({ erreur: err.message });
      }
    };

    // ***************************
    // Supprimer un paiement
    // ***************************
    // Fonction asynchrone pour supprimer un paiement existant dans la base de données
    exports.remove = async (req, res) => {
      try {
        // Recherche du paiement par son identifiant (ID) et suppression
        await Paiement.findByIdAndDelete(req.params.id);

        // Envoi d’un message de confirmation en réponse
        res.json({ message: "Paiement supprimé" });
      } catch (err) {
        // En cas d’erreur (ex: ID inexistant), réponse avec un code HTTP 400 et message d’erreur
        res.status(400).json({ erreur: err.message });
      }
    };

    res.status(201).json(nouveauPaiement);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Modifier un paiement
exports.update = async (req, res) => {
  try {
    const paiementModifie = await Paiement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(paiementModifie);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};

// Supprimer un paiement
exports.remove = async (req, res) => {
  try {
    await Paiement.findByIdAndDelete(req.params.id);
    res.json({ message: "Paiement supprimé" });
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
