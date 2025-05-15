# 📚 Résumé du Projet Backend

## 🌐 Aperçu Général
Ce document fournit une vue d'ensemble complète de l'architecture et des fonctionnalités du backend de l'application. Il est conçu pour être accessible même aux personnes ne possédant pas de connaissances techniques approfondies.

## 🛠 Technologies Utilisées

### Langage Principal
- **JavaScript** (Node.js) - Le langage de programmation utilisé pour développer l'application côté serveur.

### Base de Données
- **MongoDB** - Une base de données NoSQL qui stocke toutes les informations de manière flexible et évolutive.
- **Mongoose** - Une bibliothèque qui facilite les interactions avec MongoDB depuis Node.js.

### Cadre d'Application
- **Express.js** - Un framework web pour Node.js qui simplifie la création d'API et la gestion des requêtes/réponses.

### Sécurité
- **JWT (JSON Web Tokens)** - Pour l'authentification sécurisée des utilisateurs.
- **bcrypt** - Pour le hachage sécurisé des mots de passe.
- **dotenv** - Pour la gestion des variables d'environnement (comme les clés secrètes).

### Autres Bibliothèques Importantes
- **CORS** - Permet les requêtes entre différents domaines.
- **Multer** - Pour la gestion des téléchargements de fichiers.
- **Stripe** - Pour le traitement des paiements en ligne.

## 🏗 Structure du Projet

### 1. Modèles de Données
La structure des données est organisée en plusieurs modèles :
- **Utilisateur (User)** : Gère les comptes et les informations des utilisateurs.
- **Photo** : Stocke les informations sur les images téléchargées.
- **Événement (Evenement)** : Gère les événements.
- **Œuvre Graphique (OeuvreGraphique)** : Contient les détails des œuvres graphiques.
- **Paiement** : Gère les transactions financières.
- **Panier** : Suit les articles sélectionnés par les utilisateurs.
- **Tarif** : Définit les prix des différents services/objets.

### 2. Gestion des Routes
Les routes sont organisées par fonctionnalité :
- Authentification (`/auth`)
- Galerie (`/galerie`)
- Œuvres graphiques (`/oeuvres-graphique`)
- Paiements (`/stripe` et `/paiement`)
- Événements (`/evenement`)
- Panier (`/panier`)
- Tarifs (`/tarifs`)

### 3. Contrôleurs
La logique métier est séparée dans des contrôleurs qui gèrent :
- L'authentification et l'autorisation
- La gestion des fichiers (téléchargement, suppression)
- Les opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) pour chaque modèle
- L'intégration avec Stripe pour les paiements

## 🔒 Sécurité
- Les mots de passe sont hachés avant d'être stockés
- Authentification requise pour les routes sensibles
- Gestion des jetons d'accès sécurisés
- Protection contre les attaques CSRF (Cross-Site Request Forgery)
- Configuration CORS pour la sécurité des requêtes inter-domaines

## 📦 Déploiement
Le backend peut être déployé via :
- **Docker** (un Dockerfile est fourni)
- Manuellement avec Node.js et npm

## 🔄 Points d'API Principaux
- `POST /api/auth/register` - Créer un nouveau compte
- `POST /api/auth/login` - Se connecter
- `GET /api/galerie` - Obtenir la liste des éléments de la galerie
- `POST /api/oeuvres-graphique` - Ajouter une nouvelle œuvre graphique
- `POST /api/stripe/payment` - Effectuer un paiement

## 📁 Gestion des Fichiers
- Les fichiers téléchargés sont stockés dans le dossier `/uploads`
- Les chemins des fichiers sont stockés dans la base de données
- Gestion des types MIME et des tailles de fichiers

## 🔄 Intégrations Externes
- **Stripe** pour le traitement des paiements
- Services d'authentification personnalisés

## 🔍 Points Forts
- Architecture modulaire et bien organisée
- Sécurité renforcée à plusieurs niveaux
- Gestion efficace des fichiers multimédias
- API RESTful bien structurée
- Documentation claire des points d'accès

## 🚀 Perspectives d'Évolution
- Implémentation de tests automatisés
- Mise en cache pour améliorer les performances
- Mise à l'échelle horizontale possible
- Surveillance des performances et journalisation avancée

---
*Ce document a été généré automatiquement à partir de l'analyse du code source.*
