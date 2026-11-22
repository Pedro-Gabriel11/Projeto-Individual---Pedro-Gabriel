let express = require("express");
let router = express.Router();
let quizController = require("../controllers/quizController");

router.post("/tentativa", function (req, res) {
    quizController.registrarTentativa(req, res);
});

module.exports = router;
