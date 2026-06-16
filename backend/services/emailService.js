const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// Configuration du transporteur (Gmail)
// Nécessite EMAIL_USER et EMAIL_PASS dans le .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envoie un email de vérification
 * @param {string} to - Email du destinataire
 * @param {string} token - Token de vérification
 */
const sendVerificationEmail = async (to, token) => {
  const verificationLink = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Vérifiez votre compte - Fabien Licata Photographie",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Bienvenue !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
        <p>
          <a href="${verificationLink}" style="background-color: #d6c487; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Vérifier mon email
          </a>
        </p>
        <p>Ou copiez ce lien : <br> ${verificationLink}</p>
        <p>Ce lien est valide pendant 24 heures.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email de vérification envoyé", { to });
  } catch (error) {
    logger.error("Erreur envoi email de vérification", {
      to,
      error: error.message,
    });
    throw error; // Propager l'erreur pour la gérer dans le contrôleur
  }
};

/**
 * Envoie un email de bienvenue (après vérification réussie)
 * @param {string} to - Email du destinataire
 * @param {string} prenom - Prénom de l'utilisateur
 */
const sendWelcomeEmail = async (to, prenom) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Bienvenue sur Fabien Licata Photographie",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Bonjour ${prenom || "cher client"},</h2>
        <p>Votre compte a été vérifié avec succès !</p>
        <p>Vous pouvez maintenant accéder à votre espace client et parcourir les galeries privées.</p>
        <p>À bientôt,<br>L'équipe Fabien Licata</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email de bienvenue envoyé", { to });
  } catch (error) {
    logger.error("Erreur envoi email de bienvenue", {
      to,
      error: error.message,
    });
  }
};

/**
 * Envoie un email de confirmation de commande au client
 * @param {string} to - Email du client
 * @param {object} commande - Détails de la commande
 */
const sendOrderConfirmation = async (to, commande) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: `Confirmation de votre commande #${commande.transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Merci pour votre commande !</h2>
        <p>Bonjour ${commande.nomClient},</p>
        <p>Nous avons bien reçu votre paiement de <strong>${commande.montant} €</strong>.</p>
        <p>Votre commande est en cours de traitement. Vous recevrez bientôt vos photos.</p>
        <p>Référence transaction : ${commande.transactionId}</p>
        <p>À bientôt,<br>L'équipe Fabien Licata</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email confirmation commande envoyé", { to });
  } catch (error) {
    logger.error("Erreur envoi email confirmation commande", {
      to,
      error: error.message,
    });
  }
};

/**
 * Envoie une notification de nouvelle commande à l'administrateur
 * @param {object} paiement - Détails du paiement (modèle Paiement)
 * @param {Array} articles - Liste des articles commandés
 */
const sendAdminNotification = async (paiement, articles) => {
  // Formatter l'adresse de livraison
  const adresse = paiement.adresseLivraison || {};
  const adresseComplete = [
    adresse.prenom,
    adresse.nom,
    adresse.adresse,
    [adresse.codePostal, adresse.ville].filter(Boolean).join(" "),
    adresse.pays,
    adresse.telephone ? `📞 ${adresse.telephone}` : null,
  ]
    .filter(Boolean)
    .join("<br>");

  // Construire la liste détaillée des articles
  const articlesListHtml = articles
    .map(
      (item, index) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px;">${index + 1}</td>
      <td style="padding: 10px;"><strong>${item.nom}</strong></td>
      <td style="padding: 10px; text-align: center;">${item.quantite}</td>
      <td style="padding: 10px;">${item.format || "-"}</td>
      <td style="padding: 10px;">${item.support || "-"}</td>
      <td style="padding: 10px; text-align: right;">${item.prixUnitaire?.toFixed(2)} €</td>
      <td style="padding: 10px; text-align: right;"><strong>${(item.prixUnitaire * item.quantite).toFixed(2)} €</strong></td>
    </tr>
  `,
    )
    .join("");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // L'admin reçoit l'email
    subject: `🛒 Nouvelle commande #${paiement.transactionId} - ${paiement.montant.toFixed(2)} €`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #d6c487; border-bottom: 2px solid #d6c487; padding-bottom: 10px;">
          🛍️ Nouvelle commande reçue !
        </h2>
        
        <!-- Infos client -->
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">👤 Informations client</h3>
          <p style="margin: 5px 0;"><strong>Nom :</strong> ${paiement.nomClient}</p>
          <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${paiement.emailClient}">${paiement.emailClient}</a></p>
        </div>

        <!-- Adresse de livraison -->
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">📍 Adresse de livraison</h3>
          <p style="margin: 5px 0;">${adresseComplete || "Non renseignée (PayPal)"}</p>
        </div>

        <!-- Résumé commande -->
        <div style="background: #fff8e1; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">💰 Résumé</h3>
          <p style="margin: 5px 0;"><strong>Transaction ID :</strong> ${paiement.transactionId}</p>
          <p style="margin: 5px 0;"><strong>Date :</strong> ${new Date(paiement.date).toLocaleString("fr-FR")}</p>
          <p style="margin: 5px 0;"><strong>Méthode :</strong> ${paiement.source?.toUpperCase() || "PAYPAL"}</p>
          <p style="margin: 5px 0; font-size: 18px; color: #2e7d32;"><strong>Total : ${paiement.montant.toFixed(2)} €</strong></p>
        </div>
        
        <!-- Détails articles -->
        <h3 style="color: #333; margin-top: 20px;">📦 Articles commandés</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead style="background: #d6c487; color: white;">
            <tr>
              <th style="padding: 10px; text-align: left;">#</th>
              <th style="padding: 10px; text-align: left;">Article</th>
              <th style="padding: 10px; text-align: center;">Qté</th>
              <th style="padding: 10px; text-align: left;">Format</th>
              <th style="padding: 10px; text-align: left;">Support</th>
              <th style="padding: 10px; text-align: right;">Prix U.</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${articlesListHtml}
          </tbody>
        </table>
        
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Connectez-vous à votre <a href="${process.env.FRONTEND_URL}/gestion-galerie" style="color: #d6c487;">espace administration</a> pour gérer cette commande.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email notification admin envoyé", {
      commande: paiement.transactionId,
    });
  } catch (error) {
    logger.error("Erreur envoi email notification admin", {
      error: error.message,
    });
  }
};

