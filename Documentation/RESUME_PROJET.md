# Résumé Global du Projet - Eloura74 / TitreAfpa

Ce document est la source de vérité pour comprendre le fonctionnement, l'architecture et le design du projet.

## 1. Présentation Générale

L'application est une plateforme fullstack destinée à un photographe/graphiste. Elle combine un portfolio artistique, une boutique de tirages en ligne (E-commerce), et des espaces de livraison privés pour les clients (Écrin Privé).

## 2. Stack Technique

### Frontend

- **Framework** : React 19 + Vite.
- **Styling** : Tailwind CSS v4 (Design moderne, mode sombre forcé).
- **Animations** : Framer Motion (Transitions fluides, effets de parallaxe).
- **Gestion d'état** : Zustand + React Context (Panier, Auth).
- **Routing** : React Router DOM 7.

### Backend

- **Serveur** : Express.js (Node.js).
- **Base de données** : MongoDB (Mongoose).
- **Authentification** : JWT + Cookies HTTP-only + Bcrypt.
- **Gestion fichiers** : Multer + Sharp (traitement images).

### Infrastructure & Services

- **Hébergement** : Vercel (Frontend) / VPS ou Render (Backend).
- **Stockage Médias** :
  - **Cloudinary** : Galeries publiques et aperçus.
  - **Cloudflare R2 (S3 Compatible)** : Stockage sécurisé des fichiers originaux (Écrin Privé).
- **Paiements** : SDK PayPal & Stripe.
- **E-mails** : Nodemailer.

## 3. Fonctionnalités Clés

### 📸 Galeries & Portfolio

- Affichage dynamique des photos et œuvres graphiques.
- Lazy-loading des images pour la performance.
- Gestion administrative complète (Upload, tags, catégories).

### 🛒 E-commerce (Tirage en Ligne)

- Sélection de formats et finitions personnalisés.
- Calcul dynamique des tarifs (via fichiers Excel/JSON importés).
- Panier persistant.
- Paiement sécurisé via PayPal.

### 🔐 Écrin Privé (Espace Client)

- Accès via code unique.
- Visualisation et téléchargement protégé des originaux.
- Liens temporaires sécurisés vers Cloudflare R2.

### 🛠 Administration

- Tableau de bord pour gérer les galeries.
- Système d'importation de tarifs via Excel.
- Configuration avancée des produits et finitions.

## 4. Structure du Projet (Chemins Clés)

### Root

- `a:/01-WORK/Projects/ProjetStage/`
  - `photographie/` : Application Frontend.
  - `backend/` : API et logique serveur.
  - `Documentation/` : Guides et documents techniques.

### Frontend (`/photographie/src`)

- `pages/` : Composants de pages (Home, Galerie, EcrinPrive, etc.).
- `components/` : Éléments UI réutilisables (Boutons, Modales, GalerieForm).
- `store/` : Logique Zustand pour le panier.
- `context/` : Contexte utilisateur (Auth).
- `App.tsx` : Point d'entrée des routes.

### Backend (`/backend`)

- `routes/` : Points de terminaison API (Auth, Ecrin, Galerie, Paiement).
- `models/` : Schémas Mongoose (User, Photo, Order).
- `server.js` : Point d'entrée principal.

## 5. Design & UI

- **Thème** : Dark Premium (Noir/Gris profond avec accents Jaune/Or).
- **Typographie** : Fonts modernes optimisées.
- **Principes** :
  - Glassmorphism (effets de flou et transparence).
  - Micro-animations sur les interactions.
  - Responsive First (mobile, tablette, desktop).

## 6. Flux de Commande

1. Sélection d'une œuvre → 2. Configuration du format → 3. Ajout au panier → 4. Connexion/Inscription → 5. Paiement (PayPal/Stripe) → 6. Validation et accès (si applicable).

---

_Dernière mise à jour : 3 Mars 2026_
