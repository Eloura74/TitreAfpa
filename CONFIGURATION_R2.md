# 📦 Configuration Cloudflare R2 pour l'Écrin Privé

Ce document explique comment configurer Cloudflare R2 pour stocker et servir les photos originales haute résolution (15 GB) de manière sécurisée et économique.

---

## 🎯 Pourquoi Cloudflare R2 ?

- ✅ **Egress gratuit** : Pas de facturation sur les téléchargements (contrairement à AWS S3)
- ✅ **Coût ultra-faible** : ~1€/an pour 15 GB
- ✅ **URL signées natives** : Sécurité maximale
- ✅ **Compatible S3** : SDK standard, facile à intégrer
- ✅ **CDN mondial** : Téléchargements rapides partout

---

## 📋 Étapes de configuration

### 1️⃣ Créer un compte Cloudflare

1. Aller sur [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Créer un compte gratuit
3. Vérifier l'email

### 2️⃣ Activer R2

1. Dans le dashboard Cloudflare, aller dans **R2** (menu de gauche)
2. Cliquer sur **"Purchase R2"** (gratuit jusqu'à 10 GB)
3. Accepter les conditions

### 3️⃣ Créer un bucket privé

1. Cliquer sur **"Create bucket"**
2. Nom du bucket : `ecrin-prive-photos-originales` (ou autre nom unique)
3. **Important** : Laisser le bucket **PRIVÉ** (pas d'accès public)
4. Région : **Automatic** (Cloudflare choisit automatiquement)
5. Cliquer sur **"Create bucket"**

### 4️⃣ Générer les clés API R2

1. Dans R2, aller dans **"Manage R2 API Tokens"**
2. Cliquer sur **"Create API Token"**
3. Configuration :
   - **Token name** : `ecrin-prive-api-token`
   - **Permissions** : 
     - ✅ Object Read
     - ✅ Object Write
   - **TTL** : Never expire (ou durée souhaitée)
   - **Bucket** : Sélectionner `ecrin-prive-photos-originales`
4. Cliquer sur **"Create API Token"**
5. **IMPORTANT** : Copier et sauvegarder immédiatement :
   - `Access Key ID`
   - `Secret Access Key`
   - `Account ID` (visible dans l'URL du dashboard)

⚠️ **Ces clés ne seront plus jamais affichées !**

### 5️⃣ Ajouter les variables d'environnement

#### **Backend (Vercel)**

1. Aller sur [https://vercel.com](https://vercel.com)
2. Sélectionner le projet backend
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter les variables suivantes :

```env
R2_ACCOUNT_ID=votre_account_id_cloudflare
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_BUCKET_NAME=ecrin-prive-photos-originales
```

5. Sélectionner **Production**, **Preview**, et **Development**
6. Cliquer sur **"Save"**

#### **Local (.env)**

Créer/modifier le fichier `.env` à la racine du backend :

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=votre_account_id_cloudflare
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_BUCKET_NAME=ecrin-prive-photos-originales
```

⚠️ **Ne jamais commit le fichier `.env` !** (déjà dans `.gitignore`)

### 6️⃣ Installer les dépendances AWS SDK

Le backend utilise le SDK AWS S3 (compatible R2) :

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 🧪 Tester la configuration

### Test 1 : Vérifier les variables d'environnement

Créer un fichier `backend/test-r2-config.js` :

```javascript
require('dotenv').config();

console.log('Configuration R2:');
console.log('Account ID:', process.env.R2_ACCOUNT_ID ? '✅ Défini' : '❌ Manquant');
console.log('Access Key:', process.env.R2_ACCESS_KEY_ID ? '✅ Défini' : '❌ Manquant');
console.log('Secret Key:', process.env.R2_SECRET_ACCESS_KEY ? '✅ Défini' : '❌ Manquant');
console.log('Bucket Name:', process.env.R2_BUCKET_NAME || '❌ Manquant');
```

Exécuter :
```bash
node test-r2-config.js
```

### Test 2 : Upload de test

Utiliser le script `uploadToR2.js` (voir section suivante)

---

## 📤 Upload des 15 GB de photos

Utiliser le script `backend/scripts/uploadToR2.js` :

```bash
cd backend
node scripts/uploadToR2.js /chemin/vers/dossier/photos SHOOTING-2024-ABC123
```

Le script :
- ✅ Upload toutes les photos du dossier vers R2
- ✅ Crée/met à jour l'accès privé dans MongoDB
- ✅ Affiche la progression en temps réel
- ✅ Gère les erreurs et retry automatique

---

## 🔐 Sécurité

### ✅ Ce qui est sécurisé :

- Bucket **privé** (pas d'accès public)
- URL signées **expirantes** (5 minutes)
- Authentification **par code unique**
- Limites de **téléchargements configurables**
- Logs de **tous les téléchargements**

### ❌ À ne JAMAIS faire :

- ❌ Rendre le bucket public
- ❌ Commit les clés API dans Git
- ❌ Partager les clés API
- ❌ Désactiver l'expiration des URL signées

---

## 💰 Coûts estimés (15 GB)

### Stockage
- 10 GB gratuits
- 5 GB × 0.015$/GB = **0.075$/mois**

### Bande passante (Egress)
- **GRATUIT** (illimité)

### Requêtes API
- 1M requêtes gratuites/mois
- Largement suffisant

### **Total : ~1€/an** 🎉

---

## 🆘 Dépannage

### Erreur : "Access Denied"
- Vérifier que les clés API sont correctes
- Vérifier que le token a les permissions Object Read/Write
- Vérifier que le bucket name est correct

### Erreur : "Bucket not found"
- Vérifier que `R2_BUCKET_NAME` correspond exactement au nom du bucket
- Vérifier que le bucket existe dans le bon compte Cloudflare

### Erreur : "Invalid credentials"
- Régénérer les clés API
- Vérifier qu'il n'y a pas d'espaces dans les variables d'environnement
- Redémarrer le serveur backend après modification du `.env`

### Upload très lent
- Normal pour 15 GB (peut prendre plusieurs heures)
- Le script affiche la progression
- Peut être interrompu et repris (détection automatique des fichiers déjà uploadés)

---

## 📊 Monitoring

### Dashboard Cloudflare R2

1. Aller dans **R2** → **Metrics**
2. Voir :
   - Stockage utilisé
   - Nombre de requêtes
   - Bande passante (egress)

### Logs MongoDB

Tous les téléchargements sont loggés dans MongoDB :
- Qui a téléchargé
- Quelle photo
- Quand
- Combien de fois

---

## 🔄 Migration future

Si besoin de migrer vers un autre provider :

1. **Backblaze B2** : Compatible S3, changer uniquement l'endpoint
2. **AWS S3** : Changer l'endpoint et ajouter la région
3. **Autre** : Adapter le client S3

Le code est **100% portable** grâce au SDK AWS standard.

---

## ✅ Checklist finale

Avant de mettre en production :

- [ ] Bucket R2 créé et privé
- [ ] Clés API générées et sauvegardées
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Dépendances installées (`@aws-sdk/client-s3`)
- [ ] Test de connexion réussi
- [ ] Photos uploadées vers R2
- [ ] Accès privé créé dans MongoDB avec code unique
- [ ] Test de téléchargement depuis `/ecrin-prive` réussi
- [ ] Vérification des limites de téléchargement

---

## 📞 Support

En cas de problème :
1. Vérifier cette documentation
2. Consulter les logs Vercel
3. Vérifier le dashboard Cloudflare R2
4. Contacter le support Cloudflare (très réactif)

---

**Configuration terminée ! L'écrin privé est prêt à l'emploi. 🎉**
