// Fichier de routes Express pour la gestion des tarifs
// Ce fichier permet de :
// - afficher les tarifs actifs publiquement
// - permettre aux administrateurs de gérer (ajouter, modifier, supprimer) les tarifs
// - effectuer une sauvegarde automatique à chaque modification

const express = require("express");
const Tarif = require("../models/Tarif"); // Modèle Mongoose pour les tarifs
const TarifConfig = require("../models/TarifConfig"); // Modèle pour la config hiérarchique
const TariffConfig = require("../models/TariffConfig"); // Modèle V2 pour la config Picto
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

// -------------------------------------------------------------
// GET /api/tarifs/config
// -------------------------------------------------------------
// Récupère la configuration hiérarchique des tarifs
router.get("/config", async (req, res) => {
  try {
    const config = await TariffConfig.findOne().sort({ createdAt: -1 });
    console.log("[GET CONFIG] Coefficient global:", config?.globalCoefficient);
    console.log(
      "[GET CONFIG] Premier format:",
      config?.categories?.[0]?.products?.[0]?.supports?.[0]?.formats?.[0]
        ?.price,
    );
    res.json(config || { categories: [], globalCoefficient: 1.75 });
  } catch (err) {
    console.error("[GET CONFIG] Erreur:", err);
    res.status(500).json({ message: "Erreur chargement config", error: err });
  }
});

// ============================================================
// MIDDLEWARE ADMIN GLOBAL : protège toutes les routes ci-dessous
// ============================================================
// Toute route définie après ce `router.use()` sera accessible uniquement aux administrateurs
router.use(isAdmin); // Vérifie que l'utilisateur est un admin

// -------------------------------------------------------------
// POST /api/tarifs/reset-to-base
// -------------------------------------------------------------
// Force la réinitialisation de tous les tarifs depuis les coûts fournisseur
router.post("/reset-to-base", async (req, res) => {
  try {
    console.log("[RESET] Début de la réinitialisation forcée");

    const config = await TariffConfig.findOne().sort({ createdAt: -1 });

    if (!config || !config.categories) {
      return res.status(404).json({
        success: false,
        message: "Configuration non trouvée",
      });
    }

    // Vérifier si les coûts fournisseur sont présents
    const firstFormat =
      config.categories[0]?.products[0]?.supports[0]?.formats[0];
    console.log("[RESET] Premier format en base:", {
      name: firstFormat?.name,
      price: firstFormat?.price,
      coutFournisseur: firstFormat?.coutFournisseur,
    });

    const baseCoefficient = 1.75;
    let totalPricesReset = 0;
    let missingCosts = 0;

    const updatedCategories = JSON.parse(JSON.stringify(config.categories));

    updatedCategories.forEach((category) => {
      category.products.forEach((product) => {
        product.supports.forEach((support) => {
          if (support.technicalSpecs) {
            support.technicalSpecs.coefficientGlobal = baseCoefficient;
          }

          support.formats.forEach((format) => {
            if (format.coutFournisseur && format.coutFournisseur > 0) {
              const oldPrice = format.price;
              format.price =
                Math.round(format.coutFournisseur * baseCoefficient * 100) /
                100;
              console.log(
                `[RESET] ${format.name}: ${oldPrice}€ → ${format.price}€ (${format.coutFournisseur}€ × ${baseCoefficient})`,
              );
              totalPricesReset++;
            } else {
              console.log(
                `[RESET] ⚠️ ${format.name}: PAS de coût fournisseur (prix actuel: ${format.price}€)`,
              );
              missingCosts++;
            }
          });
        });
      });
    });

    await TariffConfig.findByIdAndUpdate(
      config._id,
      {
        $set: {
          categories: updatedCategories,
          globalCoefficient: baseCoefficient,
        },
      },
      { new: true },
    );

    console.log(
      "[RESET] Réinitialisation terminée:",
      totalPricesReset,
      "prix réinitialisés",
    );
    console.log("[RESET] Formats sans coût fournisseur:", missingCosts);

    if (missingCosts > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de réinitialiser : ${missingCosts} formats n'ont pas de coût fournisseur enregistré. Vous devez réimporter les tarifs depuis le fichier JSON source.`,
        stats: {
          tarifsReset: 0,
          missingCosts: missingCosts,
        },
      });
    }

    res.json({
      success: true,
      message: `Tarifs réinitialisés au coefficient de base ${baseCoefficient}`,
      stats: {
        tarifsReset: totalPricesReset,
        baseCoefficient: baseCoefficient,
      },
    });
  } catch (error) {
    console.error("[RESET] Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation",
      error: error.message,
    });
  }
});

