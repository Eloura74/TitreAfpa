# 📸 Projet FABER : Plateforme de Photographie & Graphisme

> **Note :** Ce projet a été développé dans le cadre du Titre Professionnel Développeur Web et Web Mobile. Il s'agit d'une application complète de e-commerce et de portfolio pour un artiste photographe.

## 🆔 Identité du Projet

- **Client :** Fabien Licata (Photographe & Graphiste)
- **Objectif :** Présenter des œuvres artistiques, vendre des tirages et fichiers numériques, et gérer des événements.
- **Type :** Application Web Hybride (Portfolio + E-commerce)
- **Stack Technique :** MERN (MongoDB, Express, React, Node.js) + TypeScript + Vite + Tailwind CSS.

---

## 🚀 Installation et Lancement

### Prérequis

- **Node.js** (v18+ recommandé)
- **MongoDB** (Local ou Atlas)
- **Git**

### 1. Installation du Backend

Le backend est une API REST Express.js.

```bash
cd backend
npm install
```

Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :

```env
PORT=5000
MONGO_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=2h
# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# Paiement
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=...
SMTP_PASSWORD=...
FROM_EMAIL=...
FROM_NAME=...
# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:5173
```

Lancer le serveur :

```bash
npm start
# ou pour le développement avec rechargement automatique :
npm run dev
```

### 2. Installation du Frontend

Le frontend est une SPA React construite avec Vite.

```bash
cd photographie
npm install
```

Créez un fichier `.env` dans le dossier `photographie` (optionnel si valeurs par défaut suffisantes, mais recommandé pour l'API) :

```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYPAL_CLIENT_ID=...
```

Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

### 3. Lancement avec Docker (Optionnel)

Un fichier `docker-compose.yml` est disponible à la racine.

```bash
docker-compose up --build
```

---

## 🏗️ Architecture Frontend (Détails)

Le frontend est conçu pour être **rapide, responsive et immersif**. Il utilise le "Dark Mode" par défaut pour mettre en valeur les œuvres.

### Stack Technique

- **Core :** React 19, TypeScript.
- **Build Tool :** Vite (Ultra rapide).
- **Styling :** Tailwind CSS v4 (Utilitaire), Framer Motion (Animations fluides).
- **Routing :** React Router DOM v7.
- **State Management :**
  - **Context API :** Pour l'authentification (`UserContext`) et le panier (`PanierContext`).
  - **Zustand :** Pour des états globaux spécifiques.
  - **React Query (TanStack Query) :** Pour la gestion des données serveur (caching, loading states).
- **Formulaires :** React Hook Form + Zod (Validation de schéma).
- **Icons :** Lucide React.

### Structure des Dossiers (`/photographie/src`)

- `components/` : Composants réutilisables.
  - `galerie/` : Modales de sélection, grilles de photos.
  - `layout/` : Navbar, Footer.
  - `paiement/` : Boutons PayPal, Stripe.
  - `ui/` : Composants de base (Boutons, Inputs).
- `pages/` : Vues principales.
  - `Galerie.tsx` : Filtrage et affichage des photos.
  - `GestionGalerie.tsx` : Dashboard Admin (CRUD Photos).
  - `Checkout.tsx` : Tunnel de paiement.
- `services/` : Fonctions d'appel API (Axios).
- `store/` : Contextes et Stores Zustand.
- `types/` : Définitions TypeScript partagées.

### Fonctionnalités Clés

1.  **Galerie Dynamique :** Filtrage par catégorie, affichage responsive, Lazy Loading.
2.  **Système de Panier :** Persistance locale, calcul en temps réel, gestion des quantités.
3.  **Tunnel de Commande :** Formulaire de livraison, choix du mode de paiement (PayPal/Stripe).
4.  **Espace Admin :**
    - Upload d'images (Drag & Drop).
    - Gestion des métadonnées (Titre, Prix, Description).
    - Configuration des tarifs par format/support.

---

## ⚙️ Architecture Backend (Détails)

Le backend est une **API RESTful** robuste et sécurisée, conçue pour être hébergée sur Vercel (Serverless) ou un serveur Node.js classique.

### Stack Technique

- **Runtime :** Node.js.
- **Framework :** Express.js v4.
- **Base de Données :** MongoDB (via Mongoose).
- **Authentification :** JWT (JSON Web Tokens).
- **Sécurité :** Helmet, CORS, Rate Limiting, XSS Clean, Mongo Sanitize.
- **Uploads :** Multer (Mémoire) + Cloudinary (Stockage Cloud).

### Structure du Code (`/backend`)

- `server.js` : Point d'entrée, configuration des middlewares globaux.
- `routes/` : Définition des endpoints API.
  - `/api/auth` : Inscription, Connexion, Me.
  - `/api/galerie` : CRUD Photos (Public en lecture, Admin en écriture).
  - `/api/panier` : Gestion du panier côté serveur (optionnel selon implémentation).
  - `/api/paiement` : Webhooks et création de sessions de paiement.
- `controllers/` : Logique métier.
  - `galerieController.js` : Gestion des uploads Cloudinary et entrées BDD.
  - `paypalController.js` : Création et capture des ordres PayPal.
- `models/` : Schémas Mongoose.
  - `User` : Utilisateurs et Admins.
  - `Photo` : Lien Cloudinary, Tarifs spécifiques, Métadonnées.
  - `Commande` : Historique des achats.
  - `Tarif` : Grille tarifaire globale.

### Sécurité & Paiement

- **JWT :** Les routes admin sont protégées par un middleware qui vérifie le token JWT et le rôle de l'utilisateur.
- **PayPal :** Intégration "Smart Buttons" avec vérification du montant côté serveur avant capture.
- **Stripe :** Utilisation de Stripe Checkout pour une expérience de paiement sécurisée et conforme PCI-DSS.

---

## 🗺️ Roadmap & Améliorations Futures

- [ ] **Webhooks Stripe :** Finaliser l'intégration des webhooks pour une confirmation de commande asynchrone robuste.
- [ ] **Tests :** Ajouter des tests unitaires (Vitest/Jest) pour le backend et le frontend.
- [ ] **Performance :** Optimiser le chargement des images (formats AVIF/WebP automatiques via Cloudinary).
- [ ] **Blog :** Ajouter une section "Actualités" pour le SEO.

---

_Documentation générée le 09/01/2026 - Projet FABER_
