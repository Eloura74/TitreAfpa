// Contrôleur pour la gestion des paniers
// Ce fichier contient les fonctions qui permettent de gérer les opérations CRUD (Créer, Lire, Modifier, Supprimer)
// sur les paniers enregistrés dans la base de données MongoDB.

const Panier = require("../models/Panier"); // Import du modèle Mongoose "Panier"

// ***************************
// Obtenir tous les paniers
// ***************************
// Fonction asynchrone pour récupérer tous les paniers depuis la base de données
// Elle utilise la méthode find() de Mongoose pour obtenir tous les documents de la collection "paniers"
exports.getAll = async (req, res) => {
  const paniers = await Panier.find(); // Recherche de tous les paniers existants
  res.json(paniers); // Envoi de la réponse au client en format JSON
};

// ***************************
// Ajouter un panier
// ***************************
// Fonction asynchrone pour ajouter un nouveau panier dans la base de données
exports.create = async (req, res) => {
  try {
    // Création d’un nouveau panier à partir des données reçues dans le corps de la requête (req.body)
    const nouveauPanier = new Panier(req.body);

    // Sauvegarde du panier dans la base de données MongoDB
    await nouveauPanier.save();

    // Réponse avec un code HTTP 201 (Créé) et le panier ajouté en JSON
    res.status(201).json(nouveauPanier);
  } catch (err) {
    // En cas d’erreur (ex: données manquantes ou invalides), réponse avec un code HTTP 400 (Bad Request)
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Modifier un panier
// ***************************
// Fonction asynchrone pour modifier un panier existant dans la base de données
exports.update = async (req, res) => {
  try {
    // Recherche du panier par son identifiant (ID passé dans l'URL) et mise à jour avec les nouvelles données
    const panierModifie = await Panier.findByIdAndUpdate(
      req.params.id, // ID du panier à modifier (fourni dans l'URL)
      req.body, // Nouvelles données à appliquer (reçues dans le corps de la requête)
      { new: true } // Option pour retourner le document modifié (et non l’ancien)
    );

    // Envoi de la réponse avec le panier modifié
    res.json(panierModifie);
  } catch (err) {
    // En cas d’erreur (ex: ID invalide ou données incorrectes), réponse avec code HTTP 400
    res.status(400).json({ erreur: err.message });
  }
};

// ***************************
// Supprimer un panier
// ***************************
// Fonction asynchrone pour supprimer un panier existant dans la base de données
exports.remove = async (req, res) => {
  try {
    // Recherche du panier par son identifiant (ID) et suppression
    await Panier.findByIdAndDelete(req.params.id);

    // Envoi d’un message de confirmation au client
    res.json({ message: "Panier supprimé" });
  } catch (err) {
    // En cas d’erreur (ex: ID inexistant), réponse avec un code HTTP 400 et message d’erreur
    res.status(400).json({ erreur: err.message });
  }
};
// ***************************
// Obtenir le panier de l'utilisateur connecté
// ***************************
exports.getMyCart = async (req, res) => {
  try {
    // req.user est défini par le middleware auth
    const panier = await Panier.findOne({ utilisateur: req.user._id }).populate(
      "articles.photo"
    );
    res.json(panier || { articles: [] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
};

// ***************************
// Sauvegarder le panier de l'utilisateur connecté
// ***************************
exports.saveMyCart = async (req, res) => {
  try {
    const { articles } = req.body;

    // On cherche si un panier existe déjà pour cet utilisateur
    let panier = await Panier.findOne({ utilisateur: req.user._id });

    if (panier) {
      // Mise à jour
      panier.articles = articles;
      panier.dateCreation = Date.now(); // On met à jour la date
      await panier.save();
    } else {
      // Création
      panier = await Panier.create({
        utilisateur: req.user._id,
        articles: articles,
      });
    }

    res.json(panier);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
};
