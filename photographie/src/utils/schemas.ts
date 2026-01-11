// ============================================
// SCHEMAS JSON-LD pour le référencement structuré
// ============================================
// Ces schemas permettent à Google de comprendre le contenu de votre site
// et d'afficher des rich snippets (étoiles, prix, horaires, etc.)

/**
 * Schema de l'entreprise (à afficher sur toutes les pages)
 * Type : ProfessionalService (service professionnel)
 * Permet l'affichage dans Google Maps, Knowledge Graph, etc.
 */
export const photographerSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://titre-afpa.vercel.app/#organization",
  "name": "Fabien Licata Photographie",
  "alternateName": "Fabien Licata - Photographe & Graphiste",
  "description": "Photographe professionnel spécialisé en mariages, événements, portraits et photographie d'art. Graphiste créatif pour identité visuelle.",
  "url": "https://titre-afpa.vercel.app",
  "logo": "https://titre-afpa.vercel.app/images/logoHome.png",
  "image": "https://titre-afpa.vercel.app/images/logoHome.png",
  
  // Coordonnées de contact (À PERSONNALISER)
  "telephone": "+33-7-82-08-06-07", // ⚠️ Remplacer par le vrai numéro
  "email": "fabien.licata@gmail.com", // ⚠️ Remplacer par le vrai email
  
  // Adresse professionnelle (⚠️ À PERSONNALISER - crucial pour SEO local)
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "533 chemin du colombier", // ⚠️ Remplacer
    "addressLocality": "Pignans", // ⚠️ Remplacer par la ville
    "addressRegion": "Vars", // ⚠️ Remplacer par la région
    "postalCode": "83790", // ⚠️ Remplacer par le code postal
    "addressCountry": "FR"
  },
  
  // Coordonnées GPS (améliore le SEO local - Google Maps)
  // ⚠️ Obtenir les coordonnées sur : https://www.latlong.net/
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.1808, // ⚠️ Remplacer par latitude réelle
    "longitude": 6.1346  // ⚠️ Remplacer par longitude réelle
  },
  
  // Zone de service (villes/régions couvertes)
  "areaServed": [
    {
      "@type": "City",
      "name": "Pignans"
    },
    {
      "@type": "City",
      "name": "Lyon"
    },
    {
      "@type": "City",
      "name": "Marseille"
    },
    // Ajouter d'autres villes si besoin
  ],
  
  // Gamme de prix (€ = économique, €€ = moyen, €€€ = premium)
  "priceRange": "€€",
  
  // Horaires d'ouverture (⚠️ À PERSONNALISER)
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "16:00"
    }
    // Dimanche fermé (pas de spécification = fermé)
  ],
  
  // Réseaux sociaux (améliore la crédibilité)
  // ⚠️ À PERSONNALISER avec les vrais liens
  "sameAs": [
    "https://www.instagram.com/fabien.licata.photographiste/", // ⚠️ Remplacer
    "https://www.facebook.com/FabienLicata", // ⚠️ Remplacer
    // Ajouter Pinterest, Behance, etc. si applicable
  ],
  
  // Note moyenne (si vous avez des avis Google/Facebook)
  // ⚠️ Décommenter et personnaliser si applicable
  // "aggregateRating": {
  //   "@type": "AggregateRating",
  //   "ratingValue": "4.9",
  //   "reviewCount": "48",
  //   "bestRating": "5",
  //   "worstRating": "1"
  // },
  
  // Services proposés
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services de photographie",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Mariages",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Reportage mariage complet",
              "description": "Couverture complète de votre mariage, de la préparation à la soirée"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Portraits",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Portraits professionnels",
              "description": "Séance photo portrait en studio ou extérieur"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Événements",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Photographie d'événements",
              "description": "Anniversaires, baptêmes, événements d'entreprise"
            }
          }
        ]
      }
    ]
  }
};

/**
 * Schema pour une photo/produit individuel
 * Utilisé sur les pages de détail photo
 */
export function createPhotoSchema(photo: {
  id: string;
  titre: string;
  description: string;
  src: string;
  prix?: number;
  categorie: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Photograph",
    "@id": `https://titre-afpa.vercel.app/photo/${photo.id}`,
    "name": photo.titre,
    "description": photo.description,
    "image": photo.src,
    "creator": {
      "@type": "Person",
      "name": "Fabien Licata",
      "url": "https://titre-afpa.vercel.app"
    },
    "copyrightHolder": {
      "@type": "Person",
      "name": "Fabien Licata"
    },
    "copyrightYear": new Date().getFullYear(),
    "genre": photo.categorie,
    
    // Si la photo est en vente
    ...(photo.prix && {
      "offers": {
        "@type": "Offer",
        "price": photo.prix,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": `https://titre-afpa.vercel.app/photo/${photo.id}`,
        "seller": {
          "@type": "Person",
          "name": "Fabien Licata"
        }
      }
    })
  };
}

/**
 * Schema pour un service (mariage, portrait, etc.)
 * Utilisé sur les pages de détail service
 */
export function createServiceSchema(service: {
  id: string;
  nom: string;
  description: string;
  prix?: number;
  duree?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://titre-afpa.vercel.app/services/${service.id}`,
    "name": service.nom,
    "description": service.description,
    "provider": {
      "@type": "Person",
      "name": "Fabien Licata",
      "url": "https://titre-afpa.vercel.app"
    },
    "serviceType": service.nom,
    
    // Image du service si disponible
    ...(service.image && { "image": service.image }),
    
    // Prix si disponible
    ...(service.prix && {
      "offers": {
        "@type": "Offer",
        "price": service.prix,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      }
    }),
    
    // Durée si disponible
    ...(service.duree && {
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "description": service.duree
      }
    })
  };
}

/**
 * Schema pour un événement
 * Utilisé sur les pages d'événements publics
 */
export function createEventSchema(event: {
  id: string;
  nom: string;
  description: string;
  date: string;
  lieu?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `https://titre-afpa.vercel.app/evenements/${event.id}`,
    "name": event.nom,
    "description": event.description,
    "startDate": event.date,
    
    ...(event.image && { "image": event.image }),
    
    ...(event.lieu && {
      "location": {
        "@type": "Place",
        "name": event.lieu
      }
    }),
    
    "organizer": {
      "@type": "Person",
      "name": "Fabien Licata",
      "url": "https://titre-afpa.vercel.app"
    },
    
    "performer": {
      "@type": "Person",
      "name": "Fabien Licata"
    }
  };
}

/**
 * Schema BreadcrumbList pour le fil d'Ariane
 * Améliore la navigation dans les résultats Google
 */
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Schema pour la page FAQ (si vous en avez une)
 */
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
