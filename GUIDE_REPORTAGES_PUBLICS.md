# Guide - Reportages Publics avec Sélection de Formats

## 📋 Résumé de la fonctionnalité

Cette fonctionnalité permet à l'admin de créer des reportages publics où les clients peuvent :

- Voir toutes les photos sans code d'accès
- Sélectionner des formats de tirage (comme dans `/galerie`)
- Ajouter des photos au panier pour commander
- **Interdiction** de télécharger directement les images

## 🔧 Modifications apportées

### Backend

#### 1. Modèle AccesPrive (`backend/models/AccesPrive.js`)

```javascript
availableTariffIds: {
  type: [String],
  default: [],
}
```

- Ajout du champ `availableTariffIds` pour stocker les formats disponibles

### Frontend

#### 2. Interface TypeScript (`photographie/src/types/evenement.ts`)

```typescript
availableTariffIds?: string[];
```

- Ajout du champ dans l'interface `Evenement`

#### 3. Composant Admin - Sélecteur de Formats

**Nouveau fichier** : `photographie/src/components/admin/acces-prive/TariffSelectorForReportage.tsx`

- Composant de sélection hiérarchique des formats (Catégorie → Produit → Support → Format)
- Recherche et filtrage
- Sélection/désélection en masse

#### 4. Formulaire Admin (`photographie/src/components/admin/acces-prive/PrivateAccessForm.tsx`)

- Ajout d'une section conditionnelle qui s'affiche quand "Reportage Public" est coché
- Intégration du `TariffSelectorForReportage`
- Gestion du state `availableTariffIds`

#### 5. Gestionnaire Admin (`photographie/src/components/GestionAccesPrive.tsx`)

- Ajout de `handleTariffIdsChange` pour gérer la mise à jour des formats sélectionnés
- Modification de `handleChange` pour gérer correctement les checkboxes
- Ajout de `availableTariffIds: []` dans le state initial et `resetForm`

#### 6. Page Reportage Public

**Nouveau fichier** : `photographie/src/pages/ReportagePublic.tsx`

- Affichage des photos du reportage
- Galerie responsive avec lightbox
- Bouton "Commander" sur chaque photo
- Modal de sélection de format (réutilisation de `SelectionFormatModalV2`)
- Protection contre le téléchargement :
  - `onContextMenu={preventRightClick}` sur les images
  - `draggable={false}` pour empêcher le drag & drop
  - Message toast informatif

#### 7. Routing (`photographie/src/App.tsx`)

```typescript
<Route path="/reportages/:slug" element={<ReportagePublic />} />
```

- Ajout de la route dynamique pour afficher un reportage par son slug

## 🎯 Workflow complet

### Côté Admin

1. **Créer/Modifier un accès privé** dans l'onglet "Accès Privé"
2. **Cocher "Reportage Public"**
3. **Sélectionner les formats** disponibles pour la commande
   - Utiliser la recherche pour filtrer
   - Sélectionner individuellement ou en masse
   - Le compteur affiche le nombre de formats sélectionnés
4. **Uploader les photos** dans la section "Photos Originales"
5. **Enregistrer**

### Côté Client

1. **Accéder à** `/reportages`
2. **Cliquer** sur un reportage public (badge vert "Public")
3. **Naviguer** dans la galerie de photos
4. **Cliquer** sur "Commander" sur une photo
5. **Sélectionner** le format souhaité dans la modal
   - Catégorie → Produit → Support → Format
   - Voir le prix et les dimensions
   - Choisir la quantité
6. **Ajouter au panier**
7. **Procéder au paiement** via le panier

## 🔒 Sécurité

### Protection contre le téléchargement

- **Clic droit désactivé** : `onContextMenu={preventRightClick}`
- **Drag & drop désactivé** : `draggable={false}`
- **Message informatif** : Toast qui explique qu'il faut utiliser le panier
- **Attribut select-none** : Empêche la sélection du texte/image

### Vérification backend

L'API `/api/ecrin/info/:slug` vérifie que :

- Le reportage existe
- `isPublic === true`
- Sinon, redirection vers `/reportages`

## 📝 Structure des données

### Exemple de document AccesPrive avec formats

```json
{
  "_id": "...",
  "titre": "Mariage Sophie & Thomas",
  "slug": "mariage-sophie-thomas",
  "isPublic": true,
  "availableTariffIds": [
    "format-10x15-papier-photo",
    "format-20x30-papier-photo",
    "format-30x40-toile-canvas"
  ],
  "photosOriginales": [
    {
      "nom": "photo-ceremonie-01.jpg",
      "fichierR2": "https://r2.cloudflare.com/...",
      "miniature": "https://cloudinary.com/...",
      "taille": 5242880,
      "format": "image/jpeg"
    }
  ]
}
```

## 🧪 Tests à effectuer

### Test 1 : Création d'un reportage public

