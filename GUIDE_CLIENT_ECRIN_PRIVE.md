# 📸 Guide Client - Écrin Privé

## 🎯 Pour qui ?

Ce guide est destiné à **l'administrateur du site** (photographe) qui souhaite partager des photos originales haute résolution avec ses clients, sans utiliser de ligne de commande.

---

## ✨ Qu'est-ce que l'Écrin Privé ?

L'**Écrin Privé** permet de :
- ✅ Partager des photos originales haute résolution avec vos clients
- ✅ Contrôler qui peut télécharger (code d'accès unique)
- ✅ Définir des limites de téléchargements
- ✅ Fixer une date d'expiration (optionnel)
- ✅ Remplacer Jingoo pour **~1€/an** au lieu d'un abonnement mensuel

---

## 📋 Étapes simples

### 1️⃣ Créer un accès privé

1. Connectez-vous à votre espace admin
2. Allez sur **Gestion Galerie** → Onglet **"Accès Privé"**
3. Remplissez le formulaire :

   **Informations de base :**
   - **Titre** : Ex. "Shooting Mariage Dupont - Juillet 2024"
   - **Description** : Message pour le client
   - **Dates** : Dates du shooting
   - **Image de couverture** : Photo de présentation (optionnel)
   - **Lieu** : Lieu du shooting (optionnel)

   **Code d'accès :**
   - **Code unique** : Ex. "MARIAGE-DUPONT-2024"
   - ⚠️ Le client utilisera ce code pour se connecter
   - 💡 Utilisez un code facile à retenir mais unique

   **Client :**
   - **Email du client** : Tapez l'email d'un client existant
   - OU cliquez sur "Créer un nouveau client"

   **Validité de l'accès :**
   - **Permanent** : Accès illimité dans le temps
   - **Temporaire** : Choisissez une date d'expiration (ex: 30 jours)

   **Limites de téléchargement :**
   - **Illimité** : Le client peut télécharger autant qu'il veut
   - **Par photo** : Ex. 3 téléchargements max par photo
   - **Total** : Ex. 50 téléchargements max au total

4. Cliquez sur **"Créer l'accès privé"**

---

### 2️⃣ Uploader les photos originales

**IMPORTANT** : Vous devez d'abord créer l'accès privé (étape 1) avant de pouvoir uploader les photos.

1. Après avoir créé l'accès, cliquez sur **"Modifier"** dans la liste
2. Descendez jusqu'à la section **"Photos Originales (R2)"**
3. Cliquez sur **"Sélectionner photos"**
4. Choisissez vos photos originales haute résolution (JPG, PNG, RAW, CR2, NEF, etc.)
5. Les photos apparaissent dans la liste avec leur nom et taille
6. Cliquez sur **"Uploader vers R2"**
7. ⏳ Attendez que l'upload se termine (barre de progression visible)
8. ✅ Les photos sont maintenant disponibles pour le client !

**💡 Astuces :**
- Vous pouvez uploader plusieurs fois (les photos s'ajoutent)
- Vous pouvez uploader des photos très lourdes (jusqu'à 500 MB par fichier)
- L'upload se fait directement depuis votre navigateur
- Si vous fermez la page pendant l'upload, recommencez simplement

---

### 3️⃣ Envoyer le code au client

Envoyez un email à votre client avec :

```
Bonjour [Nom du client],

Vos photos du shooting [Titre] sont maintenant disponibles en haute résolution !

🔗 Lien : https://votre-site.com/ecrin-prive
🔑 Code d'accès : MARIAGE-DUPONT-2024

Vous pourrez télécharger vos photos originales directement depuis ce lien.

[Informations sur les limites si configurées]

Cordialement,
[Votre nom]
```

---

### 4️⃣ Le client télécharge ses photos

Le client :
1. Va sur `https://votre-site.com/ecrin-prive`
2. Entre son code d'accès
3. Voit toutes ses photos originales
4. Clique sur **"Télécharger l'original"** pour chaque photo
5. Le téléchargement démarre automatiquement

---

## 🔧 Gérer les accès existants

### Modifier un accès

1. Allez sur **Gestion Galerie** → **Accès Privé**
2. Cliquez sur **"Modifier"** sur l'accès souhaité
3. Modifiez les informations
4. Ajoutez des photos supplémentaires si besoin
5. Cliquez sur **"Enregistrer les modifications"**

### Supprimer un accès

1. Cliquez sur **"Supprimer"**
2. Confirmez la suppression
3. ⚠️ Les photos restent sur le serveur (elles ne sont pas supprimées automatiquement)

### Voir les statistiques

Dans la liste des accès, vous pouvez voir :
- Nombre de photos originales uploadées
- Nombre de téléchargements effectués
- Statut de l'accès (actif/expiré)

---

## ❓ Questions fréquentes

### Combien de photos puis-je uploader ?

Autant que vous voulez ! Le stockage coûte ~0.015$/GB/mois.
Pour 100 GB de photos : ~1.50$/mois.

### Quelle est la taille maximale par photo ?

500 MB par fichier. Si vous avez des fichiers plus gros, contactez-moi.

### Les photos sont-elles sécurisées ?

Oui ! 
- Stockage privé sur Cloudflare R2
- Accès uniquement par code unique
- Liens de téléchargement valides 5 minutes seulement
- Logs de tous les téléchargements

### Puis-je changer le code d'accès ?

Oui, modifiez l'accès et changez le code. Pensez à prévenir le client.

### Que se passe-t-il si le client dépasse la limite ?

Il ne pourra plus télécharger. Vous pouvez augmenter la limite en modifiant l'accès.

### Le client peut-il voir les photos avant de télécharger ?

Pour l'instant non, il voit uniquement le nom du fichier. Une prévisualisation pourra être ajoutée plus tard.

### Puis-je supprimer une photo spécifique ?

Pour l'instant non. Vous devez supprimer tout l'accès et le recréer. Cette fonctionnalité sera ajoutée prochainement.

---

## 🆘 Problèmes courants

### "Erreur lors de l'upload"

- Vérifiez votre connexion internet
- Vérifiez que le format de fichier est supporté
- Réessayez avec moins de photos à la fois

### "Code d'accès invalide" (client)

- Vérifiez que le code est correct (majuscules/minuscules)
- Vérifiez que l'accès n'a pas expiré
- Vérifiez que l'accès n'est pas suspendu

### "Limite atteinte" (client)

- Le client a atteint sa limite de téléchargements
- Augmentez la limite ou créez un nouvel accès

---

## 💰 Coûts

### Stockage Cloudflare R2

- **10 GB gratuits**
- Ensuite : **0.015$/GB/mois**
- **Bande passante (téléchargements) : GRATUITE**

### Exemples

| Volume | Coût mensuel | Coût annuel |
|--------|--------------|-------------|
| 15 GB | 0.075$ | ~1€ |
| 50 GB | 0.60$ | ~7€ |
| 100 GB | 1.35$ | ~16€ |

**Comparaison avec Jingoo :**
- Jingoo : ~10-20€/mois = 120-240€/an
- Écrin Privé (50 GB) : ~7€/an

**Économie : ~95% !** 🎉

---

## ✅ Checklist avant de partager avec un client

- [ ] Accès privé créé avec toutes les informations
- [ ] Code d'accès unique et facile à retenir
- [ ] Photos originales uploadées avec succès
- [ ] Limites de téléchargement configurées (si souhaité)
- [ ] Date d'expiration définie (si souhaité)
- [ ] Email envoyé au client avec le code et le lien
- [ ] Test effectué : connexion avec le code et téléchargement d'une photo

---

## 📞 Besoin d'aide ?

Si vous rencontrez un problème :
1. Vérifiez ce guide
2. Vérifiez la documentation technique (`ECRIN_PRIVE_README.md`)
3. Contactez votre développeur

---

**Profitez de l'Écrin Privé pour partager vos plus belles photos avec vos clients ! 📸✨**
