var express = require("express");
var router = express.Router();
var quizController = require("../controllers/quizController");
var treinadorController = require("../controllers/treinadorController");

router.get("/perguntas", treinadorController.autenticarTreinador, quizController.listarPerguntas);
router.post("/tentativas", treinadorController.autenticarTreinador, quizController.registrarTentativa);

module.exports = router;
