<div align="center">
  <img src="./Notes/TitreAfpa_header.png" alt="Bannière Portfolio Informatique" width="100%">
</div>
<br>

<div align="center">

# 📸 FABER - Plateforme de Photographie & Graphisme

<img src="https://img.shields.io/badge/Version-2.0.0-gold?style=for-the-badge" alt="Version"/>
<img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react" alt="React"/>
<img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" alt="Node.js"/>
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"/>
<img src="https://img.shields.io/badge/Tests-107%20Passing-brightgreen?style=for-the-badge" alt="Tests"/>

<br/><br/>

**🎨 Portfolio artistique + 🛒 E-commerce complet + 📅 Gestion d'événements**

[🌐 Voir le Site](https://votre-site.vercel.app) · [📖 Documentation](#) · [🐛 Reporter un Bug](https://github.com/issues)

</div>

---

# 📋 Table des Matières

<table>
<tr>
<td width="50%" valign="top">

### 👤 Pour les Utilisateurs

- [🏠 Qu'est-ce que ce site ?](#-quest-ce-que-ce-site-)
- [🎯 Comment utiliser le site](#-comment-utiliser-le-site)
- [🛒 Commander une photo](#-commander-une-photo)
- [💳 Paiement sécurisé](#-paiement-sécurisé)
- [📅 Réserver une séance](#-réserver-une-séance)
- [🔐 Accès photos privées](#-accès-photos-privées)
- [❓ Questions fréquentes](#-questions-fréquentes)

</td>
<td width="50%" valign="top">

### 👨‍💻 Pour les Développeurs

- [🚀 Installation locale](#-installation-locale)
- [☁️ Déploiement Vercel](#️-déploiement-vercel)
- [📡 Routes API](#-routes-api-complètes)
- [🏗️ Architecture](#️-architecture-du-projet)
- [🧪 Tests](#-tests-automatisés)
- [🔐 Sécurité](#-sécurité)
- [📝 Variables d'environnement](#-variables-denvironnement)

</td>
</tr>
</table>

---

<div align="center">

# 👤 GUIDE UTILISATEUR

_Tout ce que vous devez savoir pour utiliser le site_

</div>

---

## 🏠 Qu'est-ce que ce site ?

<table>
<tr>
<td>

### 🎨 Un Portfolio Artistique

Découvrez les œuvres d'un photographe professionnel : paysages, portraits, événements, graphisme...

### 🛒 Une Boutique en Ligne

Achetez des tirages photo dans le format de votre choix : du poster mural au fichier numérique.

### 📅 Un Espace Client

Réservez des séances photo et accédez à vos photos privées (mariage, événements...).

</td>
</tr>
</table>

---

## 🎯 Comment utiliser le site

<details>
<summary><strong>🖼️ Parcourir la Galerie</strong></summary>

### Étape par étape :

1. **Cliquez sur "Galerie"** dans le menu
2. **Filtrez par catégorie** : Nature, Portrait, Événement, Graphisme...
3. **Cliquez sur une photo** pour la voir en grand
4. **Utilisez les flèches** ← → pour naviguer entre les photos

### Astuces :

- 💡 Utilisez la molette pour zoomer sur les détails
- 💡 Cliquez en dehors de l'image pour fermer

</details>

<details>
<summary><strong>🛒 Ajouter au panier</strong></summary>

### Pour ajouter une photo :

1. **Ouvrez une photo** en cliquant dessus
2. **Cliquez sur "Acheter"** ou l'icône panier 🛒
3. **Choisissez votre format** :
   - 📐 **Taille** : 10x15, 20x30, 30x45, 50x70...
   - 🖼️ **Support** : Papier photo, Toile, Aluminium, Cadre...
   - ✨ **Finition** : Mat, Brillant, Satiné...
4. **Vérifiez le prix** qui s'affiche en temps réel
5. **Cliquez sur "Ajouter au panier"**

### Le saviez-vous ?

- 💡 Votre panier est sauvegardé automatiquement
- 💡 Vous pouvez modifier les quantités à tout moment

</details>

<details>
<summary><strong>✏️ Modifier le panier</strong></summary>

### Dans votre panier, vous pouvez :

| Action                  | Comment faire                 |
| ----------------------- | ----------------------------- |
| ➕ Augmenter quantité   | Cliquez sur le bouton **+**   |
| ➖ Diminuer quantité    | Cliquez sur le bouton **-**   |
| 🗑️ Supprimer un article | Cliquez sur la poubelle       |
| 🧹 Vider le panier      | Cliquez sur "Vider le panier" |

</details>

---

## 🛒 Commander une photo

<details open>
<summary><strong>📦 Les étapes de commande</strong></summary>

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   1. CHOIX   │ → │  2. PANIER   │ → │  3. PAIEMENT │ → │ 4. LIVRAISON │
│              │    │              │    │              │    │              │
│ Sélectionnez │    │ Vérifiez     │    │ PayPal ou    │    │ Recevez chez │
│ format/taille│    │ vos articles │    │ Carte        │    │ vous !       │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 1️⃣ Choisir le format

| Format            | Idéal pour              |
| ----------------- | ----------------------- |
| 10x15 cm          | Album photo, souvenirs  |
| 20x30 cm          | Cadre de bureau         |
| 30x45 cm          | Décoration murale       |
| 50x70 cm          | Grande décoration       |
| Fichier numérique | Utilisation personnelle |

### 2️⃣ Choisir le support

| Support          | Description                         |
| ---------------- | ----------------------------------- |
| **Papier photo** | Classique, idéal pour les cadres    |
| **Toile canvas** | Aspect artistique, prêt à accrocher |
| **Aluminium**    | Moderne, ultra résistant            |
| **Plexiglas**    | Brillant, effet galerie             |

</details>

---

## 💳 Paiement sécurisé

<details>
<summary><strong>💰 Moyens de paiement acceptés</strong></summary>

<table>
<tr>
<td align="center" width="50%">

### 🅿️ PayPal

✅ Paiement instantané  
✅ Protection acheteur  
✅ Pas besoin de compte  
✅ Carte bancaire via PayPal

</td>
<td align="center" width="50%">

### 💳 Carte Bancaire

✅ Visa, Mastercard  
✅ Sécurisé par Stripe  
✅ 3D Secure  
✅ Cryptage SSL

</td>
</tr>
</table>

### 🔒 Votre sécurité est notre priorité

- Toutes les transactions sont **cryptées en HTTPS**
- Vos données bancaires **ne sont jamais stockées** sur notre serveur
- Nous utilisons **PayPal et Stripe**, leaders du paiement sécurisé

</details>

---

## 📅 Réserver une séance

<details>
<summary><strong>📸 Types de séances disponibles</strong></summary>

| Type              | Description            | Durée   |
| ----------------- | ---------------------- | ------- |
| 👶 **Naissance**  | Photos de nouveau-né   | 2h      |
| 💍 **Mariage**    | Cérémonie et réception | Journée |
| 👨‍👩‍👧‍👦 **Famille**    | Portraits en extérieur | 1h30    |
| 🎂 **Événement**  | Anniversaire, fête...  | 3-4h    |
| 💼 **Corporate**  | Portrait professionnel | 1h      |
| 🏠 **Immobilier** | Photos d'intérieur     | 2h      |

### Comment réserver ?

1. **Allez dans "Services"**
2. **Choisissez votre prestation**
3. **Cliquez sur "Réserver"**
4. **Remplissez le formulaire** avec vos coordonnées
5. **Attendez la confirmation** par email

</details>

---

## 🔐 Accès photos privées

<details>
<summary><strong>🎉 Voir les photos de votre événement</strong></summary>

### Après votre séance photo :

1. Vous recevez un **email avec un lien sécurisé**
2. **Cliquez sur le lien** pour accéder à votre galerie privée
3. **Visualisez toutes vos photos**
4. **Téléchargez** celles que vous souhaitez
5. **Commandez** des tirages directement depuis la galerie

### ⚠️ Important :

- Votre lien est **personnel et confidentiel**
- Il est **valable 30 jours** (renouvelable sur demande)
- Ne le partagez pas publiquement

</details>

---

## ❓ Questions fréquentes

<details>
<summary><strong>🚚 Délais de livraison ?</strong></summary>

| Produit           | Délai       |
| ----------------- | ----------- |
| Fichier numérique | Immédiat    |
| Tirage papier     | 5-7 jours   |
| Toile/Cadre       | 10-15 jours |

</details>

<details>
<summary><strong>📦 Frais de port ?</strong></summary>

- **France métropolitaine** : 5€ (gratuit dès 50€)
- **DOM-TOM** : 15€
- **Europe** : 12€
- **International** : Sur devis

</details>

<details>
<summary><strong>↩️ Retours et remboursements ?</strong></summary>

- Satisfait ou remboursé **sous 14 jours**
- Retour **gratuit** pour articles défectueux
- Contactez-nous par email pour toute demande

</details>

<details>
<summary><strong>📞 Comment vous contacter ?</strong></summary>

- **Email** : contact@photographepro.fr
- **Téléphone** : 06 XX XX XX XX
- **Formulaire** : Page "Contact"

</details>

---

<div align="center">

# 👨‍💻 DOCUMENTATION TECHNIQUE

_Pour les développeurs et contributeurs_

</div>

---

## 🚀 Installation locale

<details open>
<summary><strong>📋 Prérequis</strong></summary>

| Logiciel | Version | Téléchargement                                                     |
| -------- | ------- | ------------------------------------------------------------------ |
| Node.js  | 18+     | [nodejs.org](https://nodejs.org)                                   |
| npm      | 9+      | Inclus avec Node.js                                                |
| MongoDB  | -       | [Local](https://mongodb.com) ou [Atlas](https://cloud.mongodb.com) |
| Git      | -       | [git-scm.com](https://git-scm.com)                                 |

</details>

<details>
<summary><strong>⚡ Installation rapide (5 minutes)</strong></summary>

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/projet-faber.git
cd projet-faber

# 2. Installer le backend
cd backend
npm install
cp .env.example .env  # Puis éditer le fichier .env

# 3. Installer le frontend
cd ../photographie
npm install

# 4. Lancer les deux serveurs
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd photographie && npm run dev
```

🎉 **C'est prêt !**

- Frontend : http://localhost:5173
- Backend : http://localhost:5000

</details>

<details>
<summary><strong>🐳 Installation Docker (optionnel)</strong></summary>

```bash
# Lancer avec Docker Compose
docker-compose up --build

# Arrêter
docker-compose down
```

</details>

---

## ☁️ Déploiement Vercel

<details>
<summary><strong>🔧 Déployer le Backend</strong></summary>

### 1. Créer un compte Vercel

Allez sur [vercel.com](https://vercel.com) et connectez-vous avec GitHub.

### 2. Importer le projet

```
New Project → Import Git Repository → Sélectionner votre repo
```

### 3. Configurer le déploiement

| Paramètre        | Valeur           |
| ---------------- | ---------------- |
| Root Directory   | `backend`        |
| Build Command    | _(laisser vide)_ |
| Output Directory | _(laisser vide)_ |
| Install Command  | `npm install`    |

### 4. Ajouter les variables d'environnement

Dans **Settings → Environment Variables**, ajoutez :

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=votre_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
FRONTEND_URL=https://votre-frontend.vercel.app
```

### 5. Déployer

Cliquez sur **Deploy** !

</details>

<details>
<summary><strong>🎨 Déployer le Frontend</strong></summary>

### 1. Nouvelle app Vercel

```
New Project → Import Git Repository → Sélectionner votre repo
```

### 2. Configurer

| Paramètre        | Valeur          |
| ---------------- | --------------- |
| Root Directory   | `photographie`  |
| Framework Preset | `Vite`          |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

### 3. Variables d'environnement

```
VITE_API_URL=https://votre-backend.vercel.app/api
VITE_PAYPAL_CLIENT_ID=votre_client_id
```

### 4. Déployer

Cliquez sur **Deploy** !

</details>

---

## 📡 Routes API Complètes

<details>
<summary><strong>🔐 Authentification - /api/auth</strong></summary>

| Méthode                                          | Route                    | Description    | Accès   |
| ------------------------------------------------ | ------------------------ | -------------- | ------- |
| ![POST](https://img.shields.io/badge/POST-green) | `/register`              | Inscription    | Public  |
| ![POST](https://img.shields.io/badge/POST-green) | `/login`                 | Connexion      | Public  |
| ![GET](https://img.shields.io/badge/GET-blue)    | `/me`                    | Mon profil     | 🔒 Auth |
| ![GET](https://img.shields.io/badge/GET-blue)    | `/verify/:token`         | Vérifier email | Public  |
| ![POST](https://img.shields.io/badge/POST-green) | `/forgot-password`       | Reset MDP      | Public  |
| ![PUT](https://img.shields.io/badge/PUT-orange)  | `/reset-password/:token` | Nouveau MDP    | Public  |
| ![POST](https://img.shields.io/badge/POST-green) | `/logout`                | Déconnexion    | 🔒 Auth |

</details>

<details>
<summary><strong>🖼️ Galerie - /api/galerie</strong></summary>

| Méthode                                            | Route  | Description     | Accès    |
| -------------------------------------------------- | ------ | --------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Liste photos    | Public   |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/:id` | Détails photo   | Public   |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`    | Ajouter photo   | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id` | Modifier photo  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer photo | 👑 Admin |

</details>

<details>
<summary><strong>📁 Albums - /api/albums</strong></summary>

| Méthode                                            | Route  | Description     | Accès    |
| -------------------------------------------------- | ------ | --------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Liste albums    | Public   |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`    | Créer album     | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id` | Modifier album  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer album | 👑 Admin |

</details>

<details>
<summary><strong>🎨 Œuvres Graphiques - /api/oeuvres-graphique</strong></summary>

| Méthode                                            | Route  | Description     | Accès    |
| -------------------------------------------------- | ------ | --------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Liste œuvres    | Public   |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`    | Ajouter œuvre   | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id` | Modifier œuvre  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer œuvre | 👑 Admin |

</details>

<details>
<summary><strong>💰 Tarifs - /api/tarifs</strong></summary>

| Méthode                                            | Route     | Description     | Accès    |
| -------------------------------------------------- | --------- | --------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`       | Tarifs actifs   | Public   |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/config` | Configuration   | Public   |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`       | Créer tarif     | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id`    | Modifier tarif  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id`    | Supprimer tarif | 👑 Admin |

</details>

<details>
<summary><strong>🎡 Services - /api/services</strong></summary>

| Méthode                                            | Route  | Description       | Accès    |
| -------------------------------------------------- | ------ | ----------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Liste services    | Public   |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`    | Créer service     | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id` | Modifier service  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer service | 👑 Admin |

</details>

<details>
<summary><strong>📅 Événements - /api/evenements</strong></summary>

| Méthode                                            | Route         | Description         | Accès    |
| -------------------------------------------------- | ------------- | ------------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`           | Liste événements    | Public   |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/me`         | Mes événements      | 🔒 Auth  |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`           | Créer événement     | 👑 Admin |
| ![POST](https://img.shields.io/badge/POST-green)   | `/:id/photos` | Ajouter photos      | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id`        | Modifier événement  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id`        | Supprimer événement | 👑 Admin |

</details>

<details>
<summary><strong>🛒 Paniers - /api/paniers</strong></summary>

| Méthode                                            | Route  | Description        | Accès    |
| -------------------------------------------------- | ------ | ------------------ | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/me`  | Mon panier         | 🔒 Auth  |
| ![POST](https://img.shields.io/badge/POST-green)   | `/me`  | Sauvegarder panier | 🔒 Auth  |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Tous les paniers   | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer panier   | 👑 Admin |

</details>

<details>
<summary><strong>💳 Paiements - /api/paiements</strong></summary>

| Méthode                                            | Route  | Description        | Accès    |
| -------------------------------------------------- | ------ | ------------------ | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/me`  | Historique         | 🔒 Auth  |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Tous les paiements | 👑 Admin |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`    | Créer paiement     | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id` | Modifier paiement  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer paiement | 👑 Admin |

</details>

<details>
<summary><strong>🔒 Accès Privé - /api/acces-prive</strong></summary>

| Méthode                                            | Route  | Description     | Accès    |
| -------------------------------------------------- | ------ | --------------- | -------- |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/`    | Mes accès       | 🔒 Auth  |
| ![GET](https://img.shields.io/badge/GET-blue)      | `/:id` | Détails accès   | 🔒 Auth  |
| ![POST](https://img.shields.io/badge/POST-green)   | `/`    | Créer accès     | 👑 Admin |
| ![PUT](https://img.shields.io/badge/PUT-orange)    | `/:id` | Modifier accès  | 👑 Admin |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/:id` | Supprimer accès | 👑 Admin |

</details>

<details>
<summary><strong>💵 PayPal - /api/paypal</strong></summary>

| Méthode                                          | Route                     | Description      | Accès  |
| ------------------------------------------------ | ------------------------- | ---------------- | ------ |
| ![POST](https://img.shields.io/badge/POST-green) | `/create-order`           | Créer commande   | Public |
| ![POST](https://img.shields.io/badge/POST-green) | `/capture-order/:orderID` | Valider paiement | Public |

</details>

<details>
<summary><strong>📤 Upload - /api/upload-cloudinary</strong></summary>

| Méthode                                       | Route   | Description      | Accès   |
| --------------------------------------------- | ------- | ---------------- | ------- |
| ![GET](https://img.shields.io/badge/GET-blue) | `/sign` | Signature upload | 🔒 Auth |

</details>

---

## 🏗️ Architecture du Projet

<details>
<summary><strong>📂 Structure des dossiers</strong></summary>

```
projet-faber/
│
├── 📁 backend/
│   ├── 📁 controllers/      # Logique métier
│   │   ├── galerieController.js
│   │   ├── paypalController.js
│   │   └── ...
│   ├── 📁 middleware/       # Authentification, validation
│   │   ├── auth.js
│   │   └── isAdmin.js
│   ├── 📁 models/           # Schémas MongoDB
│   │   ├── User.js
│   │   ├── Photo.js
│   │   └── ...
│   ├── 📁 routes/           # Endpoints API
│   ├── 📁 services/         # Email, etc.
│   ├── 📁 tests/            # Tests Jest
│   └── server.js            # Point d'entrée
│
├── 📁 photographie/
│   ├── 📁 src/
│   │   ├── 📁 __tests__/    # Tests Vitest
│   │   ├── 📁 components/   # Composants React
│   │   │   ├── 📁 galerie/
│   │   │   ├── 📁 layout/
│   │   │   ├── 📁 paiement/
│   │   │   ├── 📁 panier/
│   │   │   └── 📁 ui/
│   │   ├── 📁 pages/        # Pages/Vues
│   │   ├── 📁 services/     # Appels API
│   │   ├── 📁 store/        # Zustand
│   │   ├── 📁 styles/       # CSS
│   │   └── 📁 types/        # TypeScript
│   └── vite.config.ts
│
└── 📄 README.md
```

</details>

<details>
<summary><strong>🔄 Flux de données</strong></summary>

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   FRONTEND  │     │   BACKEND   │     │   DATABASE  │
│   (React)   │ ←→ │  (Express)  │ ←→ │  (MongoDB)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ↓                   ↓
┌─────────────┐     ┌─────────────┐
│  CLOUDINARY │     │   PAYPAL    │
│   (Images)  │     │ (Paiement)  │
└─────────────┘     └─────────────┘
```

</details>

---

## 🧪 Tests Automatisés

<details open>
<summary><strong>📊 Couverture des tests</strong></summary>

<table>
<tr>
<td align="center">

### Backend

![Tests](https://img.shields.io/badge/Tests-59-success?style=for-the-badge)

| Suite       | Tests |
| ----------- | ----- |
| Auth        | 6     |
| Galerie     | 7     |
| Albums      | 7     |
| Œuvres      | 5     |
| Services    | 4     |
| Tarifs      | 3     |
| Événements  | 5     |
| Paniers     | 5     |
| Accès Privé | 5     |
| Paiements   | 5     |
| PayPal      | 4     |
| Cloudinary  | 3     |

</td>
<td align="center">

### Frontend

![Tests](https://img.shields.io/badge/Tests-48-success?style=for-the-badge)

| Suite        | Tests |
| ------------ | ----- |
| Utils        | 6     |
| Stores       | 8     |
| Components   | 8     |
| Layout       | 6     |
| UI           | 10    |
| Gallery/Cart | 10    |

</td>
</tr>
</table>

</details>

<details>
<summary><strong>▶️ Exécuter les tests</strong></summary>

```bash
# Backend (Jest + Supertest)
cd backend
npm test

# Frontend (Vitest + Testing Library)
cd photographie
npm run test:run    # Une fois
npm test            # Mode watch
```

</details>

---

## 🔐 Sécurité

<details>
<summary><strong>🛡️ Mesures implémentées</strong></summary>

| Mesure                | Description                      |
| --------------------- | -------------------------------- |
| 🔑 **JWT**            | Tokens signés avec expiration 2h |
| 🔒 **Bcrypt**         | Hash mots de passe (10 rounds)   |
| 🪖 **Helmet**         | Headers HTTP sécurisés           |
| 🌐 **CORS**           | Origines autorisées              |
| ⏱️ **Rate Limiting**  | Anti brute force                 |
| 🧹 **XSS Clean**      | Nettoyage entrées                |
| 🛡️ **Mongo Sanitize** | Anti injection NoSQL             |
| 🔐 **HTTPS**          | Chiffrement transport            |

</details>

---

## 📝 Variables d'Environnement

<details>
<summary><strong>🔧 Backend (.env)</strong></summary>

```env
# Serveur
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# JWT
JWT_SECRET=votre_secret_ultra_securise_32_caracteres
JWT_EXPIRE=2h

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz

# PayPal
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_secret

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=votre@email.com
SMTP_PASSWORD=app_password
FROM_EMAIL=noreply@votresite.com
FROM_NAME=Photographe Pro

# CORS
FRONTEND_URL=http://localhost:5173
```

</details>

<details>
<summary><strong>🎨 Frontend (.env)</strong></summary>

```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYPAL_CLIENT_ID=votre_client_id
```

</details>

---

<div align="center">

## 📞 Support

**Email** : faber.quentint@gmail.fr  
**Site** : https://github.com/Eloura74

---

## 📄 Licence

© 2026 Faber Quentin - Tous droits réservés

---

<img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" alt="Made with love"/>

_Documentation générée le 10/01/2026 - v2.0_

</div>
