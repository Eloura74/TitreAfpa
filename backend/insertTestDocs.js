// Script pour insérer un document test dans chaque collection manquante
// Permet de faire apparaître les collections dans Mongo Express

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Connexion à la base MongoDB via la même URI que le backend
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Importation des modèles
const Evenement = require('./models/Evenement');
const Panier = require('./models/Panier');
const Paiement = require('./models/Paiement');

async function insererDocumentsTests() {
  try {
    // Insertion d'un document test dans la collection Evenement
    await Evenement.create({
      titre: "Titre test",
      description: "Description test",
      date: new Date() // Ajout du champ requis 'date'
    });

    // Insertion d'un document test dans la collection Panier
    await Panier.create({
      utilisateur: "Utilisateur test",
      articles: []
    });

    // Insertion d'un document test dans la collection Paiement
    await Paiement.create({
      montant: 10,
      statut: "en attente"
    });

    console.log("Documents insérés avec succès dans chaque collection !");
    mongoose.connection.close();
  } catch (erreur) {
    console.error("Erreur lors de l'insertion :", erreur);
    mongoose.connection.close();
  }
}

insererDocumentsTests();
