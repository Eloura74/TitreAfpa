const mongoose = require("mongoose");

const mentionsLegalesSchema = new mongoose.Schema(
  {
    contenu: {
      type: String,
      required: true,
      default: `<h2>1. Informations légales</h2>
<p><strong>Nom de l'entreprise :</strong> Photographe Pro</p>
<p><strong>Forme juridique :</strong> [À compléter]</p>
<p><strong>Adresse :</strong> [À compléter]</p>
<p><strong>Email :</strong> fabien.licata@gmail.com</p>
<p><strong>Téléphone :</strong> [À compléter]</p>
<p><strong>SIRET :</strong> [À compléter]</p>

<h2>2. Directeur de la publication</h2>
<p>Le directeur de la publication du site est : [Nom du directeur]</p>

<h2>3. Hébergement</h2>
<p><strong>Hébergeur :</strong> Vercel Inc.</p>
<p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
<p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></p>

<h2>4. Propriété intellectuelle</h2>
<p>L'ensemble du contenu de ce site (textes, images, vidéos, logos) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>

<h2>5. Données personnelles</h2>
<p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
<p>Pour exercer ces droits, contactez-nous à : fabien.licata@gmail.com</p>

<h2>6. Cookies</h2>
<p>Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies.</p>

<h2>7. Crédits</h2>
<p><strong>Conception et développement :</strong> [Nom du développeur]</p>
<p><strong>Photographies :</strong> © Photographe Pro - Tous droits réservés</p>`,
    },
    derniereModification: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MentionsLegales", mentionsLegalesSchema);
