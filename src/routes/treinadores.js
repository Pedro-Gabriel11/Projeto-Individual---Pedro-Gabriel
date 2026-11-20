var express = require("express");
var router = express.Router();
var treinadorController = require("../controllers/treinadorController");

router.post("/cadastrar", treinadorController.cadastrar);
router.post("/autenticar", treinadorController.autenticar);
router.post("/sair", treinadorController.autenticarTreinador, treinadorController.sair);
router.get("/visao-geral", treinadorController.autenticarTreinador, treinadorController.visaoGeral);
router.get("/pokedex", treinadorController.autenticarTreinador, treinadorController.listarPokedex);
router.patch("/pokedex/:pokemonId/favorito", treinadorController.autenticarTreinador, treinadorController.alterarFavorito);

module.exports = router;
