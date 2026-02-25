const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Mapping des gammes du catalogue vers la structure Picto
const catalogueVersPicto = {
  "Petits formats": {
    category: "Tirage Photo",
    product: "Argentique sur Lambda",
    support: "RC Couleur Satiné Fuji 230g"
  },
  "Lambda": {
    category: "Tirage Photo",
    product: "Argentique sur Lambda",
    support: "RC Couleur Satiné Fuji 230g"
  },
  "Pigmentaire": {
    category: "Tirage Photo",
    product: "Jet d'encre Pigmentaire",
    support: "Hahnemühle Photo Rag 308g"
  },
  "Dibond": {
    category: "Photo Contrecollée",
    product: "Contrecollage sur Dibond",
    support: "Dibond 3mm"
  },
  "Plexi": {
    category: "Photo sous Plexi",
    product: "Tirage Plexicollé",
    support: "Plexi Brillant 4mm"
  },
  "Caisse Américaine": {
    category: "Photo Encadrée",
    product: "Caisse Américaine",
    support: "Bois Noir Satiné"
  },
  "Encadrement d'Art": {
    category: "Photo Encadrée",
    product: "Cadre Nielsen Alpha",
    support: "Alu Noir Mat"
  },
  "Nielsen Sur Mesure": {
    category: "Photo Encadrée",
    product: "Cadre Nielsen Alpha",
    support: "Alu Noir Mat"
  }
};

function convertirCatalogueVersPicto() {
  // Lire le catalogue JSON
  const cataloguePath = path.join(__dirname, '../../photographie/src/data/catalogue-tarifs.json');
  const catalogueData = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));

  // Structure Picto de base
  const pictoConfig = {
    categories: []
  };

  // Grouper par catégorie Picto
  const categoriesMap = new Map();

  catalogueData.forEach(tarif => {
    const mapping = catalogueVersPicto[tarif.gamme];
    if (!mapping) {
      console.warn(`⚠️  Gamme non mappée: ${tarif.gamme}`);
      return;
    }

    const { category, product, support } = mapping;

    // Créer ou récupérer la catégorie
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, {
        id: uuidv4(),
        name: category,
        products: []
      });
    }
    const cat = categoriesMap.get(category);

    // Créer ou récupérer le produit
    let prod = cat.products.find(p => p.name === product);
    if (!prod) {
      prod = {
        id: uuidv4(),
        name: product,
        description: `Tirage ${tarif.gamme}`,
        supports: []
      };
      cat.products.push(prod);
    }

    // Créer ou récupérer le support
    let supp = prod.supports.find(s => s.name === support);
    if (!supp) {
      supp = {
        id: uuidv4(),
        name: support,
        description: `Support pour ${tarif.gamme}`,
        technicalSpecs: {
          gamme: tarif.gamme,
          coefficient: tarif.coefficient.toString()
        },
        formats: []
      };
      prod.supports.push(supp);
    }

    // Ajouter le format avec le prix
    supp.formats.push({
      id: uuidv4(),
      name: tarif.format,
      width: parseInt(tarif.format.split('×')[0]) || 0,
      height: parseInt(tarif.format.split('×')[1]) || 0,
      price: tarif.prixSite,
      coutFournisseur: tarif.coutFournisseurTTC,
      margeNette: tarif.margeNette
    });
  });

  // Convertir la Map en Array
  pictoConfig.categories = Array.from(categoriesMap.values());

  // Sauvegarder le résultat
  const outputPath = path.join(__dirname, '../../photographie/src/data/catalogue-picto-format.json');
  fs.writeFileSync(outputPath, JSON.stringify(pictoConfig, null, 2), 'utf8');

  console.log('✅ Conversion terminée!');
  console.log(`📁 Fichier généré: ${outputPath}`);
  console.log(`📊 ${pictoConfig.categories.length} catégories créées`);
  
  // Afficher un résumé
  pictoConfig.categories.forEach(cat => {
    console.log(`\n📦 ${cat.name}`);
    cat.products.forEach(prod => {
      console.log(`  └─ ${prod.name}`);
      prod.supports.forEach(supp => {
        console.log(`     └─ ${supp.name} (${supp.formats.length} formats)`);
      });
    });
  });

  return pictoConfig;
}

// Lancer la conversion
try {
  convertirCatalogueVersPicto();
} catch (error) {
  console.error('❌ Erreur lors de la conversion:', error);
  process.exit(1);
}
