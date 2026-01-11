// ============================================
// CONTRÔLEUR PAIEMENTS - Version Optimisée
// ============================================
// Gestion professionnelle avec validation, logging et pagination

const Paiement = require("../models/Paiement");
const logger = require("../utils/logger");
const { AppError, catchAsync } = require("../middleware/errorHandler");

// ============================================
// OBTENIR TOUS LES PAIEMENTS (Admin uniquement)
// ============================================
// Avec pagination, tri et filtres
exports.getAll = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Filtres optionnels
  const filters = {};
  if (req.query.statut) {
    filters.statut = req.query.statut;
  }
  if (req.query.methode) {
    filters.methode = req.query.methode;
  }

  // Requête avec pagination
  const paiements = await Paiement.find(filters)
    .sort({ date: -1 }) // Tri par date décroissante
    .limit(limit)
    .skip(skip)
    .lean(); // Optimisation : retourne des objets JS simples au lieu de documents Mongoose

  // Compte total pour la pagination
  const total = await Paiement.countDocuments(filters);

  logger.info('Liste paiements récupérée', {
    userId: req.user?.id,
    page,
    limit,
    total,
  });

  res.json({
    status: 'success',
    results: paiements.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: paiements,
  });
});

// ============================================
// CRÉER UN NOUVEAU PAIEMENT
// ============================================
// Validation des données obligatoires
exports.create = catchAsync(async (req, res) => {
  const { montant, methode, statut, emailClient } = req.body;

  // Validation basique (en attendant express-validator dans les routes)
  if (!montant || montant <= 0) {
    throw new AppError('Le montant doit être supérieur à 0', 400);
  }

  if (!methode || !['paypal', 'stripe', 'carte'].includes(methode)) {
    throw new AppError('Méthode de paiement invalide', 400);
  }

  // Création du paiement
  const nouveauPaiement = new Paiement({
    ...req.body,
    utilisateur: req.user?._id, // Associe au user connecté si disponible
  });

  await nouveauPaiement.save();

  logger.info('Paiement créé', {
    paiementId: nouveauPaiement._id,
    montant,
    methode,
    userId: req.user?.id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Paiement créé avec succès',
    data: nouveauPaiement,
  });
});

// ============================================
// METTRE À JOUR UN PAIEMENT
// ============================================
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Vérification que le paiement existe
  const paiement = await Paiement.findById(id);
  if (!paiement) {
    throw new AppError('Paiement non trouvé', 404);
  }

  // Mise à jour
  const paiementModifie = await Paiement.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true, // Retourne le document modifié
      runValidators: true, // Active la validation Mongoose
    }
  );

  logger.info('Paiement mis à jour', {
    paiementId: id,
    userId: req.user?.id,
  });

  res.json({
    status: 'success',
    message: 'Paiement modifié avec succès',
    data: paiementModifie,
  });
});

// ============================================
// OBTENIR MES PAIEMENTS (Utilisateur connecté)
// ============================================
exports.getMyPayments = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Recherche des paiements de l'utilisateur
  // Soit par ID utilisateur, soit par email (cas PayPal)
  const paiements = await Paiement.find({
    $or: [
      { utilisateur: req.user._id },
      { emailClient: req.user.email },
    ],
  })
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  // Compte total
  const total = await Paiement.countDocuments({
    $or: [
      { utilisateur: req.user._id },
      { emailClient: req.user.email },
    ],
  });

  logger.info('Historique paiements utilisateur', {
    userId: req.user.id,
    count: paiements.length,
  });

  res.json({
    status: 'success',
    results: paiements.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: paiements,
  });
});

// ============================================
// SUPPRIMER UN PAIEMENT
// ============================================
exports.remove = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Vérification que le paiement existe
  const paiement = await Paiement.findById(id);
  if (!paiement) {
    throw new AppError('Paiement non trouvé', 404);
  }

  // Suppression
  await Paiement.findByIdAndDelete(id);

  logger.warn('Paiement supprimé', {
    paiementId: id,
    userId: req.user?.id,
  });

  res.json({
    status: 'success',
    message: 'Paiement supprimé avec succès',
  });
});
