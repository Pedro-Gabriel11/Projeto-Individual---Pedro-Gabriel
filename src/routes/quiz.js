let express = require("express");
let router = express.Router();
let quizController = require("../controllers/quizController");

// Provisório até a Tarefa 5 (que reescreve o quiz).
router.post("/tentativas", function (req, res) {
    quizController.registrarTentativa(req, res);
});

module.exports = router;
