// Fichier de routes Express pour la gestion des tarifs
// Ce fichier permet de :
// - afficher les tarifs actifs publiquement
// - permettre aux administrateurs de gérer (ajouter, modifier, supprimer) les tarifs
// - effectuer une sauvegarde automatique à chaque modification

const express = require("express");
const Tarif = require("../models/Tarif"); // Modèle Mongoose pour les tarifs
const { isAdmin } = require("../middleware/auth"); // Middleware pour restreindre l'accès aux admins
const fs = require("fs"); // Pour écrire les fichiers de sauvegarde
const path = require("path");

const router = express.Router(); // Initialisation du routeur Express

// -------------------------------------------------------------
// FONCTION : Sauvegarde automatique des tarifs avant modification
// -------------------------------------------------------------
// Cette fonction est appelée avant chaque modification (POST, PUT, DELETE)
// Elle sauvegarde tous les tarifs actuels dans un fichier .json horodaté
const backupTarifs = async () => {
  // DÉSACTIVÉ POUR VERCEL (Read-only filesystem)
  console.log("⚠️ Backup local désactivé pour compatibilité Vercel.");
  return;

  /*
  const tarifs = await Tarif.find(); // Récupère tous les tarifs depuis la base

  const backupDir = path.join(__dirname, "../backups"); // Répertoire de sauvegarde

  // Crée le dossier "backups" s’il n’existe pas encore
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Génère un fichier de sauvegarde JSON avec un timestamp
  fs.writeFileSync(
    path.join(backupDir, `tarifs-backup-${Date.now()}.json`),
    JSON.stringify(tarifs, null, 2) // Formate le JSON avec indentation pour lisibilité
  );
  */
};

// ============================================================
// ROUTES PUBLIQUES : accessibles à tout le monde (non admin)
// ============================================================

// -------------------------------------------------------------
// GET /api/tarifs
// -------------------------------------------------------------
// Récupère tous les tarifs dont le champ `actif` est à true
router.get("/", async (req, res) => {
  const tarifs = await Tarif.find({ actif: true }); // Filtre uniquement les tarifs actifs
  res.json(tarifs); // Envoie les tarifs au client en JSON
});

// ============================================================
// MIDDLEWARE ADMIN GLOBAL : protège toutes les routes ci-dessous
// ============================================================
// Toute route définie après ce `router.use()` sera accessible uniquement aux administrateurs
router.use(isAdmin); // Vérifie que l'utilisateur est un admin

// -------------------------------------------------------------
// POST /api/tarifs
// -------------------------------------------------------------
// Crée un nouveau tarif (nom, type, format, prix, support, etc.)
router.post("/", async (req, res) => {
  await backupTarifs(); // Sauvegarde des tarifs avant toute modification

  const tarif = new Tarif(req.body); // Création du nouveau tarif à partir du corps de la requête

  await tarif.save(); // Sauvegarde du tarif dans MongoDB

  res.status(201).json(tarif); // Renvoie le tarif créé avec un code 201 (Created)
});

// -------------------------------------------------------------
// PUT /api/tarifs/:id
// -------------------------------------------------------------
// Met à jour un tarif existant à partir de son ID
router.put("/:id", async (req, res) => {
  await backupTarifs(); // Sauvegarde automatique avant la mise à jour

  const tarif = await Tarif.findByIdAndUpdate(
    req.params.id, // ID du tarif à modifier
    req.body, // Nouvelles données envoyées
    { new: true } // Option pour renvoyer le tarif modifié
  );

  res.json(tarif); // Retourne le tarif modifié
});

// -------------------------------------------------------------
// DELETE /api/tarifs/:id
// -------------------------------------------------------------
// Supprime un tarif à partir de son identifiant unique
router.delete("/:id", async (req, res) => {
  await backupTarifs(); // Sauvegarde automatique avant suppression

  await Tarif.findByIdAndDelete(req.params.id); // Suppression dans MongoDB

  res.status(204).end(); // Code 204 = succès sans contenu retourné
});

// -------------------------------------------------------------
// EXPORT DU ROUTEUR
// -------------------------------------------------------------
// Ce module sera monté dans app.js via : app.use('/api/tarifs', tarifsRoutes)
module.exports = router;