1. Aller dans Admin → Accès Privé
2. Créer un nouvel accès
3. Cocher "Reportage Public"
4. Vérifier que la section de sélection de formats apparaît
5. Sélectionner quelques formats
6. Sauvegarder
7. Vérifier dans MongoDB que `availableTariffIds` contient les IDs

### Test 2 : Affichage public

1. Aller sur `/reportages`
2. Vérifier que le reportage apparaît avec le badge "Public"
3. Cliquer dessus
4. Vérifier l'affichage des photos
5. Tester le lightbox (navigation, fermeture)

### Test 3 : Commande de tirages

1. Cliquer sur "Commander" sur une photo
2. Vérifier que la modal s'ouvre
3. Vérifier que seuls les formats sélectionnés par l'admin sont disponibles
4. Sélectionner un format
5. Choisir une quantité
6. Ajouter au panier
7. Vérifier que l'article apparaît dans le panier avec le bon prix

### Test 4 : Protection téléchargement

1. Essayer de faire un clic droit sur une photo
2. Vérifier qu'un toast apparaît avec le message informatif
3. Essayer de glisser-déposer une image
4. Vérifier que c'est bloqué

### Test 5 : Reportage privé

1. Créer un accès avec `isPublic: false`
2. Vérifier qu'il apparaît dans la section "Reportages Privés" sur `/reportages`
3. Vérifier qu'on ne peut pas y accéder directement via `/reportages/:slug`
4. Vérifier la redirection vers `/ecrin-prive/:slug`

## � Corrections de bugs appliquées

### Bug 1 : Reportage public affichait "pas public"

**Cause** : La route `/api/ecrin/info/:slug` utilisait `.select("titre image")` et ne retournait pas le champ `isPublic`

**Solution** : Suppression du `.select()` pour retourner tous les champs du document

### Bug 2 : Code d'accès obligatoire pour reportage public

**Cause** : Le champ `codeAcces` était `required: true` dans le modèle et le formulaire

**Solutions appliquées** :

1. **Modèle** : `codeAcces` rendu optionnel avec `required: false` et `sparse: true` pour l'index unique
2. **Formulaire** :
   - `required={!form.isPublic}` - requis uniquement si privé
   - Label et placeholder dynamiques selon `isPublic`
   - Style visuel différent (opacité réduite) quand public
   - Message d'aide explicatif

## �🐛 Points d'attention

### Lints TypeScript (non bloquants)

Quelques warnings `any` subsistent dans :

- `GestionAccesPrive.tsx` (lignes 209, 253)
- `TariffSelectorForReportage.tsx` (lignes 134, 163, 166)
- `ReportagePublic.tsx` (lignes 52, 129)

Ces warnings peuvent être corrigés en typant explicitement les objets, mais ne bloquent pas le fonctionnement.

### Dépendances useEffect

Warning React Hook dans `ReportagePublic.tsx` ligne 62 :

```typescript
useEffect(() => {
  loadReportage();
  loadTariffConfig();
}, [slug]);
```

Peut être résolu en ajoutant `loadReportage` et `loadTariffConfig` aux dépendances ou en les wrappant avec `useCallback`.

## 📦 Fichiers créés/modifiés

### Créés

- `photographie/src/components/admin/acces-prive/TariffSelectorForReportage.tsx`
- `photographie/src/pages/ReportagePublic.tsx`
- `GUIDE_REPORTAGES_PUBLICS.md` (ce fichier)

### Modifiés

- `backend/models/AccesPrive.js` - Ajout de `availableTariffIds`, `codeAcces` rendu optionnel avec `sparse: true`
- `backend/routes/ecrin.js` - Route `/info/:slug` retourne tous les champs (pas seulement titre et image)
- `photographie/src/types/evenement.ts`
- `photographie/src/components/admin/acces-prive/PrivateAccessForm.tsx` - Code d'accès optionnel si public
- `photographie/src/components/GestionAccesPrive.tsx`
- `photographie/src/App.tsx`

## ✅ Fonctionnalités implémentées

- ✅ Ajout du champ `availableTariffIds` au modèle AccesPrive
- ✅ Interface admin pour sélectionner les formats (avec recherche et sélection en masse)
- ✅ Page publique `/reportages/:slug` pour afficher un reportage
- ✅ Galerie responsive avec lightbox
- ✅ Modal de sélection de format (réutilisation du composant existant)
- ✅ Ajout au panier avec prix et formats corrects
- ✅ Protection contre le téléchargement direct (clic droit, drag & drop)
- ✅ Messages toast informatifs
- ✅ Routing et navigation

## 🚀 Prochaines étapes (optionnel)

1. **Watermark** : Ajouter un filigrane sur les images publiques
2. **Partage social** : Boutons de partage pour les reportages publics
3. **Statistiques** : Tracker les vues et les commandes par reportage
4. **SEO** : Optimiser les métadonnées pour le référencement
5. **Galerie avancée** : Filtres, tri, recherche dans le reportage
