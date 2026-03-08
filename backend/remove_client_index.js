require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const AccesPrive = require('./models/AccesPrive');
  
  try {
    const indexes = await AccesPrive.collection.getIndexes();
    console.log('Index actuels sur AccesPrive:', Object.keys(indexes));
    
    if (indexes.client_1) {
      console.log('Suppression de l\\'index client_1...');
      await AccesPrive.collection.dropIndex('client_1');
      console.log('Index supprimé avec succès ! Le client peut maintenant avoir plusieurs accès privés.');
    } else {
      console.log('L\\'index client_1 n\\'existe pas.');
    }
  } catch (err) {
    console.error('Erreur lors de la manipulation des index :', err);
  } finally {
    mongoose.disconnect();
  }
}).catch(console.error);
