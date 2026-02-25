# 📊 Guide d'utilisation : Import des tarifs depuis Excel

## 🎯 Vue d'ensemble

Ce système permet à l'administrateur d'uploader un fichier Excel pour mettre à jour automatiquement tous les tarifs dans MongoDB Atlas (Cluster0 → test → tariffconfis).

## ✅ Fonctionnalités

- ✅ Upload de fichier Excel (.xlsx, .xls)
- ✅ Drag & drop ou sélection manuelle
- ✅ Validation automatique du fichier
- ✅ Détection et remplacement des doublons (Gamme + Format)
- ✅ Conversion automatique vers le format Picto MongoDB
- ✅ Affichage du résumé après import
- ✅ Gestion des erreurs détaillée

## 📋 Format du fichier Excel requis

### Structure attendue

```
Ligne 1 : Paramètres
Ligne 2 : Taux URSSAF | 23,30%
Ligne 3 : Coefficient global | 2,50
Ligne 4-6 : (vides)
Ligne 7 : En-têtes (Gamme/Finition | Format | Coût fournisseur TTC | Coefficient | Prix site | Net après URSSAF | Marge nette)
Ligne 8+ : Données des tarifs
```

### Colonnes requises

| Colonne | Nom | Type | Exemple |
|---------|-----|------|---------|
| A | Gamme / Finition | Texte | "Lambda" |
| B | Format | Texte | "50×75" |
| C | Coût fournisseur TTC (€) | Nombre | 21,08 |
| D | Coefficient | Nombre | 2,50 |
| E | Prix site (final) | Nombre | 52,70 |
| F | Net après URSSAF | Nombre | 40,42 |
| G | Marge nette (€) | Nombre | 19,34 |

### Gammes reconnues

Le système reconnaît automatiquement ces gammes et les mappe vers la structure Picto :

- **Petits formats** → Tirage Photo / Argentique sur Lambda / RC Couleur Satiné
- **Lambda** → Tirage Photo / Argentique sur Lambda / RC Couleur Brillant
- **Pigmentaire** → Tirage Photo / Jet d'encre Pigmentaire / Hahnemühle Photo Rag
- **Dibond** → Photo Contrecollée / Contrecollage sur Dibond / Dibond 3mm
- **Plexi** → Photo sous Plexi / Tirage Plexicollé / Plexi Brillant 4mm
- **Caisse Américaine** → Photo Encadrée / Caisse Américaine / Bois Noir Satiné
- **Encadrement d'Art** → Photo Encadrée / Cadre Nielsen Alpha / Alu Noir Mat
- **Nielsen Sur Mesure** → Photo Encadrée / Cadre Nielsen Alpha / Alu Noir Mat

## 🚀 Comment utiliser

### Étape 1 : Préparer le fichier Excel

1. Ouvre ton fichier Excel de tarifs
2. Vérifie que la structure correspond au format attendu
3. Assure-toi que :
   - Les paramètres sont en lignes 2-3
   - Les tarifs commencent à la ligne 7
   - Toutes les colonnes A-G sont remplies
   - Les prix sont des nombres (pas de texte)

### Étape 2 : Accéder à l'interface d'import

1. Connecte-toi en tant qu'admin
2. Va dans **Gestion Galerie** → Onglet **Tarifs**
3. Tu verras le composant "📊 Importer les tarifs depuis Excel" en haut de la page

### Étape 3 : Uploader le fichier

**Option A : Drag & Drop**
- Glisse ton fichier Excel dans la zone prévue
- Le fichier sera automatiquement validé

**Option B : Sélection manuelle**
- Clique sur "Parcourir les fichiers"
- Sélectionne ton fichier Excel
- Clique sur "Ouvrir"

### Étape 4 : Vérifier et importer

1. Le nom du fichier et sa taille s'affichent
2. Clique sur **"🚀 Importer les tarifs"**
3. Une barre de progression s'affiche pendant l'upload
4. Attends la fin du traitement (quelques secondes)

### Étape 5 : Vérifier le résultat

Après l'import, un résumé s'affiche :

```
✅ Import réussi !

Catégories : 5
Total formats : 38
Tarifs importés : 38
Coefficient global : 2.50
```

## 🔄 Logique de remplacement des doublons

### Détection des doublons

Un tarif est considéré comme doublon si :
- **Gamme** (colonne A) identique
- **Format** (colonne B) identique

Exemple :
```
Ancien : Lambda | 50×75 | 20,00 | 2,50 | 50,00
Nouveau : Lambda | 50×75 | 21,08 | 2,50 | 52,70
→ L'ancien est REMPLACÉ par le nouveau
```

### Comportement

- ✅ **Si doublon détecté** : Le prix et les données sont mis à jour
- ✅ **Si nouveau tarif** : Il est ajouté à la base
- ✅ **Si tarif supprimé de l'Excel** : Il reste dans la base (pas de suppression automatique)

### Remplacement complet (recommandé)

Pour un remplacement complet de tous les tarifs :

