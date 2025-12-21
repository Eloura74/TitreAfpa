// Service d'envoi d'emails (générique)
// Utilise Nodemailer pour envoyer des emails via SMTP (Gmail, SendGrid, etc.)

const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP
// Les variables doivent être définies dans le .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER, // Votre email (ex: fabien.licata@gmail.com)
    pass: process.env.EMAIL_PASS, // Votre mot de passe d'application (App Password)
  },
});

/**
 * Envoie un email générique
 * @param {string} to - Destinataire
 * @param {string} subject - Sujet
 * @param {string} html - Contenu HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Photographie Art" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email envoyé : %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erreur envoi email :", error);
    // On ne bloque pas l'application si l'email échoue, mais on log l'erreur
    return null;
  }
};

/**
 * Envoie un email de confirmation de commande
 * @param {string} to - Email du client
 * @param {object} commande - Détails de la commande (id, montant, articles...)
 */
const sendOrderConfirmation = async (to, commande) => {
  const subject = `Confirmation de votre commande #${commande.transactionId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #d4af37;">Merci pour votre commande !</h1>
      <p>Bonjour ${commande.nomClient},</p>
      <p>Nous avons bien reçu votre paiement de <strong>${commande.montant} €</strong>.</p>
      <p>Votre commande <strong>#${commande.transactionId}</strong> est en cours de traitement.</p>
      <hr />
      <h3>Détails de la transaction :</h3>
      <ul>
        <li>Date : ${new Date(commande.date).toLocaleString()}</li>
        <li>Montant : ${commande.montant} €</li>
        <li>Moyen de paiement : ${commande.source}</li>
      </ul>
      <p>Vous recevrez un nouvel email lors de l'expédition de vos œuvres.</p>
      <p>Cordialement,<br/>L'équipe Photographie Art</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};

/**
 * Envoie un email de bienvenue après inscription
 * @param {string} to - Email du nouvel utilisateur
 * @param {string} prenom - Prénom de l'utilisateur
 */
const sendWelcomeEmail = async (to, prenom) => {
  const subject = "Bienvenue sur Photographie Art !";
  
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #d4af37;">Bienvenue ${prenom} !</h1>
      <p>Nous sommes ravis de vous compter parmi nos membres.</p>
      <p>Vous pouvez dès à présent accéder à votre espace client, suivre vos commandes et découvrir nos collections exclusives.</p>
      <p>À très bientôt,<br/>L'équipe Photographie Art</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendWelcomeEmail,
};
