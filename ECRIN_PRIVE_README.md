# 🎁 Écrin Privé - Documentation complète

## 📋 Vue d'ensemble

L'**Écrin Privé** est un système sécurisé permettant aux clients de télécharger leurs photos originales haute résolution (15 GB) stockées sur **Cloudflare R2**.

### ✨ Fonctionnalités

- ✅ **Stockage sécurisé** : Photos originales sur Cloudflare R2 (bucket privé)
- ✅ **Accès par code unique** : Chaque client reçoit un code d'accès personnel
- ✅ **URL signées temporaires** : Liens de téléchargement valides 5 minutes
- ✅ **Limites configurables** : Contrôle des téléchargements (illimité, par photo, ou total)
- ✅ **Validité temporaire ou permanente** : Accès avec ou sans date d'expiration
- ✅ **Interface admin complète** : Gestion depuis `/admin/gestion-galerie` (onglet Accès Privé)
- ✅ **Logs complets** : Suivi de tous les téléchargements
- ✅ **Coût minimal** : ~1€/an pour 15 GB

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel)                      │
│  - /ecrin-prive (login + galerie)       │
│  - /admin/gestion-galerie (config)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Backend API (Vercel)                   │
│  - POST /api/ecrin/login                │
│  - GET  /api/ecrin/session              │
│  - POST /api/ecrin/generate-download-url│
│  - POST /api/ecrin/logout               │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  MongoDB       │  │  Cloudflare R2  │
│  - AccesPrive  │  │  - Originaux    │
│  - Métadonnées │  │    15 GB        │
│  - Logs        │  │  - URL signées  │
└────────────────┘  └─────────────────┘
```

---

## 📂 Fichiers créés/modifiés

### Backend

- ✅ `backend/models/AccesPrive.js` - Modèle étendu avec champs R2
- ✅ `backend/routes/ecrin.js` - Routes API pour l'écrin privé
- ✅ `backend/scripts/uploadToR2.js` - Script d'upload des photos vers R2
- ✅ `backend/server.js` - Route écrin activée

### Frontend

- ✅ `photographie/src/pages/EcrinPrive.tsx` - Page client (login + galerie)
- ✅ `photographie/src/components/admin/acces-prive/PrivateAccessForm.tsx` - Formulaire admin étendu
- ✅ `photographie/src/components/GestionAccesPrive.tsx` - Gestion admin mise à jour
- ✅ `photographie/src/types/evenement.ts` - Types TypeScript étendus
- ✅ `photographie/src/App.tsx` - Route `/ecrin-prive` ajoutée

### Documentation

- ✅ `CONFIGURATION_R2.md` - Guide complet de configuration Cloudflare R2
- ✅ `ECRIN_PRIVE_README.md` - Ce fichier

---

## 🚀 Mise en place (étapes)

### 1️⃣ Configuration Cloudflare R2

Suivre le guide complet : **[CONFIGURATION_R2.md](./CONFIGURATION_R2.md)**

Résumé :
1. Créer un compte Cloudflare
2. Activer R2
3. Créer un bucket privé
4. Générer les clés API
5. Ajouter les variables d'environnement sur Vercel

### 2️⃣ Installation des dépendances

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3️⃣ Créer un accès privé depuis l'admin

1. Aller sur `/admin/gestion-galerie`
2. Onglet **"Accès Privé"**
3. Remplir le formulaire :
   - **Titre** : Ex. "Shooting Mariage Dupont"
   - **Code d'accès** : Ex. "SHOOTING-2024-ABC123"
   - **Client** : Email du client
   - **Validité** : Permanent ou Temporaire (avec date d'expiration)
   - **Limites de téléchargement** :
     - Illimité
     - Par photo (ex: 3 téléchargements max par photo)
     - Total (ex: 50 téléchargements max au total)
4. Enregistrer

### 4️⃣ Upload des photos vers R2

```bash
cd backend
node scripts/uploadToR2.js /chemin/vers/photos SHOOTING-2024-ABC123
```

Le script :
- Upload toutes les photos vers R2
- Met à jour MongoDB avec les métadonnées
- Affiche la progression en temps réel
- Détecte les fichiers déjà uploadés (reprise possible)

### 5️⃣ Envoyer le code au client

Le client peut accéder à ses photos sur :
```
https://votre-domaine.com/ecrin-prive
Code d'accès : SHOOTING-2024-ABC123
```

---

## 🎯 Utilisation client

### Connexion

1. Aller sur `/ecrin-prive`
2. Entrer le code d'accès
3. Cliquer sur "Accéder à mes photos"

### Téléchargement

1. Voir la liste des photos originales
2. Cliquer sur "Télécharger l'original"
3. Le téléchargement démarre automatiquement
4. L'URL signée expire après 5 minutes

### Informations affichées

- Titre de l'accès
- Description
- Dates de l'événement
- Nombre de photos disponibles
- Validité de l'accès (permanent ou date d'expiration)
- Limites de téléchargements (si configurées)
- Compteur de téléchargements

---

## 🔐 Sécurité

### ✅ Protections en place

1. **Bucket privé** : Aucun accès public direct
2. **URL signées** : Expiration automatique après 5 minutes
3. **Authentification** : Code d'accès unique par client
4. **Limites configurables** : Contrôle des téléchargements
5. **Logs complets** : Traçabilité de tous les téléchargements
6. **Session sécurisée** : Authentification côté serveur

### ❌ Ce qui n'est PAS possible

- ❌ Accéder aux photos sans code d'accès
- ❌ Réutiliser une URL signée expirée
- ❌ Dépasser les limites de téléchargements configurées
- ❌ Accéder après la date d'expiration (si temporaire)

---

## 📊 Gestion admin

### Créer un accès privé

1. `/admin/gestion-galerie` → Onglet "Accès Privé"
2. Remplir le formulaire
3. Choisir les paramètres de validité et limites
4. Enregistrer
5. Uploader les photos avec le script

### Modifier un accès privé

1. Cliquer sur "Modifier" dans la liste
2. Modifier les champs souhaités
3. Enregistrer

### Supprimer un accès privé

1. Cliquer sur "Supprimer"
2. Confirmer
3. ⚠️ Les photos restent sur R2 (à supprimer manuellement si besoin)

### Voir les statistiques

- Nombre de téléchargements par photo
- Nombre de téléchargements total
- Date du dernier téléchargement

---

## 💰 Coûts

### Cloudflare R2 (15 GB)

- **Stockage** : 10 GB gratuit + 5 GB × 0.015$/GB = 0.075$/mois
- **Egress (bande passante)** : GRATUIT (illimité)
- **Requêtes API** : 1M gratuit/mois (largement suffisant)

**Total : ~1€/an** 🎉

### Comparaison avec Jingoo

| Critère | Jingoo | Écrin Privé |
|---------|--------|-------------|
| Coût | Abonnement mensuel | ~1€/an |
| Contrôle | Limité | Total |
| Branding | Jingoo | Votre site |
| Données | Chez eux | Chez vous |
| Limites | Selon plan | Configurables |

---

## 🆘 Dépannage

### Client ne peut pas se connecter

- Vérifier que le code d'accès est correct (majuscules)
- Vérifier que l'accès n'a pas expiré
- Vérifier le statut de l'accès (actif/expiré/suspendu)

### Erreur "Limite atteinte"

- Vérifier les limites configurées
- Augmenter la limite si nécessaire
- Ou créer un nouvel accès

### Téléchargement échoue

- Vérifier que le fichier existe sur R2
- Vérifier les clés API R2
- Vérifier les logs Vercel

### Upload vers R2 échoue

- Vérifier les variables d'environnement
- Vérifier les permissions du token R2
- Vérifier la connexion internet
- Relancer le script (détection automatique des fichiers déjà uploadés)

---

## 📈 Évolutions futures possibles

- [ ] Téléchargement ZIP d'un album complet
- [ ] Watermark dynamique optionnel
- [ ] Notifications email lors des téléchargements
- [ ] Interface client avec galerie miniatures
- [ ] Partage de photos individuelles
- [ ] Commentaires clients sur les photos
- [ ] Sélection de photos favorites
- [ ] Intégration paiement pour photos supplémentaires

---

## ✅ Checklist de déploiement

Avant de mettre en production :

- [ ] Cloudflare R2 configuré
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Dépendances installées
- [ ] Test de connexion R2 réussi
- [ ] Premier accès privé créé
- [ ] Photos test uploadées
- [ ] Test de téléchargement réussi
- [ ] Limites testées
- [ ] Expiration testée (si temporaire)
- [ ] Documentation envoyée au client

---

## 📞 Support

En cas de problème :

1. Consulter `CONFIGURATION_R2.md`
2. Vérifier les logs Vercel
3. Vérifier le dashboard Cloudflare R2
4. Vérifier MongoDB (collection `accesPrives`)

---

**L'Écrin Privé est prêt à remplacer Jingoo ! 🎉**

**Coût : ~1€/an au lieu d'un abonnement mensuel**
**Contrôle : 100% chez vous**
**Sécurité : Maximale**