1. Supprime manuellement les collections dans MongoDB Atlas :
   - `tariffconfis`
   - `tariffconfigs` (si elle existe)

2. Upload ton fichier Excel

3. Résultat : Base de données propre avec uniquement les tarifs du fichier

## ⚠️ Gestion des erreurs

### Erreurs de validation

Le système détecte automatiquement :

- ❌ **Format de fichier invalide** : Seuls .xlsx et .xls sont acceptés
- ❌ **Fichier trop volumineux** : Taille max 5 MB
- ❌ **Gamme ou Format manquant** : Ligne X : Gamme ou Format manquant
- ❌ **Prix invalide** : Ligne X : Prix invalide pour Lambda 50×75

### Que faire en cas d'erreur ?

1. Lis le message d'erreur affiché
2. Corrige le fichier Excel selon l'indication
3. Clique sur "Réessayer"
4. Upload à nouveau le fichier corrigé

## 🔒 Sécurité

- ✅ Seuls les **administrateurs** peuvent importer des tarifs
- ✅ Validation stricte du format de fichier
- ✅ Limite de taille : 5 MB maximum
- ✅ Validation des données avant insertion dans MongoDB
- ✅ Connexion sécurisée avec credentials

## 📊 Vérification dans MongoDB Atlas

Pour vérifier que l'import a fonctionné :

1. Va sur **MongoDB Atlas**
2. Sélectionne **Cluster0** → **test** → **tariffconfis**
3. Clique sur un document
4. Vérifie la structure :

```json
{
  "_id": "...",
  "categories": [
    {
      "id": "...",
      "name": "Tirage Photo",
      "products": [
        {
          "id": "...",
          "name": "Argentique sur Lambda",
          "supports": [
            {
              "id": "...",
              "name": "RC Couleur Brillant Fuji 250g",
              "formats": [
                {
                  "id": "...",
                  "name": "50×75",
                  "price": 52.70,
                  "width": 50,
                  "height": 75,
                  "coutFournisseur": 21.08,
                  "margeNette": 19.34
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "createdAt": "2026-02-26T...",
  "updatedAt": "2026-02-26T..."
}
```

## 🛠️ Dépannage

### Le fichier ne s'upload pas

- Vérifie que tu es bien connecté en tant qu'admin
- Vérifie ta connexion internet
- Vérifie que le backend est démarré
- Vérifie que MongoDB Atlas est accessible

### Les tarifs ne s'affichent pas après import

- Rafraîchis la page (F5)
- Vérifie dans MongoDB Atlas que les données sont bien présentes
- Vérifie la console du navigateur pour des erreurs

### Message "Erreur serveur"

- Vérifie que le backend est démarré
- Vérifie les logs du backend dans le terminal
- Vérifie la connexion à MongoDB Atlas (variable MONGO_URI dans .env)

## 📝 Exemple de fichier Excel valide

Télécharge le fichier exemple : `CATALOGUE_COMPLET_TIRAGES_ET_FINITIONS.xlsx`

Structure :
```
A                    | B        | C      | D    | E       | F      | G
---------------------|----------|--------|------|---------|--------|-------
Paramètres           |          |        |      |         |        |
Taux URSSAF          | 23,30%   |        |      |         |        |
Coefficient global   | 2,50     |        |      |         |        |
                     |          |        |      |         |        |
                     |          |        |      |         |        |
Gamme / Finition     | Format   | Coût € | Coef | Prix €  | Net €  | Marge €
Petits formats       | 10×15    | 0,54   | 2,50 | 1,35    | 1,04   | 0,50
Petits formats       | 20×30    | 1,91   | 2,50 | 4,78    | 3,67   | 1,76
Lambda               | 50×75    | 21,08  | 2,50 | 52,70   | 40,42  | 19,34
Pigmentaire          | 60×90    | 54,37  | 2,50 | 135,93  | 104,26 | 49,89
...
```

## ✅ Checklist avant import

- [ ] Fichier Excel au bon format (.xlsx ou .xls)
- [ ] Paramètres en lignes 2-3
- [ ] Tarifs à partir de la ligne 7
- [ ] Toutes les colonnes A-G remplies
- [ ] Prix au format numérique (pas de texte)
- [ ] Gammes reconnues par le système
- [ ] Formats au format "XXxYY" (avec ×)
- [ ] Connexion admin active
- [ ] Backend démarré
- [ ] MongoDB Atlas accessible

## 🎉 Résultat attendu

Après un import réussi :

- ✅ Tous les tarifs du fichier Excel sont dans MongoDB Atlas
- ✅ Structure Picto correctement générée (Catégories → Produits → Supports → Formats)
- ✅ Pas de doublons (Gamme + Format unique)
- ✅ Prix à jour
- ✅ Données accessibles via l'API `/api/tarifs`
- ✅ Tarifs visibles dans le configurateur V2

## 📞 Support

En cas de problème, vérifie :
1. Les logs du backend (terminal)
2. La console du navigateur (F12)
3. La connexion MongoDB Atlas
4. Le format du fichier Excel

---

**Dernière mise à jour** : 26 février 2026
