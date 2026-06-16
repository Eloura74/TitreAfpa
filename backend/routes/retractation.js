const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/retractationController");
const auth = require("../middleware/auth").authenticate;
const isAdmin = require("../middleware/isAdmin");

router.get("/:id/eligibilite", ctrl.verifierEligibilite);

router.post("/:id/demander", ctrl.demanderRetractation);

router.put("/:id/traiter", auth, isAdmin, ctrl.traiterRetractation);

module.exports = router;
