# 📝 Questionnaire pour l'Entretien de Titre Professionnel

## Partie 1 : Présentation du Projet (20 minutes)

### 1.1 Contexte et Objectifs
**Q1 : Peux-tu nous présenter ton projet en quelques phrases ?**
**R :** Mon projet est une plateforme complète pour un photographe/graphiste, permettant de présenter son travail, gérer des événements et vendre des œuvres en ligne. Il comprend une galerie photo, une boutique en ligne, un système de réservation et un espace d'administration.

**Q2 : Quels sont les objectifs principaux de cette application ?**
**R :** Les objectifs sont :
- Présenter professionnellement les œuvres photographiques et graphiques
- Permettre la vente en ligne d'œuvres et de prestations
- Faciliter la gestion des événements et réservations
- Offrir une expérience utilisateur fluide et réactive

## Partie 2 : Backend - Technique (30 minutes)

### 2.1 Architecture et Technologies
**Q3 : Peux-tu expliquer ton architecture backend ?**
**R :** J'ai utilisé une architecture MVC avec :
- Node.js et Express pour le serveur
- MongoDB avec Mongoose pour la base de données
- JWT pour l'authentification
- Multer pour la gestion des uploads
- Structure modulaire avec séparation des préoccupations

**Q4 : Comment as-tu implémenté l'authentification ?**
**R :** J'ai mis en place :
- Un système JWT avec tokens d'accès
- Hachage des mots de passe avec bcrypt
- Middleware d'authentification pour protéger les routes
- Gestion des rôles (admin/user)
- Sécurisation contre les attaques CSRF

### 2.2 Gestion des Données
**Q5 : Peux-tu expliquer ton modèle de données ?**
**R :** J'ai conçu plusieurs modèles :
- **User** : Gestion des comptes (email, mot de passe hashé, rôle)
- **Photo** : Stockage des images de la galerie
- **OeuvreGraphique** : Gestion des créations graphiques
- **Evenement** : Organisation des événements
- **Panier** : Gestion des commandes
- **Paiement** : Suivi des transactions
- **Tarif** : Gestion des prix

**Q6 : Comment gères-tu les relations entre les modèles ?**
**R :** J'utilise les références Mongoose :
- Références par ID pour les relations un-à-plusieurs
- Tableaux de références pour les relations plusieurs-à-plusieurs
- Population des données liées avec `.populate()`
- Indexation pour les performances

## Partie 3 : Frontend - Technique (30 minutes)

### 3.1 Architecture Frontend
**Q7 : Quelle est la structure de ton application frontend ?**
**R :** J'ai organisé le frontend avec :
- React avec TypeScript
- React Router pour la navigation
- Context API pour l'état global (panier, authentification)
- Composants réutilisables
- Structure par fonctionnalités

**Q8 : Comment gères-tu l'état de l'application ?**
**R :** J'utilise :
- Le state local pour les composants simples
- Context API pour l'état global (panier, utilisateur)
- Des requêtes HTTP avec Axios vers l'API
- Gestion des erreurs et des états de chargement

### 3.2 Fonctionnalités Clés
**Q9 : Peux-tu expliquer comment fonctionne la galerie photo ?**
**R :** La galerie permet de :
- Afficher les photos par catégories
- Voir les détails d'une photo
- Pour les admins : ajouter/modifier/supprimer des photos
- Gestion des métadonnées (titre, description, prix)

**Q10 : Comment as-tu implémenté le panier d'achat ?**
**R :** Le panier utilise :
- Un contexte React pour gérer l'état global
- Stockage local pour la persistance
- Calcul des totaux en temps réel
- Gestion des quantités et des suppressions
- Validation des commandes

## Partie 4 : Sécurité et Bonnes Pratiques (20 minutes)

### 4.1 Sécurité
**Q11 : Comment sécurises-tu les données sensibles ?**
**R :** J'ai implémenté :
- Hachage des mots de passe avec bcrypt
- Protection des routes sensibles avec JWT
- Validation des entrées utilisateur
- Gestion sécurisée des uploads de fichiers
- Variables d'environnement pour les données sensibles

**Q12 : Comment gères-tu les autorisations ?**
**R :** J'utilise :
- Un système de rôles (admin/user)
- Des middlewares pour vérifier les permissions
- Protection des routes sensibles
- Vérification côté serveur de toutes les actions critiques

### 4.2 Bonnes Pratiques
**Q13 : Quelles bonnes pratiques as-tu appliquées ?**
**R :** J'ai suivi :
- Le principe de séparation des préoccupations
- La validation des données côté serveur
- La gestion propre des erreurs
- Un code documenté et commenté
- Des conventions de nommage claires

## Partie 5 : Déploiement et Maintenance (15 minutes)

### 5.1 Déploiement
**Q14 : Comment as-tu configuré le déploiement ?**
**R :** J'ai mis en place :
- Une configuration Docker pour le backend
- Des variables d'environnement
- Une documentation de déploiement
- Une stratégie de sauvegarde des données

**Q15 : Comment gères-tu les mises à jour ?**
**R :** Ma stratégie inclut :
- Un contrôle de version avec Git
- Des tests manuels avant déploiement
- Une documentation des changements
- Une stratégie de rollback

## Partie 6 : Analyse et Améliorations (20 minutes)

### 6.1 Points Forts
**Q16 : Quels sont les points forts de ton application ?**
**R :** Les points forts sont :
- Une architecture modulaire et maintenable
- Une interface utilisateur réactive
- Une gestion complète du cycle de vie des données
- Une bonne sécurisation
- Une expérience utilisateur fluide

### 6.2 Axes d'Amélioration
**Q17 : Quelles améliorations envisages-tu ?**
**R :** Je prévois :
- L'ajout de tests automatisés
- L'optimisation des performances
- L'ajout de fonctionnalités (recherche avancée, filtres)
- L'amélioration de l'accessibilité
- Le passage à TypeScript côté backend

## Conseils pour l'Entretien

1. **Préparation**
   - Maîtrise ton code sur le bout des doigts
   - Prépare des exemples concrets
   - Sois prêt à expliquer tes choix techniques

2. **Démonstration**
   - Montre les fonctionnalités clés
   - Explique les défis rencontrés
   - Sois honnête sur les limites

3. **Attitude**
   - Reste calme et professionnel
   - Écoute attentivement les questions
   - Sois ouvert aux retours

4. **Questions techniques**
   - Sois précis dans tes réponses
   - Utilise le vocabulaire technique approprié
   - Montre ta compréhension des concepts

Bonne chance pour ton entretien ! 🚀