const sendRetractationConfirmation = async (to, paiement) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: `Confirmation de votre demande de rétractation - Commande #${paiement.transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d6c487; border-bottom: 2px solid #d6c487; padding-bottom: 10px;">
          Demande de rétractation enregistrée
        </h2>
        
        <p>Bonjour ${paiement.nomClient},</p>
        
        <p>Nous avons bien reçu votre demande de rétractation pour la commande <strong>#${paiement.transactionId}</strong>.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">📋 Détails de la demande</h3>
          <p style="margin: 5px 0;"><strong>Date de la demande :</strong> ${new Date(paiement.retractation.dateDemande).toLocaleDateString("fr-FR")}</p>
          <p style="margin: 5px 0;"><strong>Montant :</strong> ${paiement.montant.toFixed(2)} €</p>
          ${paiement.retractation.motif ? `<p style="margin: 5px 0;"><strong>Motif :</strong> ${paiement.retractation.motif}</p>` : ""}
        </div>
        
        <p><strong>Prochaines étapes :</strong></p>
        <ol>
          <li>Votre demande sera examinée par notre équipe dans les plus brefs délais</li>
          <li>Vous recevrez une confirmation par email une fois la demande traitée</li>
          <li>Si acceptée, le remboursement sera effectué sous 14 jours ouvrés</li>
        </ol>
        
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Conformément à la loi française, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation.
        </p>
        
        <p>Cordialement,<br>L'équipe Fabien Licata</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email confirmation rétractation envoyé", { to });
  } catch (error) {
    logger.error("Erreur envoi email confirmation rétractation", {
      to,
      error: error.message,
    });
  }
};

const sendRetractationAdminNotification = async (paiement) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `🔄 Demande de rétractation - Commande #${paiement.transactionId}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">
          ⚠️ Nouvelle demande de rétractation
        </h2>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff9800;">
          <h3 style="margin-top: 0; color: #333;">👤 Informations client</h3>
          <p style="margin: 5px 0;"><strong>Nom :</strong> ${paiement.nomClient}</p>
          <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${paiement.emailClient}">${paiement.emailClient}</a></p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">💰 Détails de la commande</h3>
          <p style="margin: 5px 0;"><strong>Transaction ID :</strong> ${paiement.transactionId}</p>
          <p style="margin: 5px 0;"><strong>Date d'achat :</strong> ${new Date(paiement.date).toLocaleDateString("fr-FR")}</p>
          <p style="margin: 5px 0;"><strong>Date de demande :</strong> ${new Date(paiement.retractation.dateDemande).toLocaleDateString("fr-FR")}</p>
          <p style="margin: 5px 0;"><strong>Montant :</strong> ${paiement.montant.toFixed(2)} €</p>
        </div>

        ${
          paiement.retractation.motif
            ? `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">📝 Motif de rétractation</h3>
          <p style="margin: 5px 0;">${paiement.retractation.motif}</p>
        </div>
        `
            : ""
        }

        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}/gestion-galerie" style="display: inline-block; background: #d6c487; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Gérer la demande
          </a>
        </p>
        
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Action requise : Examinez cette demande et traitez-la dans les plus brefs délais.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email notification admin rétractation envoyé", {
      commande: paiement.transactionId,
    });
  } catch (error) {
    logger.error("Erreur envoi email notification admin rétractation", {
      error: error.message,
    });
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendAdminNotification,
  sendRetractationConfirmation,
  sendRetractationAdminNotification,
};
