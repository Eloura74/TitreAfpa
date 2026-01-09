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

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};
