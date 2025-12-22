# 📘 BIBLE DU PROJET : "Photographie & Graphisme"

Ce document est la référence absolue et exhaustive du projet. Il détaille chaque aspect fonctionnel, technique et structurel de l'application.

---

## 1. 🆔 Carte d'Identité du Projet

- **Nom :** Photographie & Graphisme (Titre AFPA)
- **Type :** Application Web Hybride (Portfolio + E-commerce)
- **Objectif :** Présenter des œuvres artistiques (photos/graphismes) et permettre leur vente (tirages physiques, fichiers numériques) ainsi que la réservation de prestations.
- **Cible :** Amateurs d'art, clients potentiels pour des prestations graphiques.
- **Stack Technique :** MERN (MongoDB, Express, React, Node.js).
- **Hébergement :** Vercel (Frontend & Backend Serverless).
- **Stockage Données :** MongoDB Atlas.
- **Stockage Média :** Cloudinary.

---

## 2. 📖 Description Fonctionnelle Détaillée

### 2.1. Parcours Visiteur (Front-Office)
Le visiteur navigue sur une interface sombre ("Dark Mode"), élégante et fluide.

1.  **Découverte (Landing Page) :**
    *   Accueil immersif avec mise en avant des dernières œuvres.
    *   Navigation fluide vers les univers "Photographie" et "Graphisme".
2.  **Exploration (Galeries) :**
    *   **Galerie Photo :** Grille responsive de photos. Filtrage par catégories (ex: Paysage, Portrait).
    *   **Galerie Graphique :** Présentation d'œuvres uniques.
    *   **Interaction :** Au clic sur "Ajouter au panier", si la photo a plusieurs formats, une modale s'ouvre pour choisir le format (A4, 20x30...) et le support (Papier, Toile...). Sinon, ajout direct.
3.  **Panier & Commande :**
    *   Gestion du panier en temps réel (ajout, suppression, calcul total).
    *   **Checkout :** Formulaire de livraison pré-rempli si connecté.
    *   **Paiement :** Intégration native de PayPal (Boutons Intelligents) et Stripe (Carte Bancaire).
4.  **Espace Client :**
    *   Inscription/Connexion sécurisée.
    *   Suivi de l'historique des commandes.
    *   Gestion des informations personnelles.

### 2.2. Parcours Administrateur (Back-Office)
L'administrateur dispose d'une interface dédiée et sécurisée (`/admin/*`).

1.  **Gestion de la Galerie :**
    *   Upload de nouvelles photos (vers Cloudinary).
    *   Édition des métadonnées (Titre, Description, Catégorie).
    *   Définition des prix spécifiques ou par défaut.
2.  **Gestion des Tarifs :**
    *   Interface CRUD pour définir la grille tarifaire globale (Formats/Supports).
    *   Sauvegarde automatique des versions de tarifs (backup JSON).
3.  **Suivi des Commandes :**
    *   Visualisation des paiements reçus.
    *   Détail des transactions (PayPal/Stripe).

---

## 3. 🏗️ Architecture Technique (Deep Dive)

### 3.1. Frontend : React & Écosystème
L'application est une SPA (Single Page Application) construite avec **Vite**.

-   **Framework :** React 19.
-   **Langage :** TypeScript (pour la robustesse du typage).
-   **Styling :**
    -   **Tailwind CSS v4 :** Utilitaire CSS pour un design rapide et responsive.
    -   **Framer Motion :** Pour les animations fluides (transitions de pages, modales).
    -   **Lucide React :** Bibliothèque d'icônes légère.
-   **Gestion d'État (State Management) :**
    -   **Context API :**
        -   `UserContext` : Gère l'authentification (token JWT, infos user).
        -   `PanierContext` : Persistance du panier (localStorage + State).
    -   **Zustand :** Utilisé pour des états globaux plus complexes ou spécifiques (ex: `authStore`).
-   **Routing :** `react-router-dom` v7 avec gestion des routes protégées (`RouteAdminOnly`).
-   **Communication API :** `fetch` natif et `axios` pour les requêtes HTTP vers le backend.

### 3.2. Backend : Node.js & Express
API RESTful hébergée en tant que Serverless Functions sur Vercel.

-   **Serveur :** Express.js v4.
-   **Sécurité (Middleware) :**
    -   `helmet` : Sécurisation des en-têtes HTTP (Content Security Policy stricte).
    -   `cors` : Gestion fine des origines autorisées (Production vs Localhost).
    -   `express-rate-limit` : Protection contre les attaques par force brute (1000 req/15min).
    -   `express-mongo-sanitize` : Prévention des injections NoSQL.
    -   `xss-clean` : Nettoyage des entrées utilisateur (XSS).
