// ============================================
// ROUTE GÉNÉRATION SITEMAP.XML DYNAMIQUE
// ============================================
// Génère un sitemap XML complet incluant toutes les photos et services
// Accessible via : /api/sitemap.xml
// À soumettre à Google Search Console pour un meilleur référencement

const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const Service = require('../models/Service');
const Evenement = require('../models/Evenement');
const OeuvreGraphique = require('../models/OeuvreGraphique');

/**
 * GET /api/sitemap.xml
 * Génère le sitemap complet du site
 * 
 * Format XML conforme à https://www.sitemaps.org/protocol.html
 * Inclut :
 * - Pages statiques (accueil, galerie, services, etc.)
 * - Photos publiques individuelles
 * - Services individuels
 * - Événements publics
 * - Œuvres graphiques
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://titre-afpa.vercel.app';
    
    // ========================================
    // 1. RÉCUPÉRATION DES DONNÉES DYNAMIQUES
    // ========================================
    
    // Photos publiques uniquement (exclut les événements privés)
    const photos = await Photo.find({ 
      categorie: { $not: /EvenementPrive/i } 
    }).select('_id titre src categorie updatedAt').lean();
    
    // Services disponibles
    const services = await Service.find()
      .select('_id titre updatedAt')
      .lean();
    
    // Événements publics
    const evenements = await Evenement.find({ estPrive: false })
      .select('_id nom updatedAt')
      .lean();
    
    // Œuvres graphiques
    const oeuvres = await OeuvreGraphique.find()
      .select('_id titre updatedAt')
      .lean();
    
    // ========================================
    // 2. PAGES STATIQUES (Priorités et fréquences)
    // ========================================
    
    const staticPages = [
      // Page d'accueil - Priorité maximale
      { 
        loc: `${baseUrl}/`, 
        priority: '1.0', 
        changefreq: 'weekly' 
      },
      
      // Univers principaux - Très haute priorité
      { 
        loc: `${baseUrl}/photographie`, 
        priority: '0.9', 
        changefreq: 'weekly' 
      },
      { 
        loc: `${baseUrl}/graphisme`, 
        priority: '0.9', 
        changefreq: 'weekly' 
      },
      
      // Galeries - Haute priorité (contenu actualisé)
      { 
        loc: `${baseUrl}/galerie`, 
        priority: '0.8', 
        changefreq: 'daily' 
      },
      { 
        loc: `${baseUrl}/galerie-graphique`, 
        priority: '0.8', 
        changefreq: 'daily' 
      },
      
      // Services et événements - Priorité moyenne-haute
      { 
        loc: `${baseUrl}/services`, 
        priority: '0.7', 
        changefreq: 'monthly' 
      },
      { 
        loc: `${baseUrl}/evenements`, 
        priority: '0.7', 
        changefreq: 'weekly' 
      },
      
      // Pages informatives - Priorité moyenne
      { 
        loc: `${baseUrl}/about`, 
        priority: '0.6', 
        changefreq: 'monthly' 
      },
      { 
        loc: `${baseUrl}/panier`, 
        priority: '0.5', 
        changefreq: 'weekly' 
      }
    ];
    
    // ========================================
    // 3. CONSTRUCTION DU XML
    // ========================================
    
    // Fonction helper pour formater les dates en ISO 8601
    const formatDate = (date) => {
      if (!date) return new Date().toISOString().split('T')[0];
      return new Date(date).toISOString().split('T')[0];
    };
    
    // En-tête XML avec namespace pour les images
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- ============================================ -->
  <!-- PAGES STATIQUES -->
  <!-- ============================================ -->
`;
    
    // Ajout des pages statiques
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${formatDate()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
    });
    
    xml += `  <!-- ============================================ -->
  <!-- PHOTOS INDIVIDUELLES (${photos.length} photos) -->
  <!-- ============================================ -->
`;
    
    // Ajout des photos individuelles avec leur image
    photos.forEach(photo => {
      const imageUrl = photo.src.startsWith('http') 
        ? photo.src 
        : `${baseUrl}${photo.src}`;
      
      xml += `  <url>
    <loc>${baseUrl}/photo/${photo._id}</loc>
    <lastmod>${formatDate(photo.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(photo.titre || 'Photo')}</image:title>
      <image:caption>${escapeXml(photo.categorie || '')}</image:caption>
    </image:image>
  </url>

`;
    });
    
    xml += `  <!-- ============================================ -->
  <!-- SERVICES (${services.length} services) -->
  <!-- ============================================ -->
`;
    
    // Ajout des services
    services.forEach(service => {
      xml += `  <url>
    <loc>${baseUrl}/services/${service._id}</loc>
    <lastmod>${formatDate(service.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

`;
    });
    
    xml += `  <!-- ============================================ -->
  <!-- ÉVÉNEMENTS PUBLICS (${evenements.length} événements) -->
  <!-- ============================================ -->
`;
    
    // Ajout des événements publics
    evenements.forEach(event => {
      xml += `  <url>
    <loc>${baseUrl}/evenements/${event._id}</loc>
    <lastmod>${formatDate(event.updatedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

`;
    });
    
    xml += `  <!-- ============================================ -->
  <!-- ŒUVRES GRAPHIQUES (${oeuvres.length} œuvres) -->
  <!-- ============================================ -->
`;
    
    // Ajout des œuvres graphiques
    oeuvres.forEach(oeuvre => {
      xml += `  <url>
    <loc>${baseUrl}/graphisme/${oeuvre._id}</loc>
    <lastmod>${formatDate(oeuvre.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

`;
    });
    
    // Fermeture du XML
    xml += `</urlset>`;
    
    // ========================================
    // 4. ENVOI DE LA RÉPONSE
    // ========================================
    
    // Configuration des headers pour XML
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache 1 heure
    
    // Envoi du sitemap
    res.send(xml);
    
    console.log(`✅ Sitemap généré : ${photos.length} photos, ${services.length} services, ${evenements.length} événements, ${oeuvres.length} œuvres`);
    
  } catch (err) {
    console.error('❌ Erreur génération sitemap:', err);
    res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Erreur lors de la génération du sitemap -->
</urlset>`);
  }
});

/**
 * Fonction helper pour échapper les caractères spéciaux XML
 * Évite les erreurs de parsing XML
 * @param {string} str - Chaîne à échapper
 * @returns {string} Chaîne échappée
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = router;
