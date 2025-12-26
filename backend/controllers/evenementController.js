// Contrôleur pour la gestion des événements
const Evenement = require("../models/Evenement");
// ***************************
// Obtenir tous les événements
// ***************************
// fonction asynchrone pour récupérer tous les événements de la base de données
// avec les paramètres req et res
exports.getAll = async (req, res) => {
  // rechercher (trouver) tous les documents de la collection MongoDB associée.
  // On filtre pour ne récupérer que les événements publics
  const evenements = await Evenement.find({ visibilite: "public" });
  // envoyer la réponse au client sous forme de JSON
  res.json(evenements);
};

// ***************************
// Obtenir les événements du client connecté
// ***************************
exports.getMyEvents = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur depuis le token (req.user.id)
    const userId = req.user.id;
    
    // Trouver les événements où le champ "client" correspond à l'ID de l'utilisateur
    const events = await Evenement.find({ client: userId }).populate("photos");
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ erreur: "Erreur lors de la récupération des événements." });
  }
};

// ***************************
// Obtenir un événement par ID
// ***************************
exports.getOne = async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id).populate("photos");
    if (!evenement) return res.status(404).json({ erreur: "Événement non trouvé" });

    // Si l'événement est public, on le renvoie
    if (evenement.visibilite === "public") {
      return res.json(evenement);
    }

    // Si privé, vérification des droits (admin ou client propriétaire)
    if (req.user.role === "admin" || (evenement.client && evenement.client.toString() === req.user.id)) {
      return res.json(evenement);
    }

    return res.status(403).json({ erreur: "Accès refusé à cet événement privé." });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
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
