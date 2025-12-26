const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/accesPriveController");
const auth = require("../middleware/auth").authenticate;
const isAdmin = require("../middleware/isAdmin");

// Toutes les routes nécessitent d'être connecté (auth)
// Les routes de lecture sont accessibles au client concerné (géré dans le contrôleur)
// Les routes d'écriture sont réservées aux admins

router.get("/", auth, ctrl.getAll);
router.get("/:id", auth, ctrl.getOne);

router.post("/", auth, isAdmin, ctrl.create);
router.post("/:id/photos", auth, isAdmin, ctrl.addPhotos);
router.put("/:id", auth, isAdmin, ctrl.update);
router.delete("/:id", auth, isAdmin, ctrl.remove);

module.exports = router;
