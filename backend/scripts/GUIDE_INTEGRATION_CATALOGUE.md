# Guide d'intégration du Catalogue dans la structure Picto

## Vue d'ensemble

Ce guide explique comment intégrer les tarifs de ton catalogue Excel dans ta base de données Picto existante.

## Structure actuelle de ta BD

Ta base de données utilise le format **Picto** :
```
Catégories
  └─ Produits
      └─ Supports
          └─ Formats (avec prix)
```

Exemple :
- **Tirage Photo** (catégorie)
  - **Argentique sur Lambda** (produit)
    - **RC Couleur Satiné Fuji 230g** (support)
      - 20x30 cm : 4,50€ (format)
      - 30x40 cm : 6,66€
      - etc.

## Mapping Catalogue → Picto

Voici comment les gammes de ton catalogue sont mappées vers ta structure Picto :

| Gamme Catalogue | Catégorie Picto | Produit | Support |
|----------------|-----------------|---------|---------|
| Petits formats | Tirage Photo | Argentique sur Lambda | RC Couleur Satiné Fuji 230g |
| Lambda | Tirage Photo | Argentique sur Lambda | RC Couleur Brillant Fuji 250g |
| Pigmentaire | Tirage Photo | Jet d'encre Pigmentaire | Hahnemühle Photo Rag 308g |
| Dibond | Photo Contrecollée | Contrecollage sur Dibond | Dibond 3mm |
| Plexi | Photo sous Plexi | Tirage Plexicollé | Plexi Brillant 4mm |
| Caisse Américaine | Photo Encadrée | Caisse Américaine | Bois Noir Satiné |
| Encadrement d'Art | Photo Encadrée | Cadre Nielsen Alpha | Alu Noir Mat |
| Nielsen Sur Mesure | Photo Encadrée | Cadre Nielsen Alpha | Alu Noir Mat |

## Méthode 1 : Fusion avec la BD existante (RECOMMANDÉ)

Cette méthode ajoute les tarifs du catalogue à ta configuration Picto existante sans rien écraser.

### Étape 1 : Vérifier la connexion MongoDB

Assure-toi que MongoDB est démarré et que ton `.env` backend contient :

```env
MONGO_URI=mongodb://localhost:27017/photographie
```

### Étape 2 : Installer uuid si nécessaire

```bash
cd backend
npm install uuid
```

### Étape 3 : Lancer le script de fusion

```bash
node scripts/fusionnerCatalogueAvecPicto.js
```

Le script va :
- ✅ Récupérer ta config Picto existante
- ✅ Ajouter les formats manquants du catalogue
- ✅ Créer les supports/produits/catégories si nécessaires
- ✅ Ne pas écraser les données existantes
- ✅ Sauvegarder le tout dans MongoDB

### Résultat attendu

```
🔌 Connexion à MongoDB...
✅ Connecté à MongoDB
📖 Récupération de la configuration Picto existante...
📊 Configuration actuelle: 5 catégories
📋 38 tarifs à intégrer
  ✨ Nouveau support: RC Couleur Brillant Fuji 250g
    ✨ Format ajouté: 50×75
    ✨ Format ajouté: 60×90
...
✅ Fusion terminée avec succès!
📊 Résumé:
  - 0 catégories ajoutées
  - 0 produits ajoutés
  - 3 supports ajoutés
  - 38 formats ajoutés
```

## Méthode 2 : Conversion en fichier JSON Picto

Si tu veux d'abord voir le résultat avant de l'importer :

```bash
node scripts/convertCatalogueVersPicto.js
```

Cela génère : `photographie/src/data/catalogue-picto-format.json`

Tu peux ensuite :
1. Examiner le fichier généré
2. L'importer manuellement via l'interface admin
3. Ou utiliser le script de fusion

## Vérification dans MongoDB

Pour vérifier que les données sont bien intégrées :

```bash
mongosh photographie
```

Puis :

```javascript
// Compter les configurations
db.tariffconfigs.countDocuments()

// Voir la dernière config
db.tariffconfigs.findOne({}, { sort: { createdAt: -1 } })

// Compter les formats dans toutes les catégories
db.tariffconfigs.aggregate([
  { $unwind: "$categories" },
  { $unwind: "$categories.products" },
  { $unwind: "$categories.products.supports" },
  { $unwind: "$categories.products.supports.formats" },
  { $count: "totalFormats" }
])
```

## Personnalisation du mapping

Si tu veux changer le mapping des gammes, édite le fichier :
`backend/scripts/fusionnerCatalogueAvecPicto.js`

Modifie l'objet `mappingGammes` :

```javascript
const mappingGammes = {
  "Petits formats": {
    categoryName: "Tirage Photo",
    productName: "Argentique sur Lambda",
    supportName: "RC Couleur Satiné Fuji 230g"
  },
  // ... ajoute ou modifie les mappings
};
```

## Données ajoutées

Le script ajoute **38 tarifs** répartis ainsi :

- **Petits formats** : 5 formats (1,35€ - 10,50€)
- **Lambda** : 4 formats (52,70€ - 133,05€)
- **Pigmentaire** : 5 formats (12,65€ - 243,93€)
- **Dibond** : 5 formats (108,88€ - 435,05€)
- **Plexi** : 5 formats (161,10€ - 1004,85€)
- **Caisse Américaine** : 5 formats (243,78€ - 1120,48€)
- **Encadrement d'Art** : 5 formats (349,63€ - 1644,55€)
- **Nielsen Sur Mesure** : 4 formats (574,95€ - 895,75€)

## Informations supplémentaires stockées

Pour chaque format, le script conserve aussi :
- `coutFournisseur` : Coût d'achat TTC
- `margeNette` : Bénéfice net
- `coefficient` : 2,50 (dans technicalSpecs)

Ces infos sont dans `technicalSpecs` du support et peuvent être utilisées pour des calculs ou statistiques.

## Rollback (annuler l'import)

Si tu veux annuler l'import, tu peux :

1. **Restaurer depuis une sauvegarde** (si tu en as fait une)
2. **Supprimer manuellement** les formats ajoutés via l'interface admin
3. **Réimporter** une ancienne version de la config

## Prochaines étapes

Après l'import :
1. ✅ Vérifie dans l'interface admin (`/admin/gestion-galerie` → onglet Tarifs)
2. ✅ Teste la sélection de tarifs dans le formulaire galerie
3. ✅ Ajuste les prix si nécessaire
4. ✅ Ajoute des descriptions personnalisées aux supports

## Support

En cas de problème :
- Vérifie les logs du script
- Vérifie que MongoDB est bien démarré
- Vérifie que le fichier `catalogue-tarifs.json` existe
- Vérifie les permissions d'accès à la base de données
