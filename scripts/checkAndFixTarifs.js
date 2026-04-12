const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const TariffConfig = require('../backend/models/TariffConfig');

async function checkAndFixTarifs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const config = await TariffConfig.findOne().sort({ createdAt: -1 });
    
    if (!config) {
      console.log('❌ Aucune configuration trouvée');
      process.exit(1);
    }

    console.log('\n📊 État actuel de la base :');
    console.log('- Coefficient global:', config.globalCoefficient);
    console.log('- Nombre de catégories:', config.categories.length);
    
    // Afficher les 5 premiers formats
    console.log('\n📋 Premiers formats :');
    let count = 0;
    for (const cat of config.categories) {
      for (const prod of cat.products) {
        for (const sup of prod.supports) {
          for (const fmt of sup.formats) {
            console.log(`  ${fmt.name}: ${fmt.price}€ (coût: ${fmt.coutFournisseur || 'N/A'}€)`);
            count++;
            if (count >= 5) break;
          }
          if (count >= 5) break;
        }
        if (count >= 5) break;
      }
      if (count >= 5) break;
    }

    // Vérifier si les coûts fournisseur existent
    let totalFormats = 0;
    let formatsWithCost = 0;
    
    for (const cat of config.categories) {
      for (const prod of cat.products) {
        for (const sup of prod.supports) {
          for (const fmt of sup.formats) {
            totalFormats++;
            if (fmt.coutFournisseur && fmt.coutFournisseur > 0) {
              formatsWithCost++;
            }
          }
        }
      }
    }

    console.log(`\n📈 Statistiques :`);
    console.log(`- Total formats: ${totalFormats}`);
    console.log(`- Formats avec coût fournisseur: ${formatsWithCost}`);
    console.log(`- Formats sans coût: ${totalFormats - formatsWithCost}`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkAndFixTarifs();