-   **Authentification :**
    -   **JWT (JSON Web Token) :** Signé avec une clé secrète, expire au bout de 2h.
    -   **Bcryptjs :** Hashage des mots de passe (Salt 10 rounds).
-   **Services Tiers :**
    -   **Nodemailer :** Envoi d'emails transactionnels (Bienvenue, Confirmation de commande) via SMTP (Gmail).
    -   **Multer :** Gestion des uploads de fichiers (images) en mémoire avant envoi vers Cloudinary.

### 3.3. Base de Données : MongoDB (Mongoose)
Structure NoSQL flexible avec des schémas stricts définis via Mongoose.

-   **User :**
    -   `email` (Index unique), `motdepasse` (Hashé), `role` (Enum: 'user'|'admin').
    -   Coordonnées complètes (Nom, Prénom, Adresse...).
-   **Photo :**
    -   `src` (URL Cloudinary), `tarifs` (Tableau d'objets imbriqués : Format/Support/Prix).
    -   Relations : `evenement` (Ref), `utilisateur` (Ref).
-   **Paiement :**
    -   Historique immuable des transactions.
    -   Champs : `transactionId`, `montant`, `source` (PayPal/Stripe), `statut`.
-   **Tarif :**
    -   Modèle pour la grille tarifaire globale (utilisé pour peupler les choix dans la galerie).
-   **Evenement :**
    -   Gestion des expositions et shootings.

---

## 4. 💰 Logique Métier & Paiements

### 4.1. Moteur de Prix
Le système de prix est hybride :
1.  **Prix par Photo :** Chaque photo peut avoir ses propres variantes de prix (ex: une photo rare peut être plus chère).
2.  **Fallback :** Si aucun tarif n'est défini pour une photo, le frontend génère un tarif par défaut basé sur le champ `prix` simple de la photo.
3.  **Gestion Admin :** L'admin définit les combinaisons Format/Support possibles via l'API `/api/tarifs`.

### 4.2. Intégration PayPal
-   **Côté Client (`PayPalButton.tsx`) :** Utilise le SDK `@paypal/react-paypal-js`. Affiche les "Smart Buttons" qui s'adaptent au pays de l'utilisateur.
-   **Côté Serveur (`paypalController.js`) :**
    -   **Create Order :** Reçoit le panier, *devrait* recalculer le total (sécurité), et crée l'ordre PayPal.
    -   **Capture Order :** Finalise la transaction, enregistre le paiement en BDD, et déclenche l'email de confirmation.
    -   **Gestion d'Erreur :** Gère spécifiquement le cas `INSTRUMENT_DECLINED` pour inviter l'utilisateur à changer de moyen de paiement sans recharger la page.

### 4.3. Intégration Stripe
-   Utilise **Stripe Checkout** (page hébergée par Stripe).
-   Création d'une session via `/api/stripe/create-checkout-session`.
-   Redirection vers l'URL Stripe, puis retour vers `/checkout?success=true`.

---

## 5. 📂 Structure des Fichiers Clés

### Backend (`/backend`)
-   `server.js` : Cœur de l'application, configuration Express/Vercel.
-   `routes/` :
    -   `auth.js` : Login/Register.
    -   `galerie.js` : CRUD Photos.
    -   `paypal.js` : Routes de paiement.
-   `controllers/` : Logique métier (ex: `paypalController.js`).
-   `models/` : Schémas Mongoose (`User.js`, `Photo.js`...).
-   `services/` : `emailService.js` (Envoi d'emails).

### Frontend (`/photographie/src`)
-   `App.tsx` : Routeur principal.
-   `pages/` :
    -   `Galerie.tsx` : Logique d'affichage et filtrage des photos.
    -   `Checkout.tsx` : Tunnel de commande.
    -   `GestionGalerie.tsx` : Dashboard Admin.
-   `components/` :
    -   `paiement/PayPalButton.tsx` : Composant bouton PayPal.
    -   `galerie/SelectionFormatModal.tsx` : Modale de choix de format.
-   `store/` : `panierContext.tsx` (Logique globale du panier).

---

## 6. 🚀 Roadmap & Améliorations Futures

1.  **Sécurité Renforcée :** Implémenter la validation stricte des prix côté serveur pour PayPal (ne pas se fier au montant envoyé par le client).
2.  **Webhooks Stripe :** Remplacer la redirection simple par des Webhooks pour garantir l'enregistrement de la commande même si l'utilisateur ferme son navigateur.
3.  **Performance :** Implémenter le Lazy Loading natif sur les images de la galerie pour accélérer le chargement initial.
4.  **Tests :** Ajouter des tests unitaires (Jest) pour les contrôleurs critiques (Paiement, Auth).
