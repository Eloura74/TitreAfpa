# Projet FABER – Plateforme de Photographie Artistique

## Page de garde

- **Titre du projet** : Projet FABER – Plateforme de Photographie Artistique
- **Nom du candidat** : Quentin FABER
- **Formation** : Titre Professionnel Développeur Web et Web Mobile (RNCP 37674)
- **Date** : Mai 2025

---

## Sommaire
1. Présentation du projet
2. Analyse des besoins
3. Conception et architecture
4. Réalisation technique
5. Tests et validation
6. Bilan et perspectives
7. Annexes

---

## 1. Présentation du projet

### 1.1 Contexte
Le projet FABER vise à offrir à l’artiste photographe Fabien une plateforme moderne pour exposer et vendre ses œuvres photographiques et graphiques. Le site doit combiner vitrine, e-commerce, et espace d’administration intuitif.

### 1.2 Objectifs
- Mettre en valeur les œuvres de Fabien
- Permettre la vente en ligne (galerie photo, œuvres graphiques uniques)
- Offrir une gestion autonome du contenu via une interface admin

### 1.3 Public visé
- Amateurs d’art et de photographie
- Collectionneurs
- Professionnels à la recherche d’œuvres uniques

---

## 2. Analyse des besoins

### 2.1 Fonctionnalités principales
- Galerie photo filtrable par catégories
- Galerie graphique (œuvres uniques)
- Panier d’achat et gestion de commandes
- Espace administration (ajout, modification, suppression d’œuvres)
- Authentification admin (sécurité)

### 2.2 Contraintes techniques
- Responsive/mobile-first
- Accessibilité (contrastes, navigation clavier, ARIA)
- Stockage sécurisé des images (uploads persistants)
- Respect du RGPD (mentions légales, gestion des cookies)

### 2.3 Cahier des charges
- Technologies : React (Vite, TypeScript), Node.js (Express), MongoDB, Tailwind CSS, Docker
- Déploiement local et cloud-ready
- Documentation claire pour l’utilisateur et l’admin

---

## 3. Conception et architecture

### 3.1 Architecture technique
- **Frontend** : React + TypeScript, Tailwind CSS, Shadcn UI
- **Backend** : Express, Multer (upload), MongoDB (Mongoose)
- **Déploiement** : Docker Compose (services : backend, MongoDB, mongo-express)

### 3.2 Schéma d’architecture
```mermaid
graph TD;
  Utilisateur-->|HTTP(s)|Frontend[React]
  Frontend-->|API REST|Backend[Express]
  Backend-->|Connexion|MongoDB[(MongoDB)]
  Backend-->|Fichiers statiques|Uploads[(/uploads)]
```

### 3.3 Modélisation des données
- **Photo** : titre, description, prix, catégorie, type, image
- **OeuvreGraphique** : titre, description, prix, image
- **Utilisateur (admin)** : email, mot de passe (hashé)

### 3.4 Maquettes et UI
- Wireframes et captures d’écran des pages principales (voir annexes)
- Palette de couleurs : noir, or, blanc
- Police : Montserrat, Open Sans

---

## 4. Réalisation technique

### 4.1 Frontend
- Organisation en dossiers : `components/`, `pages/`, `store/`, `utils/`, `types/`
- Composants réutilisables (Shadcn UI)
- Formulaires avec React Hook Form et validation Zod
- Gestion du panier via Context
- Affichage dynamique des galeries avec filtrage

### 4.2 Backend
- API RESTful : routes pour photos, œuvres graphiques, panier, admin
- Upload d’images sécurisé avec Multer
- Stockage des fichiers dans `/uploads` (volume Docker)
- Sécurisation des routes admin (middleware d’authentification)

### 4.3 Déploiement
- Docker Compose : orchestration des services
- Volume persistant pour `/uploads`
- Documentation pour installation locale et cloud

---

## 5. Tests et validation

### 5.1 Stratégie de tests
- Tests unitaires avec Vitest (composants critiques)
- Tests manuels des parcours utilisateur
- Vérification de l’accessibilité (navigation clavier, ARIA)

### 5.2 Problèmes rencontrés et solutions
- **Upload images** : correction des chemins, gestion du volume Docker
- **Affichage images** : normalisation des URLs côté front
- **Connexion MongoDB** : debug du timing de démarrage des conteneurs

---

## 6. Bilan et perspectives

### 6.1 Résultats
- Toutes les fonctionnalités principales sont livrées
- L’interface est responsive et accessible
- L’artiste peut gérer ses œuvres en autonomie

### 6.2 Évolutions possibles
- Paiement en ligne (Stripe)
- Galerie vidéo
- Système de blog ou actualités
- Statistiques de visites/admin

### 6.3 Compétences acquises
- Stack MERN avancée (React, Node, MongoDB)
- Dockerisation et déploiement
- Accessibilité web et bonnes pratiques UI

---

## 7. Annexes
- Extraits de code commentés (backend, frontend)
- Schémas de BDD (Mongoose)
- Captures d’écran des interfaces
- Guide d’utilisation rapide pour l’admin

---

*Document rédigé et structuré pour la présentation devant le jury de certification. Pour la version PDF, ajoutez vos propres captures d’écran, schémas, et personnalisez la charte graphique selon votre identité visuelle.*