// -------------------------------------------------------------
// POST /api/tarifs/recalculate-global
// -------------------------------------------------------------
// Recalcule TOUS les tarifs et prix des œuvres avec un nouveau coefficient
// IMPORTANT: Cette route doit être AVANT les routes avec paramètres dynamiques (:id)
router.post("/recalculate-global", async (req, res) => {
  try {
    const { newCoefficient, baseCoefficient, ratio } = req.body;

    console.log("[RECALCUL] Début du recalcul global");
    console.log("[RECALCUL] Nouveau coefficient:", newCoefficient);
    console.log("[RECALCUL] Base coefficient:", baseCoefficient);
    console.log("[RECALCUL] Ratio:", ratio);

    if (!newCoefficient || !baseCoefficient || !ratio) {
      return res.status(400).json({
        success: false,
        message:
          "Paramètres manquants (newCoefficient, baseCoefficient, ratio)",
      });
    }

    if (ratio <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le ratio doit être supérieur à 0",
      });
    }

    let tarifsUpdated = 0;
    let photosUpdated = 0;
    let totalPricesChanged = 0;

    // 1. Recalculer les tarifs dans TariffConfig (structure hiérarchique V2)
    console.log("[RECALCUL] Recherche de la configuration TariffConfig...");
    const config = await TariffConfig.findOne().sort({ createdAt: -1 });
    console.log("[RECALCUL] Config trouvée:", config ? "OUI" : "NON");
    if (config) {
      console.log(
        "[RECALCUL] Nombre de catégories:",
        config.categories?.length || 0,
      );
    }

    if (config && config.categories) {
      console.log("[RECALCUL] Recalcul des tarifs hiérarchiques...");
      console.log(
        "[RECALCUL] Coefficient actuel en base:",
        config.globalCoefficient,
      );

      // Deep copy pour éviter les problèmes de référence
      const updatedCategories = JSON.parse(JSON.stringify(config.categories));

      updatedCategories.forEach((category) => {
        category.products.forEach((product) => {
          product.supports.forEach((support) => {
            // Mettre à jour le coefficient dans technicalSpecs
            if (support.technicalSpecs) {
              support.technicalSpecs.coefficientGlobal = newCoefficient;
            }

            // Recalculer tous les prix des formats DEPUIS le coût fournisseur
            support.formats.forEach((format) => {
              if (format.coutFournisseur && format.coutFournisseur > 0) {
                const oldPrice = format.price;
                // Recalcul depuis le coût fournisseur : prix = coût × nouveau coefficient
                format.price =
                  Math.round(format.coutFournisseur * newCoefficient * 100) /
                  100;
                console.log(
                  `[RECALCUL] ${format.name}: ${oldPrice}€ → ${format.price}€ (coût: ${format.coutFournisseur}€ × ${newCoefficient})`,
                );
                totalPricesChanged++;
              } else if (format.price && format.price > 0) {
                // Fallback : si pas de coût fournisseur, utiliser le ratio
                const oldPrice = format.price;
                format.price = Math.round(format.price * ratio * 100) / 100;
                console.log(
                  `[RECALCUL] ${format.name}: ${oldPrice}€ → ${format.price}€ (×${ratio})`,
                );
                totalPricesChanged++;
              } else {
                console.log(
                  `[RECALCUL] ⚠️ ${format.name}: IGNORÉ (pas de prix ni coût)`,
                );
              }
            });
          });
        });
      });

      console.log("[RECALCUL] Sauvegarde de la configuration...");

      // Mise à jour complète du document avec findByIdAndUpdate
      const updatedConfig = await TariffConfig.findByIdAndUpdate(
        config._id,
        {
          $set: {
            categories: updatedCategories,
            globalCoefficient: newCoefficient,
          },
        },
        { new: true },
      );

      tarifsUpdated = totalPricesChanged;
      console.log(
        "[RECALCUL] Configuration sauvegardée. Tarifs mis à jour:",
        tarifsUpdated,
      );
      console.log(
        "[RECALCUL] Nouveau coefficient global sauvegardé:",
        newCoefficient,
      );

      // Vérification post-sauvegarde
      const verif = await TariffConfig.findById(config._id).lean();
      console.log(
        "[RECALCUL] Vérification - Coefficient en base:",
        verif.globalCoefficient,
      );
      console.log(
        "[RECALCUL] Vérification - Premier format en base:",
        verif.categories[0]?.products[0]?.supports[0]?.formats[0]?.price,
      );
    }

    // 2. Recalculer les prix dans les Photos (œuvres)
    console.log("[RECALCUL] Recherche des photos avec tarifs...");
    const Photo = require("../models/Photo");
    const photos = await Photo.find({ "tarifs.0": { $exists: true } });
    console.log("[RECALCUL] Nombre de photos trouvées:", photos.length);

    for (const photo of photos) {
      let photoModified = false;

      photo.tarifs.forEach((tarif) => {
        if (tarif.prix && tarif.prix > 0) {
          const oldPrice = tarif.prix;
          tarif.prix = Math.round(tarif.prix * ratio * 100) / 100;
          console.log(
            `[RECALCUL] Photo ${photo._id} - Tarif: ${oldPrice}€ → ${tarif.prix}€`,
          );
          photoModified = true;
          totalPricesChanged++;
        }
      });

      if (photoModified) {
        await photo.save();
        photosUpdated++;
      }
    }

    console.log("[RECALCUL] Recalcul terminé avec succès");
    console.log("[RECALCUL] Stats finales:", {
      tarifsUpdated,
      photosUpdated,
      totalPricesChanged,
    });

    res.json({
      success: true,
      message: `Recalcul effectué : ${tarifsUpdated} tarifs et ${photosUpdated} œuvres mis à jour`,
      stats: {
        tarifsUpdated,
        photosUpdated,
        totalPricesChanged,
      },
    });
  } catch (error) {
    console.error("[RECALCUL] ERREUR:", error);
    console.error("[RECALCUL] Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Erreur lors du recalcul global",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// -------------------------------------------------------------
// POST /api/tarifs/config
// -------------------------------------------------------------
// Sauvegarde la configuration hiérarchique
router.post("/config", async (req, res) => {
  try {
    // Cherche le document existant et le met à jour, ou le crée s'il n'existe pas
    const config = await TarifConfig.findOneAndUpdate(
      {}, // Cherche n'importe quel document (il ne devrait y en avoir qu'un seul)
      { categories: req.body.categories }, // Met à jour les catégories
      {
        new: true, // Retourne le document mis à jour
        upsert: true, // Crée le document s'il n'existe pas
        runValidators: true, // Valide les données
      },
    );
    res.json(config);
  } catch (err) {
    console.error("Erreur sauvegarde config tarifs:", err);
    res
      .status(500)
      .json({ message: "Erreur sauvegarde config", error: err.message });
  }
});

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
    { new: true }, // Option pour renvoyer le tarif modifié
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
