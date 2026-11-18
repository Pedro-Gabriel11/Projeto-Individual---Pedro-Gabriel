var express = require("express");
var router = express.Router();
var treinadorController = require("../controllers/treinadorController");
var autenticarTreinador = require("../middleware/treinadorAuth");

router.post("/cadastrar", treinadorController.cadastrar);
router.post("/autenticar", treinadorController.autenticar);
router.post("/sair", autenticarTreinador, treinadorController.sair);
router.get("/visao-geral", autenticarTreinador, treinadorController.visaoGeral);
router.get("/pokedex", autenticarTreinador, treinadorController.listarPokedex);
router.patch("/pokedex/:pokemonId/favorito", autenticarTreinador, treinadorController.alterarFavorito);

module.exports = router;
