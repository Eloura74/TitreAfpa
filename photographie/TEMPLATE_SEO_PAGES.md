# 📝 Template SEO pour les pages restantes

Ce fichier contient des exemples prêts à copier pour ajouter le SEO sur toutes les pages.

---

## 🎨 Photographie.tsx

```tsx
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";

// Dans le return() :
<SEO
  title="Photographie d'Art - Portfolio"
  description="Explorez mon univers photographique : paysages, portraits, street photography, architecture. Chaque cliché raconte une histoire unique. Tirages d'art disponibles."
  image="/images/photographie-preview.jpg"
  type="website"
  keywords={[
    'photographie art',
    'portfolio photo',
    'paysage',
    'portrait',
    'photographe',
    'Fabien Licata'
  ]}
  schema={{
    ...photographerSchema,
    ...createBreadcrumbSchema([
      { name: 'Accueil', url: 'https://titre-afpa.vercel.app/' },
      { name: 'Photographie', url: 'https://titre-afpa.vercel.app/photographie' }
    ])
  }}
/>
```

---

## 🎨 Graphisme.tsx

```tsx
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";

<SEO
  title="Photo-Graphisme - Design & Identité Visuelle"
  description="Création graphique et design visuel : logos, identités de marque, affiches, retouche photo artistique. Du concept à la réalisation, donnez vie à votre image."
  image="/images/graphisme-preview.jpg"
  type="website"
  keywords={[
    'graphisme',
    'design graphique',
    'identité visuelle',
    'logo',
    'création graphique',
    'photo-graphisme',
    'Fabien Licata'
  ]}
  schema={{
    ...photographerSchema,
    ...createBreadcrumbSchema([
      { name: 'Accueil', url: 'https://titre-afpa.vercel.app/' },
      { name: 'Graphisme', url: 'https://titre-afpa.vercel.app/graphisme' }
    ])
  }}
/>
```

---

## 📅 Evenements.tsx

```tsx
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";

<SEO
  title="Événements - Reportages Photo"
  description="Photographe d'événements : mariages, baptêmes, anniversaires, soirées d'entreprise. Capturer vos moments précieux avec créativité et professionnalisme."
  image="/images/evenements-preview.jpg"
  type="website"
  keywords={[
    'photographe événement',
    'reportage photo',
    'mariage',
    'baptême',
    'anniversaire',
    'événement entreprise',
    'Fabien Licata'
  ]}
  schema={{
    ...photographerSchema,
    ...createBreadcrumbSchema([
      { name: 'Accueil', url: 'https://titre-afpa.vercel.app/' },
      { name: 'Événements', url: 'https://titre-afpa.vercel.app/evenements' }
    ])
  }}
/>
```

---

## 🖼️ GalerieGraphique.tsx

```tsx
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";

<SEO
  title="Galerie Graphique - Créations Design"
  description="Découvrez mes créations graphiques : identités visuelles, affiches, retouches artistiques. Un univers où photographie et design se rencontrent."
  image="/images/galerie-graphique-preview.jpg"
  type="website"
  keywords={[
    'galerie graphique',
    'création design',
    'affiche',
    'identité visuelle',
    'graphisme',
    'Fabien Licata'
  ]}
  schema={{
    ...photographerSchema,
    ...createBreadcrumbSchema([
      { name: 'Accueil', url: 'https://titre-afpa.vercel.app/' },
      { name: 'Galerie Graphique', url: 'https://titre-afpa.vercel.app/galerie-graphique' }
    ])
  }}
/>
```

---

## 📄 ServiceDetail.tsx (Page individuelle service)

```tsx
import SEO from "../components/SEO";
import { createServiceSchema, createBreadcrumbSchema } from "../utils/schemas";

// Après avoir récupéré les données du service
const service = { 
  id: '...', 
  nom: '...', 
  description: '...',
  prix: 500,
  duree: '3 heures',
  image: '...'
};

<SEO
  title={`${service.nom} - Service Photo`}
  description={service.description}
  image={service.image || '/images/services-preview.jpg'}
  type="product"
  keywords={[
    service.nom.toLowerCase(),
    'service photo',
    'prestation photographe',
    'Fabien Licata'
  ]}
  schema={{
    ...createServiceSchema(service),
    ...createBreadcrumbSchema([
      { name: 'Accueil', url: 'https://titre-afpa.vercel.app/' },
      { name: 'Services', url: 'https://titre-afpa.vercel.app/services' },
      { name: service.nom, url: `https://titre-afpa.vercel.app/services/${service.id}` }
    ])
  }}
/>
```

---

## 🛒 Panier.tsx (NON INDEXABLE)

```tsx
import SEO from "../components/SEO";

<SEO
  title="Mon Panier"
  description="Votre panier d'achat - Fabien Licata Photographie"
  noIndex={true}
  noFollow={true}
/>
```

**Pourquoi `noIndex` ?**
- Page personnelle (contenu différent pour chaque utilisateur)
- Pas d'intérêt SEO (pas de contenu à référencer)
- Évite le duplicate content

---

## 🔐 Auth.tsx (Inscription/Connexion) - NON INDEXABLE

```tsx
import SEO from "../components/SEO";

