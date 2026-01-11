// ============================================
// COMPOSANT SEO RÉUTILISABLE - META TAGS COMPLETS
// ============================================
// Composant pour gérer toutes les balises meta (SEO, Open Graph, Twitter, Schema.org)
// À utiliser sur CHAQUE page pour un référencement optimal

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  // Meta basiques (REQUIS)
  title: string; // Titre de la page (50-60 caractères recommandés)
  description: string; // Description (150-160 caractères recommandés)
  
  // Open Graph / Réseaux sociaux (OPTIONNEL mais fortement recommandé)
  image?: string; // URL complète de l'image de preview (min 1200x630px)
  imageAlt?: string; // Description de l'image pour accessibilité
  url?: string; // URL canonique de la page
  type?: 'website' | 'article' | 'product' | 'profile'; // Type de contenu
  
  // Twitter Card (OPTIONNEL)
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  // Schema.org JSON-LD (OPTIONNEL - pour référencement avancé)
  schema?: object; // Objet Schema.org personnalisé
  
  // Contrôle des robots (OPTIONNEL)
  noIndex?: boolean; // true = page non indexable par Google
  noFollow?: boolean; // true = liens non suivis par Google
  
  // Mots-clés (LEGACY mais parfois utile)
  keywords?: string[]; // Liste de mots-clés pertinents
}

/**
 * Composant SEO centralisé pour gérer toutes les balises meta
 * Gère automatiquement : title, description, Open Graph, Twitter Card, Schema.org
 * 
 * @example
 * ```tsx
 * <SEO
 *   title="Galerie Photo"
 *   description="Découvrez notre collection de photographies d'art"
 *   image="https://res.cloudinary.com/xxx/preview.jpg"
 *   type="website"
 * />
 * ```
 */
export default function SEO({
  title,
  description,
  image = '/images/logoHome.png', // Image par défaut si non fournie
  imageAlt = 'Fabien Licata Photographie',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  twitterCard = 'summary_large_image',
  schema,
  noIndex = false,
  noFollow = false,
  keywords = [],
}: SEOProps) {
  // Construction du titre complet avec le nom du site
  const fullTitle = `${title} | Fabien Licata - Photographe & Graphiste Professionnel`;
  
  // Construction de l'URL de l'image (absolue si besoin)
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `https://titre-afpa.vercel.app${image}`;
  
  // Construction des directives robots
  const robotsDirectives = [];
  if (noIndex) robotsDirectives.push('noindex');
  if (noFollow) robotsDirectives.push('nofollow');
  const robotsContent = robotsDirectives.length > 0 
    ? robotsDirectives.join(', ') 
    : 'index, follow';

  return (
    <Helmet>
      {/* ============================================ */}
      {/* META BASIQUES (SEO Fondamental) */}
      {/* ============================================ */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Mots-clés (legacy mais parfois utilisé par certains moteurs) */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Directives pour les robots d'indexation */}
      <meta name="robots" content={robotsContent} />
      
      {/* URL canonique (évite le duplicate content) */}
      <link rel="canonical" href={url} />
      
      {/* Langue du contenu */}
      <html lang="fr" />
      
      {/* ============================================ */}
      {/* OPEN GRAPH (Facebook, LinkedIn, WhatsApp) */}
      {/* ============================================ */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Fabien Licata Photographie" />
      
      {/* Dimensions recommandées de l'image (1200x630px) */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* ============================================ */}
      {/* TWITTER CARD (Twitter/X) */}
      {/* ============================================ */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      
      {/* Si vous avez un compte Twitter professionnel, décommenter : */}
      {/* <meta name="twitter:site" content="@votrecompte" /> */}
      {/* <meta name="twitter:creator" content="@votrecompte" /> */}
      
      {/* ============================================ */}
      {/* SCHEMA.ORG JSON-LD (Référencement structuré) */}
      {/* ============================================ */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      
      {/* ============================================ */}
      {/* AUTRES META UTILES */}
      {/* ============================================ */}
      
      {/* Format de détection des numéros de téléphone (désactivé sur iOS Safari) */}
      <meta name="format-detection" content="telephone=no" />
      
      {/* Couleur du thème pour les navigateurs mobiles */}
      <meta name="theme-color" content="#0a0a10" />
      
      {/* Couleur de la barre d'adresse sur Safari iOS */}
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Nom de l'application si ajoutée à l'écran d'accueil */}
      <meta name="apple-mobile-web-app-title" content="Fabien Licata" />
      
      {/* Support du mode plein écran sur iOS */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
    </Helmet>
  );
}

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // Page simple
 * <SEO
 *   title="Galerie Photo"
 *   description="Découvrez ma collection de photographies d'art"
 * />
 * 
 * // Page avec image personnalisée
 * <SEO
 *   title="Mariage de Sophie & Thomas"
 *   description="Reportage photo du mariage de Sophie et Thomas"
 *   image="https://res.cloudinary.com/xxx/mariage-preview.jpg"
 *   type="article"
 * />
 * 
 * // Page avec Schema.org
 * <SEO
 *   title="Services Photo"
 *   description="Mariages, événements, portraits professionnels"
 *   schema={{
 *     "@context": "https://schema.org",
 *     "@type": "Service",
 *     "serviceType": "Photographie de mariage",
 *     "provider": {
 *       "@type": "Person",
 *       "name": "Fabien Licata"
 *     }
 *   }}
 * />
 * 
 * // Page non indexable (admin, etc.)
 * <SEO
 *   title="Administration"
 *   description="Panneau d'administration"
 *   noIndex={true}
 *   noFollow={true}
 * />
 */
