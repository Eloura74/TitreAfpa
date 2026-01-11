// ============================================
// CONTRÔLEUR GALERIE - Version Optimisée
// ============================================
// Gestion professionnelle avec pagination, filtres et logging

const Photo = require("../models/Photo");
const logger = require("../utils/logger");
const { AppError, catchAsync } = require("../middleware/errorHandler");

// ============================================
// OBTENIR TOUTES LES PHOTOS (avec pagination et filtres)
// ============================================
exports.getAllPhotos = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50; // Plus élevé pour la galerie
  const skip = (page - 1) * limit;

  // Construction des filtres
  const filter = { categorie: { $not: /EvenementPrive/i } };

  // Filtre par album
  if (req.query.albumId) {
    filter.album = req.query.albumId;
  }

  // Filtre par catégorie
  if (req.query.categorie && req.query.categorie !== 'Toutes') {
    filter.categorie = req.query.categorie;
  }

  // Filtre par utilisateur (admin uniquement)
  if (req.query.utilisateur && req.user?.role === 'admin') {
    filter.utilisateur = req.query.utilisateur;
  }

  // Recherche textuelle (si index text est créé)
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Requête avec pagination et tri
  const photos = await Photo.find(filter)
    .sort({ createdAt: -1 }) // Tri par date décroissante
    .limit(limit)
    .skip(skip)
    .populate('album', 'titre') // Peupler l'album (nom uniquement)
    .lean(); // Optimisation : objets JS simples

  // Compte total pour la pagination
  const total = await Photo.countDocuments(filter);

  // Transformation : ajouter tarifs par défaut si vides
  const photosModifiees = photos.map((photo) => ({
    ...photo,
    tarifs:
      Array.isArray(photo.tarifs) && photo.tarifs.length > 0
        ? photo.tarifs
        : [
            {
              id: "default-" + photo._id,
              format: "Standard",
              support: "Papier photo",
              prix: photo.prix || 0,
            },
          ],
  }));

  logger.info('Galerie récupérée', {
    page,
    limit,
    total,
    filters: Object.keys(filter).length,
  });

  res.json({
    status: 'success',
    results: photosModifiees.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: photosModifiees,
  });
});

// ============================================
// OBTENIR UNE PHOTO PAR ID
// ============================================
exports.getPhotoById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const photo = await Photo.findById(id)
    .populate('album', 'titre')
    .populate('utilisateur', 'nom prenom email');

  if (!photo) {
    throw new AppError('Photo non trouvée', 404);
  }

  // Vérifier si photo privée
  if (photo.categorie?.match(/EvenementPrive/i) && req.user?.role !== 'admin') {
    throw new AppError('Accès non autorisé à cette photo', 403);
  }

  logger.info('Photo récupérée', { photoId: id });

  res.json({
    status: 'success',
    data: photo,
  });
});

// ============================================
// CRÉER UNE NOUVELLE PHOTO
// ============================================
exports.createPhoto = catchAsync(async (req, res) => {
  const { titre, src, alt, description, categorie, type } = req.body;

  // Validation basique
  if (!titre || !src) {
    throw new AppError('Le titre et la source (src) sont obligatoires', 400);
  }

  // Création de la photo
  const nouvellePhoto = new Photo({
    ...req.body,
    utilisateur: req.user?._id, // Associe au user connecté
  });

  await nouvellePhoto.save();

  logger.info('Photo créée', {
    photoId: nouvellePhoto._id,
    titre,
    categorie,
    userId: req.user?.id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Photo ajoutée avec succès',
    data: nouvellePhoto,
  });
});

// ============================================
// METTRE À JOUR UNE PHOTO
// ============================================
exports.updatePhoto = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Vérification que la photo existe
  const photo = await Photo.findById(id);
  if (!photo) {
    throw new AppError('Photo non trouvée', 404);
  }

  // Mise à jour
  const photoModifiee = await Photo.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  logger.info('Photo mise à jour', {
    photoId: id,
    userId: req.user?.id,
  });

  res.json({
    status: 'success',
    message: 'Photo modifiée avec succès',
    data: photoModifiee,
  });
});

// ============================================
// SUPPRIMER UNE PHOTO
// ============================================
exports.deletePhoto = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Vérification que la photo existe
  const photo = await Photo.findById(id);
  if (!photo) {
    throw new AppError('Photo non trouvée', 404);
  }

  // Suppression
  await Photo.findByIdAndDelete(id);

  logger.warn('Photo supprimée', {
    photoId: id,
    titre: photo.titre,
    userId: req.user?.id,
  });

  res.json({
    status: 'success',
    message: 'Photo supprimée avec succès',
  });
});

// ============================================
// OBTENIR LES STATISTIQUES (Admin)
// ============================================
exports.getStats = catchAsync(async (req, res) => {
  const stats = await Photo.aggregate([
    // Exclure les événements privés
    { $match: { categorie: { $not: /EvenementPrive/i } } },
    // Grouper par catégorie
    {
      $group: {
        _id: '$categorie',
        count: { $sum: 1 },
        avgPrice: { $avg: '$prix' },
      },
    },
    // Trier par nombre décroissant
    { $sort: { count: -1 } },
  ]);

  const totalPhotos = await Photo.countDocuments({
    categorie: { $not: /EvenementPrive/i },
  });

  logger.info('Statistiques galerie générées', {
    userId: req.user?.id,
  });

  res.json({
    status: 'success',
    data: {
      total: totalPhotos,
      byCategory: stats,
    },
  });
});
