const nodemailer = require("nodemailer");

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
    console.log(`[EMAIL] Verification email sent to ${to}`);
  } catch (error) {
    console.error("[EMAIL] Error sending verification email:", error);
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
    console.log(`[EMAIL] Welcome email sent to ${to}`);
  } catch (error) {
    console.error("[EMAIL] Error sending welcome email:", error);
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
    console.log(`[EMAIL] Order confirmation sent to ${to}`);
  } catch (error) {
    console.error("[EMAIL] Error sending order confirmation:", error);
  }
};

/**
 * Envoie une notification de nouvelle commande à l'administrateur
 * @param {object} commande - Détails de la commande
 * @param {Array} articles - Liste des articles commandés
 */
const sendAdminNotification = async (commande, articles) => {
  // Construire la liste des articles pour l'email
  const articlesListHtml = articles
    .map(
      (item) => `
    <li style="margin-bottom: 10px;">
      <strong>${item.name}</strong><br>
      Quantité: ${item.quantity}<br>
      Prix unitaire: ${item.unit_amount.value} €
    </li>
  `
    )
    .join("");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // L'admin reçoit l'email sur son propre compte
    subject: `[ADMIN] Nouvelle commande #${commande.transactionId} - ${commande.montant} €`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Nouvelle commande reçue !</h2>
        <p><strong>Client :</strong> ${commande.nomClient} (${commande.emailClient})</p>
        <p><strong>Montant :</strong> ${commande.montant} €</p>
        <p><strong>Transaction :</strong> ${commande.transactionId}</p>
        
        <h3>Détails de la commande :</h3>
        <ul>
          ${articlesListHtml}
        </ul>
        
        <p>Connectez-vous à votre espace administration pour plus de détails.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin notification sent`);
  } catch (error) {
    console.error("[EMAIL] Error sending admin notification:", error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendAdminNotification,
};