<SEO
  title="Connexion / Inscription"
  description="Connectez-vous ou créez un compte pour accéder à vos photos privées et gérer vos commandes."
  noIndex={true}
  noFollow={true}
/>
```

---

## 👤 MonCompte.tsx - NON INDEXABLE

```tsx
import SEO from "../components/SEO";

<SEO
  title="Mon Compte"
  description="Gérez votre profil, vos commandes et accédez à vos galeries privées."
  noIndex={true}
  noFollow={true}
/>
```

---

## 💳 Checkout.tsx - NON INDEXABLE

```tsx
import SEO from "../components/SEO";

<SEO
  title="Paiement"
  description="Finalisez votre commande en toute sécurité."
  noIndex={true}
  noFollow={true}
/>
```

---

## 📧 VerifyEmail.tsx - NON INDEXABLE

```tsx
import SEO from "../components/SEO";

<SEO
  title="Vérification Email"
  description="Vérification de votre adresse email en cours."
  noIndex={true}
  noFollow={true}
/>
```

---

## 🔐 Pages Admin - TOUTES NON INDEXABLES

Pour toutes les pages admin (`/admin/*`, `GestionGalerie`, etc.) :

```tsx
import SEO from "../components/SEO";

<SEO
  title="Administration"
  description="Panneau d'administration"
  noIndex={true}
  noFollow={true}
/>
```

---

## 🎯 Checklist par page

Avant de valider une page :

- [ ] Import de `SEO` en haut du fichier
- [ ] Import de `photographerSchema` et/ou schemas spécifiques
- [ ] Balise `<SEO>` ajoutée avant `<Navbar>` ou au début du JSX
- [ ] `title` unique et descriptif (50-60 caractères)
- [ ] `description` unique et engageante (150-160 caractères)
- [ ] `image` preview pertinente (1200x630px)
- [ ] `keywords` pertinents (5-10 mots-clés)
- [ ] `schema` approprié (photographer, service, breadcrumb)
- [ ] `noIndex: true` si page privée/admin
- [ ] Testé sur [Google Rich Results](https://search.google.com/test/rich-results)

---

## 📏 Bonnes pratiques Title & Description

### Title (50-60 caractères)
✅ BON : "Photographie de Mariage - Fabien Licata"
❌ MAUVAIS : "Page photographie mariage du site de Fabien Licata photographe professionnel"

### Description (150-160 caractères)
✅ BON : "Photographe spécialisé mariage : reportage complet, de la préparation à la soirée. Forfaits sur-mesure, livraison rapide. Devis gratuit."
❌ MAUVAIS : "Bienvenue sur ma page de photographie de mariage"

### Mots-clés (5-10 pertinents)
✅ BON : `['photographe mariage', 'reportage mariage', 'photographe Lyon', 'mariage professionnel']`
❌ MAUVAIS : `['photo', 'image', 'appareil', 'clic', 'site web']`

---

## 🚀 Déploiement

Après avoir ajouté le SEO sur toutes les pages :

1. **Tester localement**
   ```bash
   cd photographie
   npm run dev
   # Ouvrir http://localhost:5173
   # Faire clic droit > Afficher le code source
   # Vérifier les balises <meta> et <script type="application/ld+json">
   ```

2. **Valider Schema.org**
   - Aller sur https://search.google.com/test/rich-results
   - Tester chaque page importante
   - Corriger les erreurs remontées

3. **Tester Open Graph**
   - https://developers.facebook.com/tools/debug/
   - Entrer l'URL de chaque page
   - Vérifier l'aperçu du partage

4. **Déployer**
   ```bash
   git add .
   git commit -m "feat: Add complete SEO on all pages"
   git push
   ```

5. **Soumettre à Google**
   - Google Search Console
   - Sitemaps > Ajouter sitemap
   - Entrer : `https://votre-backend.vercel.app/api/sitemap.xml`

---

## 📊 Résultats attendus

Après 2-4 semaines :
- 📈 Trafic organique Google +200-300%
- 🔍 Apparition sur des requêtes locales ("photographe [ville]")
- 📱 Meilleur partage sur réseaux sociaux (preview attractif)
- ⭐ Rich snippets Google (étoiles, prix, horaires)
- 🗺️ Apparition Google Maps (si coordonnées GPS renseignées)

---

## 💡 Tips SEO avancés

### 1. Optimiser les images
```tsx
<img 
  src="photo.jpg" 
  alt="Photographe capturant un mariage au Château de Versailles"
  loading="lazy"
  width="800"
  height="600"
/>
```

### 2. Utiliser les balises sémantiques
```tsx
<article>
  <header>
    <h1>Titre principal</h1>
  </header>
  <section>
    <h2>Sous-titre</h2>
    <p>Contenu...</p>
  </section>
</article>
```

### 3. Ajouter des liens internes
```tsx
<Link to="/services">
  Découvrez nos <strong>prestations photo</strong>
</Link>
```

### 4. Structurer les titres H1-H6
```tsx
<h1>Titre principal (1 seul par page)</h1>
<h2>Section importante</h2>
  <h3>Sous-section</h3>
<h2>Autre section</h2>
```
