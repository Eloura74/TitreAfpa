# Arborescence du Projet Fabien Licata

```
ProjetStage/
│
├── backend/                      # Dossier du backend
│   ├── controllers/              # Contrôleurs
│   │   ├── evenementController.js
│   │   ├── paiementController.js
│   │   └── panierController.js
│   │
│   ├── middleware/               # Middlewares
│   │   ├── auth.js
│   │   └── isAdmin.js
│   │
│   ├── models/                   # Modèles Mongoose
│   │   ├── Evenement.js
│   │   ├── OeuvreGraphique.js
│   │   ├── Paiement.js
│   │   ├── Panier.js
│   │   ├── Photo.js
│   │   ├── Tarif.js
│   │   └── User.js
│   │
│   ├── routes/                   # Routes API
│   │   ├── auth.js
│   │   ├── evenement.js
│   │   ├── galerie.js
│   │   ├── oeuvresGraphique.js
│   │   ├── paiement.js
│   │   ├── panier.js
│   │   ├── stripe.js
│   │   └── tarifs.js
│   │
│   ├── uploads/                  # Fichiers uploadés
│   ├── Dockerfile
│   ├── insertTestDocs.js
│   ├── package.json
│   └── server.js
│
├── photographie/                 # Dossier du frontend (React)
│   ├── public/                   # Fichiers statiques
│   │   └── images/               # Images du site
│   │
│   └── src/
│       ├── components/           # Composants réutilisables
│       │   ├── galerie/         # Composants de la galerie
│       │   ├── layout/          # Mise en page
│       │   └── panier/          # Composants du panier
│       │
│       ├── pages/               # Pages de l'application
│       │   ├── About.tsx
│       │   ├── Auth.tsx
│       │   ├── Checkout.tsx
│       │   ├── Evenements.tsx
│       │   ├── Galerie.tsx
│       │   ├── GestionGalerie.tsx
│       │   └── Panier.tsx
│       │
│       ├── services/            # Services API
│       ├── store/               # Gestion d'état
│       ├── styles/              # Feuilles de style
│       ├── types/               # Types TypeScript
│       ├── App.tsx
│       └── main.tsx
│
├── Notes/                       # Documentation
│   ├── arborescence.md          # Ce fichier
│   ├── merise.md
│   ├── projetFABER.md
│   ├── questionBase.md
│   ├── questionnaireEntretien.md
│   └── userStory.md
│
├── docker-compose.yml           # Configuration Docker
├── package.json
└── README.md
```

## Légende

- **Dossiers principaux** : En gras
- **Fichiers importants** : En vert
- **Fichiers de configuration** : En bleu
- **Documentation** : En jaune

## Structure détaillée des dossiers clés

### Backend
- `controllers/` : Gère la logique métier
- `models/` : Définit les schémas de données
- `routes/` : Définit les points d'API
- `middleware/` : Gère l'authentification et les autorisations

### Frontend (photographie/)
- `components/` : Composants réutilisables
- `pages/` : Pages de l'application
- `services/` : Appels API
- `store/` : Gestion d'état (context, redux, etc.)
- `styles/` : Feuilles de style globales

### Notes
- Contient la documentation du projet
- Inclut les spécifications techniques
- Garde une trace des décisions importantes