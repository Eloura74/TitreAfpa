# 🚨 ACTIONS DE SÉCURITÉ URGENTES À EFFECTUER IMMÉDIATEMENT

## ⚠️ CONTEXTE

Vos secrets ont été exposés publiquement dans le fichier `.env`. **TOUTES ces clés doivent être révoquées immédiatement** car elles sont maintenant compromises.

---

## 🔴 ÉTAPE 1 : RÉVOQUER LES CLÉS API (IMMÉDIAT)

### 1.1 MongoDB Atlas
- [ ] Se connecter à [MongoDB Atlas](https://cloud.mongodb.com)
- [ ] Aller dans **Database Access**
- [ ] **Supprimer l'utilisateur `Eloura74`** (ou changer son mot de passe)
- [ ] Créer un **nouveau mot de passe fort** (générateur recommandé)
- [ ] Mettre à jour `MONGO_URI` dans le nouveau `.env`

### 1.2 Stripe
- [ ] Se connecter à [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- [ ] Aller dans **Developers → API keys**
- [ ] **Cliquer sur "Roll key"** pour générer une nouvelle clé
- [ ] Copier la nouvelle `STRIPE_SECRET_KEY`
- [ ] Mettre à jour dans le nouveau `.env`

### 1.3 PayPal
- [ ] Se connecter à [PayPal Developer](https://developer.paypal.com/dashboard/)
- [ ] Aller dans **My Apps & Credentials**
- [ ] **Supprimer l'application actuelle** ou générer de nouvelles clés
- [ ] Créer une nouvelle application
- [ ] Copier les nouveaux `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET`
- [ ] Mettre à jour dans les `.env` (backend ET frontend)

### 1.4 Cloudinary
- [ ] Se connecter à [Cloudinary Console](https://cloudinary.com/console)
- [ ] Aller dans **Settings → Security**
- [ ] **Réinitialiser l'API Secret**
- [ ] Copier les nouvelles valeurs
- [ ] Mettre à jour dans le nouveau `.env`

### 1.5 Gmail (Mot de passe d'application)
- [ ] Aller sur [Mots de passe d'application Google](https://myaccount.google.com/apppasswords)
- [ ] **Révoquer le mot de passe actuel** (`dujm bhfj gydu ctcn`)
- [ ] Générer un **nouveau mot de passe d'application**
- [ ] Mettre à jour `EMAIL_PASS` dans le nouveau `.env`

---

## 🟡 ÉTAPE 2 : GÉNÉRER DE NOUVEAUX SECRETS

### 2.1 Génération automatique
Exécuter le script de génération de secrets :
```bash
cd backend
node scripts/generateSecrets.js
```

Copier les valeurs générées dans votre nouveau fichier `.env`.

### 2.2 Alternative manuelle
Si le script ne fonctionne pas, générer manuellement :
```bash
# Dans Node.js :
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Répéter pour chaque secret nécessaire :
- `JWT_SECRET`
- `SESSION_SECRET` (optionnel)

---

## 🟢 ÉTAPE 3 : CONFIGURATION DES NOUVEAUX .ENV

### 3.1 Backend
```bash
cd backend
cp .env.example .env
# Éditer .env avec vos nouvelles clés
```

### 3.2 Frontend
```bash
cd photographie
cp .env.example .env.local
# Éditer .env.local avec vos nouvelles clés
```

---

## ✅ ÉTAPE 4 : VÉRIFICATION

### 4.1 Checklist de sécurité
- [ ] Toutes les clés API ont été révoquées
- [ ] De nouvelles clés ont été générées
- [ ] Les fichiers `.env` ont été mis à jour
- [ ] Les fichiers `.env` ne sont **PAS** dans Git (vérifier avec `git status`)
- [ ] Le `.gitignore` contient bien `.env` et `*.env`
- [ ] L'application redémarre correctement avec les nouvelles clés

### 4.2 Test de fonctionnement
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd photographie
npm run dev
```

Vérifier que :
- ✅ La connexion MongoDB fonctionne
- ✅ L'authentification JWT fonctionne
- ✅ Les uploads Cloudinary fonctionnent
- ✅ Les paiements Stripe/PayPal fonctionnent (mode test)

---

## 🔐 ÉTAPE 5 : BONNES PRATIQUES FUTURES

### 5.1 Stockage sécurisé
Pour éviter de re-exposer vos secrets :

1. **En local** : 
   - Ne JAMAIS committer le `.env`
   - Utiliser un gestionnaire de mots de passe (1Password, Bitwarden)

2. **En production (Vercel)** :
   - Ajouter les secrets via l'interface Vercel
   - Aller dans **Settings → Environment Variables**
   - Ajouter chaque variable une par une

### 5.2 Rotation régulière
- Changer `JWT_SECRET` tous les **3-6 mois**
- Changer les mots de passe d'application Gmail tous les **6 mois**
- Surveiller les accès MongoDB Atlas

### 5.3 Monitoring
Activer les alertes :
- **Stripe** : Notifications d'activité suspecte
- **MongoDB** : IP allowlist et alertes de connexion
- **PayPal** : Notifications de transactions

---

## 📋 LISTE DE CONTRÔLE FINALE

Cocher uniquement quand tout est terminé :

- [ ] Toutes les clés API révoquées
- [ ] Nouvelles clés générées et testées
- [ ] Fichiers `.env` à jour
- [ ] `.gitignore` vérifié
- [ ] Application fonctionne en local
- [ ] Variables déployées sur Vercel
- [ ] Tests de bout en bout OK
- [ ] Document lu et compris

---

## 🆘 EN CAS DE PROBLÈME

### Support par plateforme
- **MongoDB** : [Support Atlas](https://www.mongodb.com/cloud/atlas/support)
- **Stripe** : [Support Stripe](https://support.stripe.com/)
- **PayPal** : [Support PayPal](https://www.paypal.com/fr/smarthelp/home)
- **Cloudinary** : [Support Cloudinary](https://support.cloudinary.com/)

### Erreurs fréquentes

**Erreur** : `MONGO_URI invalid`
**Solution** : Vérifier que le mot de passe ne contient pas de caractères spéciaux non encodés. Utiliser l'URL-encoding si nécessaire.

**Erreur** : `JWT_SECRET too short`
**Solution** : Le secret doit faire au moins 32 caractères. Utiliser le script `generateSecrets.js`.

**Erreur** : `Unauthorized (401)` sur Stripe
**Solution** : Vérifier que vous utilisez la **clé secrète** (`sk_...`) et non la clé publique (`pk_...`).

---

## 📚 RESSOURCES UTILES

- [Guide de sécurité Node.js](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secrets management best practices](https://www.doppler.com/blog/secrets-management-best-practices)

---

**Date de création** : 2026-01-11  
**Priorité** : 🔴 CRITIQUE  
**Statut** : À faire immédiatement

---

> **Note** : Une fois toutes ces étapes complétées, **supprimez ce fichier** car il ne doit pas rester dans le dépôt Git.
