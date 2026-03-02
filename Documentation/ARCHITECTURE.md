# Architecture Technique - Projet Photographie

Ce document fournit une vue d'ensemble de l'architecture du projet "Eloura74/TitreAfpa".

## 1. Vue d'ensemble

Le projet est une application web fullstack (MERN-like) permettant la gestion d'un portfolio de photographe, une boutique en ligne et un espace d'événements privés.

## 2. Technologies

- **Frontend** : React 19, Vite, Tailwind CSS 4, Framer Motion, Zustand.
- **Backend** : Express.js, Node.js, Mongoose.
- **Base de données** : MongoDB (Atlas en production).
- **Stockage Médias** : Cloudinary.
- **Paiements** : PayPal SDK.

## 3. Structure du Projet

- `/photographie` : Code source du frontend (React).
- `/backend` : Code source du backend (Express).
- `/Documentation` : Documents d'architecture, décisions et runbooks.

## 4. Flux de Données

1. L'utilisateur interagit avec l'interface React.
2. Le frontend communique avec l'API REST du backend via Axios.
3. Le backend gère l'authentification (JWT), la logique métier et les interactions avec MongoDB.
4. Les images sont servies via Cloudinary avec des transformations dynamiques (ex: watermarks).
5. Les transactions financières sont déléguées au SDK PayPal.

## 5. Sécurité

- Authentification par Cookie/JWT.
- Validation des données avec Zod.
- Protection XSS, NoSQL Injection et Rate Limiting.
- Chiffrement des mots de passe avec Bcrypt.
