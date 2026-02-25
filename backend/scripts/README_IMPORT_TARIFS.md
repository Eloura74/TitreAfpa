# Import des Tarifs du Catalogue

Ce guide explique comment importer les tarifs du catalogue Excel dans la base de données MongoDB.

## Fichiers créés

1. **`photographie/src/data/catalogue-tarifs.json`** : Données du catalogue en format JSON
2. **`backend/models/CatalogueTarif.js`** : Modèle MongoDB pour les tarifs
3. **`backend/routes/catalogueTarifs.js`** : Routes API pour gérer les tarifs
4. **`backend/scripts/importCatalogueTarifs.js`** : Script d'import

## Structure des données

Chaque tarif contient :
- `gamme` : Type de tirage (Petits formats, Lambda, Pigmentaire, Dibond, Plexi, Caisse Américaine, Encadrement d'Art, Nielsen Sur Mesure)
- `format` : Dimensions (10×15, 20×30, 50×75, etc.)
- `coutFournisseurTTC` : Coût d'achat TTC
- `coefficient` : Multiplicateur (2,50)
- `prixSite` : Prix de vente final
- `netApresURSSAF` : Montant net après charges
- `margeNette` : Bénéfice net

## Étapes d'import

### 1. Vérifier la connexion MongoDB

Assure-toi que MongoDB est démarré et que la variable d'environnement `MONGO_URI` est configurée dans ton fichier `.env` :

```env
MONGO_URI=mongodb://localhost:27017/photographie
```

### 2. Lancer le script d'import

Depuis le dossier `backend` :

```bash
node scripts/importCatalogueTarifs.js
```

Le script va :
- Se connecter à MongoDB
- Supprimer les anciennes données (si elles existent)
- Importer les 38 tarifs du catalogue
- Afficher un résumé par gamme

### 3. Ajouter la route dans le serveur

Ouvre `backend/server.js` (ou `app.js`) et ajoute :

```javascript
const catalogueTarifsRoutes = require('./routes/catalogueTarifs');

// Après les autres routes
app.use('/api/catalogue-tarifs', catalogueTarifsRoutes);
```

### 4. Redémarrer le serveur backend

```bash
npm run dev
```

## Utilisation de l'API

### Récupérer tous les tarifs
```
GET http://localhost:5000/api/catalogue-tarifs
```

### Récupérer les gammes disponibles
```
GET http://localhost:5000/api/catalogue-tarifs/gammes
```

### Récupérer les tarifs d'une gamme
```
GET http://localhost:5000/api/catalogue-tarifs/gamme/Lambda
```

### Créer un nouveau tarif (admin)
```
POST http://localhost:5000/api/catalogue-tarifs
Content-Type: application/json

{
  "gamme": "Lambda",
  "format": "70×100",
  "coutFournisseurTTC": 45.00,
  "coefficient": 2.50,
  "prixSite": 112.50,
  "netApresURSSAF": 86.25,
  "margeNette": 41.25
}
```

### Mettre à jour un tarif (admin)
```
PUT http://localhost:5000/api/catalogue-tarifs/:id
```

### Supprimer un tarif (admin)
```
DELETE http://localhost:5000/api/catalogue-tarifs/:id
```

## Vérification dans MongoDB

Pour vérifier que les données sont bien importées :

```bash
mongosh photographie
db.cataloguetarifs.find().pretty()
db.cataloguetarifs.countDocuments()
```

## Résumé des tarifs importés

- **Petits formats** : 5 formats (1,35€ - 10,50€)
- **Lambda** : 4 formats (52,70€ - 133,05€)
- **Pigmentaire** : 5 formats (12,65€ - 243,93€)
- **Dibond** : 5 formats (108,88€ - 435,05€)
- **Plexi** : 5 formats (161,10€ - 1004,85€)
- **Caisse Américaine** : 5 formats (243,78€ - 1120,48€)
- **Encadrement d'Art** : 5 formats (349,63€ - 1644,55€)
- **Nielsen Sur Mesure** : 4 formats (574,95€ - 895,75€)

**Total : 38 tarifs**

## Prochaines étapes

1. **Intégrer dans le frontend** : Créer un composant pour afficher et gérer ces tarifs
2. **Lier avec les photos** : Permettre d'associer des tarifs aux photos de la galerie
3. **Calculateur de prix** : Utiliser ces tarifs pour calculer automatiquement les prix
