const Paiement = require("../models/Paiement");
const logger = require("../utils/logger");
const { AppError, catchAsync } = require("../middleware/errorHandler");

const DELAI_RETRACTATION_JOURS = 14;

const calculerDelaiRestant = (dateReception) => {
  if (!dateReception) return null;
  
  const maintenant = new Date();
  const dateLimite = new Date(dateReception);
  dateLimite.setDate(dateLimite.getDate() + DELAI_RETRACTATION_JOURS);
  
  const joursRestants = Math.ceil((dateLimite - maintenant) / (1000 * 60 * 60 * 24));
  
  return {
    joursRestants: Math.max(0, joursRestants),
    dateLimite,
    eligible: joursRestants > 0,
  };
};

exports.verifierEligibilite = catchAsync(async (req, res) => {
  const { id } = req.params;

  const paiement = await Paiement.findById(id);
  if (!paiement) {
    throw new AppError("Commande introuvable", 404);
  }

  if (paiement.retractationExclue) {
    return res.json({
      eligible: false,
      raison: "Cette commande contient des œuvres uniques non éligibles à la rétractation",
    });
  }

  if (paiement.retractation.demandee) {
    return res.json({
      eligible: false,
      raison: "Une demande de rétractation a déjà été effectuée",
      statut: paiement.retractation.statut,
      dateDemande: paiement.retractation.dateDemande,
    });
  }

  const delai = calculerDelaiRestant(paiement.dateReception);
  
  if (!delai || !delai.eligible) {
    return res.json({
      eligible: false,
      raison: "Le délai de rétractation de 14 jours est dépassé",
      dateLimite: delai?.dateLimite,
    });
  }

  res.json({
    eligible: true,
    joursRestants: delai.joursRestants,
    dateLimite: delai.dateLimite,
  });
});

exports.demanderRetractation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { motif } = req.body;

  const paiement = await Paiement.findById(id);
  if (!paiement) {
    throw new AppError("Commande introuvable", 404);
  }

  if (paiement.retractationExclue) {
    throw new AppError(
      "Cette commande contient des œuvres uniques non éligibles à la rétractation",
      400
    );
  }

  if (paiement.retractation.demandee) {
    throw new AppError("Une demande de rétractation a déjà été effectuée", 400);
  }

  const delai = calculerDelaiRestant(paiement.dateReception);
  if (!delai || !delai.eligible) {
    throw new AppError("Le délai de rétractation de 14 jours est dépassé", 400);
  }

  paiement.retractation = {
    demandee: true,
    dateDemande: new Date(),
    statut: "en_cours",
    motif: motif || "Non spécifié",
  };

  await paiement.save();

  logger.info("Demande de rétractation enregistrée", {
    paiementId: id,
    transactionId: paiement.transactionId,
    emailClient: paiement.emailClient,
  });

  const { sendRetractationConfirmation, sendRetractationAdminNotification } = require("../services/emailService");

  if (paiement.emailClient) {
    sendRetractationConfirmation(paiement.emailClient, paiement).catch((err) =>
      logger.error("Erreur envoi email confirmation rétractation", { error: err.message })
    );
  }

  sendRetractationAdminNotification(paiement).catch((err) =>
    logger.error("Erreur envoi email admin rétractation", { error: err.message })
  );

  res.json({
    status: "success",
    message: "Votre demande de rétractation a été enregistrée avec succès",
    data: {
      statut: paiement.retractation.statut,
      dateDemande: paiement.retractation.dateDemande,
    },
  });
});

exports.traiterRetractation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { statut, commentaireAdmin } = req.body;

  if (!["acceptee", "refusee"].includes(statut)) {
    throw new AppError("Statut invalide. Utilisez 'acceptee' ou 'refusee'", 400);
  }

  const paiement = await Paiement.findById(id);
  if (!paiement) {
    throw new AppError("Commande introuvable", 404);
  }

  if (!paiement.retractation.demandee) {
    throw new AppError("Aucune demande de rétractation pour cette commande", 400);
  }

  paiement.retractation.statut = statut;
  paiement.retractation.commentaireAdmin = commentaireAdmin || "";

  if (statut === "acceptee") {
    paiement.statut = "annulé";
  }

  await paiement.save();

  logger.info("Rétractation traitée", {
    paiementId: id,
    statut,
    transactionId: paiement.transactionId,
  });

  res.json({
    status: "success",
    message: `Rétractation ${statut === "acceptee" ? "acceptée" : "refusée"}`,
    data: paiement.retractation,
  });
});
