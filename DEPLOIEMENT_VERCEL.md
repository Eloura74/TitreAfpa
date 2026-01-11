# 🚀 GUIDE DE DÉPLOIEMENT VERCEL - ÉTAPE PAR ÉTAPE

**Date** : 2026-01-11  
**Projet** : FABER - Portfolio Photographie & Graphisme  
**Stack** : React (Vite) + Node.js (Express) + MongoDB Atlas

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Déploiement Backend](#déploiement-backend)
3. [Déploiement Frontend](#déploiement-frontend)
4. [Configuration des Variables d'Environnement](#configuration-des-variables-denvironnement)
5. [Tests Post-Déploiement](#tests-post-déploiement)
6. [Dépannage](#dépannage)

---

## 🎯 PRÉREQUIS

### 1. Compte Vercel
- [ ] Créer un compte sur [vercel.com](https://vercel.com)
- [ ] Connecter votre compte GitHub
- [ ] Installer Vercel CLI (optionnel) : `npm i -g vercel`

### 2. Secrets à Préparer
Avoir tous vos secrets prêts (voir `SECURITE_URGENTE.md`) :
- [ ] `JWT_SECRET` (nouveau, sécurisé)
- [ ] `MONGO_URI` (MongoDB Atlas)
- [ ] `STRIPE_SECRET_KEY` (nouvelle clé)
- [ ] `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET` (nouvelles)
- [ ] `CLOUDINARY_*` (nouvelles clés)
- [ ] `EMAIL_USER` et `EMAIL_PASS` (nouveau mot de passe app)

### 3. Dépôt Git
- [ ] Code poussé sur GitHub
- [ ] Branche `main` à jour
- [ ] Fichiers `.env` **NON** committés (vérifier avec `git status`)

---

## 🖥️ DÉPLOIEMENT BACKEND

### Étape 1 : Créer le Projet Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Cliquer sur **"Import Git Repository"**
3. Sélectionner votre dépôt GitHub
4. Configurer :

   ```
   Project Name: faber-backend
   Framework Preset: Other
   Root Directory: ./backend
   Build Command: (laisser vide)
   Output Directory: (laisser vide)
   Install Command: npm install
   ```

5. Cliquer sur **"Deploy"** (va échouer, c'est normal)

### Étape 2 : Configurer les Variables d'Environnement

Dans **Settings → Environment Variables**, ajouter :

```bash
# Variables générales
NODE_ENV=production
PORT=5000

# MongoDB (IMPORTANT : URL complète avec credentials)
MONGO_URI=mongodb+srv://VOTRE_USER:VOTRE_NOUVEAU_MDP@cluster0.xxxxx.mongodb.net/votre_db?retryWrites=true&w=majority

# JWT (Secret NOUVEAU généré)
JWT_SECRET=votre_nouveau_secret_64_caracteres_minimum
JWT_EXPIRE=2h

# Cloudinary (NOUVELLES clés)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_nouveau_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Stripe (NOUVELLE clé)
STRIPE_SECRET_KEY=sk_live_VOTRE_NOUVELLE_CLE

# PayPal (NOUVELLES clés)
PAYPAL_CLIENT_ID=votre_nouveau_client_id
PAYPAL_CLIENT_SECRET=votre_nouveau_client_secret
PAYPAL_MODE=live

# Email
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=votre_nouveau_mot_de_passe_app
EMAIL_FROM=noreply@votresite.com
EMAIL_FROM_NAME=Fabien Licata Photographie

# Frontend URL (mettre l'URL du frontend Vercel une fois déployé)
FRONTEND_URL=https://votre-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

⚠️ **IMPORTANT** : 
- Sélectionner **Production, Preview, Development** pour chaque variable
- Vérifier qu'il n'y a **aucun espace** avant/après les valeurs
- Encoder les caractères spéciaux dans `MONGO_URI` si nécessaire

### Étape 3 : Vérifier le Fichier vercel.json

Le fichier `backend/vercel.json` doit contenir :

```json
{
  "version": 2,
  "name": "faber-backend",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["cdg1"],
  "functions": {
    "server.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Étape 4 : Redéployer

1. Aller dans **Deployments**
2. Cliquer sur le dernier déploiement
3. Cliquer sur **"Redeploy"**
4. Attendre que le statut devienne **"Ready"** ✅

### Étape 5 : Tester le Backend

```bash
# Test de base
curl https://votre-backend.vercel.app/

# Test API
curl https://votre-backend.vercel.app/api/cors-test

# Test MongoDB (doit retourner une liste)
curl https://votre-backend.vercel.app/api/galerie
```

Si vous voyez des erreurs, aller dans **Deployments → Logs** pour diagnostiquer.

---

## 🎨 DÉPLOIEMENT FRONTEND

### Étape 1 : Créer le Projet Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. **"Import Git Repository"**
3. Sélectionner le **même dépôt**
4. Configurer :

   ```
   Project Name: faber-frontend
   Framework Preset: Vite
   Root Directory: ./photographie
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install --legacy-peer-deps
   ```

### Étape 2 : Variables d'Environnement Frontend

Dans **Settings → Environment Variables** :

```bash
# URL du backend (mettre l'URL du backend déployé à l'étape précédente)
VITE_API_URL=https://votre-backend.vercel.app

# PayPal Client ID (clé PUBLIQUE uniquement)
VITE_PAYPAL_CLIENT_ID=votre_nouveau_paypal_client_id
```

⚠️ **ATTENTION** :
- Ne **JAMAIS** mettre de secrets côté frontend (pas de `SECRET`, `API_SECRET`, etc.)
- Seules les variables préfixées `VITE_` sont accessibles côté client

### Étape 3 : Vérifier le fichier vercel.json

Vérifier que `vercel.json` à la racine du projet contient :

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/((?!api/|.*\\..*).*)", "destination": "/index.html" }
  ]
}
```

### Étape 4 : Déployer

1. Cliquer sur **"Deploy"**
2. Attendre le build (~2-3 minutes)
3. Statut **"Ready"** ✅

### Étape 5 : Mettre à Jour FRONTEND_URL dans Backend

1. Copier l'URL du frontend : `https://votre-frontend.vercel.app`
2. Retourner dans le projet **backend**
3. **Settings → Environment Variables**
4. Modifier `FRONTEND_URL` avec la vraie URL
5. **Redéployer le backend**

---

## 🔐 CONFIGURATION DES VARIABLES D'ENVIRONNEMENT

### MongoDB Atlas - Autoriser Vercel

1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. **Network Access → IP Access List**
3. Cliquer sur **"Add IP Address"**
4. Sélectionner **"Allow Access from Anywhere"** : `0.0.0.0/0`
5. Ou ajouter les IPs Vercel : [Liste IPs Vercel](https://vercel.com/docs/concepts/edge-network/regions)

⚠️ **Important** : Avec `0.0.0.0/0`, votre sécurité repose sur le mot de passe MongoDB fort.

### CORS - Autoriser le Frontend

Le backend autorise déjà automatiquement tous les sous-domaines `*.vercel.app` grâce à cette logique dans `server.js` :

```javascript
if (origin && origin.startsWith("https://") && origin.endsWith(".vercel.app")) {
  return callback(null, true);
}
```

Si besoin, ajouter votre domaine custom dans `allowedOrigins` :

```javascript
const allowedOrigins = [
  "https://titre-afpa.vercel.app",
  "https://votre-domaine.com", // Domaine custom
  "http://localhost:5173",
];
```

---

## ✅ TESTS POST-DÉPLOIEMENT

### Checklist de Vérification

- [ ] **Homepage** : `https://votre-frontend.vercel.app/` s'affiche correctement
- [ ] **Galerie** : Les photos chargent depuis l'API
- [ ] **Authentification** : Connexion/inscription fonctionne
- [ ] **Panier** : Ajout au panier fonctionne
- [ ] **Paiement** : PayPal/Stripe en mode production
- [ ] **Images** : Cloudinary sert les images
- [ ] **SEO** : `robots.txt` et `sitemap.xml` accessibles
- [ ] **Console** : Aucune erreur dans la console navigateur
- [ ] **Network** : Toutes les requêtes API réussissent (status 200)

### Tests Automatisés

```bash
# Lighthouse (SEO, Performance, Accessibilité)
npm install -g lighthouse
lighthouse https://votre-frontend.vercel.app/ --view

# Test API endpoints
curl https://votre-backend.vercel.app/api/galerie
curl https://votre-backend.vercel.app/api/services
curl https://votre-backend.vercel.app/api/tarifs
```

### Métriques Cibles

| Métrique | Cible | Vérification |
|----------|-------|--------------|
| Lighthouse Performance | > 90 | `lighthouse --only-categories=performance` |
| Lighthouse SEO | > 95 | `lighthouse --only-categories=seo` |
| Time to First Byte | < 800ms | Chrome DevTools Network |
| First Contentful Paint | < 1.5s | Chrome DevTools Performance |
| Largest Contentful Paint | < 2.5s | Chrome DevTools Performance |

---

## 🐛 DÉPANNAGE

### Erreur : "Internal Server Error"

**Symptôme** : 500 dans les logs Vercel

**Causes possibles** :
1. MongoDB non connectée
2. Variable d'environnement manquante
3. `MONGO_URI` invalide

**Solution** :
```bash
# Vérifier les logs Vercel
vercel logs votre-projet --follow

# Tester MongoDB localement
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB OK'))
  .catch(err => console.error('❌', err));
"
```

### Erreur : CORS Policy

**Symptôme** : `Access-Control-Allow-Origin` error dans la console

**Solution** :
1. Vérifier que `FRONTEND_URL` dans le backend = URL réelle du frontend
2. Vérifier les logs backend pour voir l'origine bloquée
3. Ajouter l'origine dans `allowedOrigins` si nécessaire

### Erreur : "Module not found"

**Symptôme** : Build échoue avec `Cannot find module`

**Solution** :
```bash
# Vérifier package.json
cd backend && npm install
cd photographie && npm install --legacy-peer-deps

# Rebuild
vercel --prod
```

### Erreur : Images ne chargent pas

**Symptôme** : Images cassées, 404 sur Cloudinary

**Solution** :
1. Vérifier `CLOUDINARY_*` variables
2. Tester upload manuel sur Cloudinary
3. Vérifier que les URLs stockées en DB sont correctes

### Problème : Build trop lent (> 5 min)

**Solution** :
```json
// vite.config.ts - Optimiser le build
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['framer-motion', 'lucide-react']
        }
      }
    }
  }
});
```

---

## 📊 MONITORING POST-DÉPLOIEMENT

### Vercel Analytics (Gratuit)

1. Aller dans **Analytics** sur Vercel
2. Activer **Web Analytics**
3. Voir les métriques en temps réel

### Google Search Console

1. Aller sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajouter votre propriété : `https://votre-frontend.vercel.app`
3. Soumettre le sitemap : `https://votre-frontend.vercel.app/sitemap.xml`

### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs backend uniquement
vercel logs faber-backend --follow

# Logs frontend uniquement
vercel logs faber-frontend --follow
```

---

## 🔄 REDÉPLOIEMENT

### Automatique (Recommandé)

Chaque fois que vous poussez sur `main`, Vercel redéploie automatiquement.

```bash
git add .
git commit -m "feat: Nouvelle fonctionnalité"
git push origin main
```

### Manuel

```bash
# Via CLI
cd backend && vercel --prod
cd photographie && vercel --prod

# Via Interface
# Aller sur vercel.com → Deployments → Redeploy
```

---

## 🎯 CHECKLIST FINALE

Avant de considérer le déploiement comme terminé :

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Toutes les variables d'environnement configurées
- [ ] MongoDB Atlas autorise les connexions Vercel
- [ ] CORS configuré correctement
- [ ] Tests de bout en bout passent
- [ ] Lighthouse Score > 90
- [ ] Pas d'erreurs dans les logs
- [ ] Sitemap soumis à Google
- [ ] PayPal/Stripe en mode production testés
- [ ] Images Cloudinary chargent
- [ ] SSL/HTTPS actif (automatique sur Vercel)

---

## 📚 RESSOURCES UTILES

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Déploiement Node.js](https://vercel.com/docs/frameworks/node)
- [Déploiement Vite](https://vercel.com/docs/frameworks/vite)
- [Variables d'environnement](https://vercel.com/docs/concepts/projects/environment-variables)
- [Domaines custom](https://vercel.com/docs/concepts/projects/custom-domains)

---

## 🆘 SUPPORT

### En cas de problème bloquant

1. **Vercel Support** : [vercel.com/support](https://vercel.com/support)
2. **Discord Vercel** : [vercel.com/discord](https://vercel.com/discord)
3. **GitHub Issues** : Créer une issue sur votre repo

### Erreurs fréquentes documentées

Toutes les erreurs communes et leurs solutions sont dans la section [Dépannage](#dépannage) ci-dessus.

---

**Dernière mise à jour** : 2026-01-11  
**Version** : 1.0.0  
**Auteur** : Équipe d'optimisation

🎉 **Félicitations !** Votre site est maintenant en production sur Vercel !
