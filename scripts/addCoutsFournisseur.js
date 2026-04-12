console.log("🚀 Démarrage du script...");

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

console.log("📦 Modules chargés");

const TariffConfig = require("../backend/models/TariffConfig");

console.log("📋 Modèle TariffConfig chargé");

// Ce script n'est plus nécessaire - l'utilisateur gère les tarifs manuellement via MongoDB Atlas
// Pour l'utiliser, définir MONGODB_URI dans les variables d'environnement

async function addCoutsFournisseur() {
  console.log("\n📍 Fonction addCoutsFournisseur appelée");
  console.log(
    "❌ Ce script est désactivé - gérer les tarifs via MongoDB Atlas",
  );
  return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    // Lire le fichier JSON source pour récupérer les coûts fournisseur
    const jsonPath = path.join(
      __dirname,
      "../CATALOGUE_COMPLET_TIRAGES_ET_FINITIONS.json",
    );
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(rawData);

    console.log("\n📂 Fichier JSON chargé");

    // Parser les coûts fournisseur depuis le JSON
    const coutsFournisseur = {};
    let currentGamme = null;

    for (const item of data["CATALOGUE COMPLET"]) {
      if (
        item["Paramètres"] &&
        item["Paramètres"] !== "Taux URSSAF" &&
        item["Paramètres"] !== "Coefficient global" &&
        item["Paramètres"] !== "Gamme / Finition"
      ) {
        currentGamme = item["Paramètres"];
        coutsFournisseur[currentGamme] = {};
      }

      if (
        item["Unnamed: 1"] &&
        typeof item["Unnamed: 1"] === "string" &&
        item["Unnamed: 1"].includes("×")
      ) {
        const format = item["Unnamed: 1"];
        const coutFournisseur = parseFloat(item["Unnamed: 2"]) || 0;

        if (currentGamme && coutFournisseur > 0) {
          coutsFournisseur[currentGamme][format] = coutFournisseur;
        }
      }
    }

    console.log(
      `\n📊 Coûts fournisseur extraits pour ${Object.keys(coutsFournisseur).length} gammes`,
    );

    // Récupérer la config actuelle
    const config = await TariffConfig.findOne().sort({ createdAt: -1 });

    if (!config) {
      console.log("❌ Aucune configuration trouvée");
      process.exit(1);
    }

    console.log("\n🔄 Ajout des coûts fournisseur aux tarifs existants...");

    let updated = 0;
    let notFound = 0;

    // Parcourir les catégories et ajouter les coûts fournisseur
    for (const category of config.categories) {
      for (const product of category.products) {
        for (const support of product.supports) {
          const gamme = support.name;

          for (const format of support.formats) {
            const formatName = format.name;

            // Chercher le coût fournisseur correspondant
            if (
              coutsFournisseur[gamme] &&
              coutsFournisseur[gamme][formatName]
            ) {
              const cout = coutsFournisseur[gamme][formatName];
              format.coutFournisseur = cout;

              // Calculer la marge nette
              const coefficient = 1.75;
              const prixCalcule = cout * coefficient;
              format.margeNette = Math.round((format.price - cout) * 100) / 100;

              console.log(
                `✓ ${gamme} ${formatName}: prix=${format.price}€, coût=${cout}€, marge=${format.margeNette}€`,
              );
              updated++;
            } else {
              console.log(
                `⚠️ ${gamme} ${formatName}: coût fournisseur non trouvé`,
              );
              notFound++;
            }
          }
        }
      }
    }

    // Sauvegarder
    await config.save();

    console.log(`\n✅ Mise à jour terminée !`);
    console.log(`   - ${updated} formats enrichis avec coûts fournisseur`);
    console.log(`   - ${notFound} formats sans coût fournisseur`);

    // Vérifier
    const verif = await TariffConfig.findOne();
    const premierFormat =
      verif.categories[0]?.products[0]?.supports[0]?.formats[0];
    console.log(`\n📊 Vérification - Premier format:`);
    console.log(
      `   - ${premierFormat.name}: ${premierFormat.price}€ (coût: ${premierFormat.coutFournisseur}€)`,
    );

    await mongoose.disconnect();
    console.log("\n✅ Déconnecté de MongoDB");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

addCoutsFournisseur();
