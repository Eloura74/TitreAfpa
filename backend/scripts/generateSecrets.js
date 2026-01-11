// ============================================
// Script de génération de secrets sécurisés
// ============================================
// Utilisation : node scripts/generateSecrets.js

const crypto = require('crypto');

console.log('\n🔐 GÉNÉRATION DE SECRETS SÉCURISÉS\n');
console.log('━'.repeat(60));

// Génération JWT_SECRET (64 caractères)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 JWT_SECRET (à copier dans .env) :');
console.log(`JWT_SECRET=${jwtSecret}`);

// Génération SESSION_SECRET (64 caractères)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 SESSION_SECRET (optionnel, pour sessions) :');
console.log(`SESSION_SECRET=${sessionSecret}`);

// Génération d'un token de vérification exemple
const verificationToken = crypto.randomBytes(32).toString('hex');
console.log('\n📌 Exemple de VERIFICATION_TOKEN :');
console.log(verificationToken);

console.log('\n━'.repeat(60));
console.log('\n✅ Secrets générés avec succès !');
console.log('\n⚠️  IMPORTANT :');
console.log('1. Copiez ces valeurs dans votre fichier .env');
console.log('2. NE PARTAGEZ JAMAIS ces secrets publiquement');
console.log('3. Utilisez des secrets différents pour dev/staging/prod');
console.log('4. Régénérez ces secrets régulièrement (tous les 3-6 mois)\n');
