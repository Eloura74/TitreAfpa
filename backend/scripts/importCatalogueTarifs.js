const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photographie';

// Schéma pour les tarifs du catalogue
const catalogueTarifSchema = new mongoose.Schema({
  gamme: { type: String, required: true },
  format: { type: String, required: true },
  coutFournisseurTTC: { type: Number, required: true },
  coefficient: { type: Number, required: true },
  prixSite: { type: Number, required: true },
  netApresURSSAF: { type: Number, required: true },
  margeNette: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CatalogueTarif = mongoose.model('CatalogueTarif', catalogueTarifSchema);

async function importCatalogue() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Lire le fichier JSON
    const jsonPath = path.join(__dirname, '../../photographie/src/data/catalogue-tarifs.json');
    console.log(`📖 Lecture du fichier: ${jsonPath}`);
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const tarifs = JSON.parse(rawData);
    
    console.log(`📊 ${tarifs.length} tarifs trouvés dans le catalogue`);

    // Supprimer les anciennes données (optionnel)
    console.log('🗑️  Suppression des anciennes données...');
    await CatalogueTarif.deleteMany({});
    
    // Insérer les nouvelles données
    console.log('💾 Insertion des nouveaux tarifs...');
    const result = await CatalogueTarif.insertMany(tarifs);
    
    console.log(`✅ ${result.length} tarifs importés avec succès!`);
    
    // Afficher un résumé par gamme
    const gammes = await CatalogueTarif.aggregate([
      {
        $group: {
          _id: '$gamme',
          count: { $sum: 1 },
          prixMin: { $min: '$prixSite' },
          prixMax: { $max: '$prixSite' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📋 Résumé par gamme:');
    gammes.forEach(g => {
      console.log(`  - ${g._id}: ${g.count} formats (${g.prixMin.toFixed(2)}€ - ${g.prixMax.toFixed(2)}€)`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Import terminé avec succès!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Lancer l'import
importCatalogue();
