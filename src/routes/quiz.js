var express = require("express");
var router = express.Router();
var quizController = require("../controllers/quizController");
var autenticarTreinador = require("../middleware/treinadorAuth");

router.get("/perguntas", autenticarTreinador, quizController.listarPerguntas);
router.post("/tentativas", autenticarTreinador, quizController.registrarTentativa);

module.exports = router;
