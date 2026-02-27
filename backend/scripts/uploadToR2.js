require('dotenv').config();
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AccesPrive = require('../models/AccesPrive');

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.raw', '.cr2', '.nef', '.arw', '.dng', '.tiff', '.tif'];

async function checkFileExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

async function uploadFile(filePath, key) {
  const fileStream = fs.createReadStream(filePath);
  const stats = fs.statSync(filePath);
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: getContentType(filePath),
  });

  await s3Client.send(command);
  return stats.size;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.raw': 'image/x-raw',
    '.cr2': 'image/x-canon-cr2',
    '.nef': 'image/x-nikon-nef',
    '.arw': 'image/x-sony-arw',
    '.dng': 'image/x-adobe-dng',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node uploadToR2.js <dossier_photos> <code_acces>');
    console.error('Exemple: node uploadToR2.js /chemin/vers/photos SHOOTING-2024-ABC123');
    process.exit(1);
  }

  const photosDir = args[0];
  const codeAcces = args[1].toUpperCase().trim();

  if (!fs.existsSync(photosDir)) {
    console.error(`❌ Dossier introuvable: ${photosDir}`);
    process.exit(1);
  }

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    console.error('❌ Variables d\'environnement R2 manquantes !');
    console.error('Vérifiez que R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY et R2_BUCKET_NAME sont définis.');
    process.exit(1);
  }

  console.log('🚀 Démarrage de l\'upload vers Cloudflare R2...\n');
  console.log(`📁 Dossier source: ${photosDir}`);
  console.log(`🔑 Code d'accès: ${codeAcces}`);
  console.log(`☁️  Bucket R2: ${process.env.R2_BUCKET_NAME}\n`);

  console.log('📊 Analyse du dossier...');
  const allFiles = getAllFiles(photosDir);
  
  if (allFiles.length === 0) {
    console.error('❌ Aucune photo trouvée dans ce dossier !');
    process.exit(1);
  }

  const totalSize = allFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  console.log(`✅ ${allFiles.length} photos trouvées (${formatBytes(totalSize)})\n`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  let acces = await AccesPrive.findOne({ codeAcces });
  
  if (!acces) {
    console.error(`❌ Aucun accès privé trouvé avec le code: ${codeAcces}`);
    console.error('Créez d\'abord l\'accès privé depuis l\'interface admin.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`✅ Accès privé trouvé: ${acces.titre}\n`);
  console.log('📤 Début de l\'upload...\n');

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let totalUploaded = 0;

  const photosOriginales = [];

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const fileName = path.basename(filePath);
    const relativePath = path.relative(photosDir, filePath);
    const r2Key = `${codeAcces}/${relativePath.replace(/\\/g, '/')}`;
    
    const stats = fs.statSync(filePath);
    const progress = ((i + 1) / allFiles.length * 100).toFixed(1);

    try {
      const exists = await checkFileExists(r2Key);
      
      if (exists) {
        console.log(`⏭️  [${progress}%] Déjà uploadé: ${fileName}`);
        skipped++;
      } else {
        const size = await uploadFile(filePath, r2Key);
        totalUploaded += size;
        uploaded++;
        console.log(`✅ [${progress}%] Uploadé: ${fileName} (${formatBytes(size)})`);
      }

      photosOriginales.push({
        nom: fileName,
        fichierR2: r2Key,
        taille: stats.size,
        format: path.extname(fileName).substring(1).toUpperCase(),
        dateUpload: new Date(),
        nbTelechargements: 0,
      });

    } catch (error) {
      console.error(`❌ [${progress}%] Erreur: ${fileName} - ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Mise à jour de MongoDB...');
  acces.photosOriginales = photosOriginales;
  await acces.save();

  await mongoose.disconnect();

  console.log('\n' + '='.repeat(60));
  console.log('✅ UPLOAD TERMINÉ !');
  console.log('='.repeat(60));
  console.log(`📤 Uploadés: ${uploaded} fichiers (${formatBytes(totalUploaded)})`);
  console.log(`⏭️  Ignorés (déjà présents): ${skipped} fichiers`);
  console.log(`❌ Échecs: ${failed} fichiers`);
  console.log(`📁 Total dans MongoDB: ${photosOriginales.length} photos`);
  console.log('='.repeat(60));
  console.log(`\n🔗 Les clients peuvent accéder à leurs photos sur:`);
  console.log(`   https://votre-domaine.com/ecrin-prive`);
  console.log(`   Code d'accès: ${codeAcces}\n`);
}

main().catch((error) => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
