const mongoose = require('mongoose');
require('dotenv').config({ path: 'a:/Dev/ProjetStage/backend/.env' });
const Panier = require('./models/Panier');
const User = require('./models/User');
const Photo = require('./models/Photo');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Find the user by email (from screenshot)
    const email = "faber.quentin13@gmail.com"; // Inferred from screenshot
    const user = await User.findOne({ email: new RegExp(email, 'i') });

    if (!user) {
      console.log(`User not found for email: ${email}`);
      // List all users to help identify
      const users = await User.find({}, 'email');
      console.log('Available users:', users.map(u => u.email));
      process.exit(0);
    }
    console.log(`Found User: ${user.email} (${user._id})`);

    const panier = await Panier.findOne({ utilisateur: user._id }).populate('articles.photo');
    
    if (!panier) {
      console.log('No cart found for this user.');
    } else {
      console.log('------------------------------------------------');
      console.log(`Panier ID: ${panier._id}`);
      console.log(`Articles Count: ${panier.articles.length}`);
      console.log('Articles Details:');
      panier.articles.forEach((a, i) => {
        console.log(`[${i}] Photo: ${a.photo ? a.photo.titre : 'MISSING'} (ID: ${a.photo ? a.photo._id : a.photo})`);
        console.log(`    Qty: ${a.quantite}`);
        console.log(`    Format: ${a.format}`);
        console.log(`    Support: ${a.support}`);
        console.log(`    Prix: ${a.prixUnitaire}`);
      });
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
