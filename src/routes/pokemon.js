var express = require("express");
var router = express.Router();
var pokemonController = require("../controllers/pokemonController");
var autenticarTreinador = require("../middleware/treinadorAuth");

router.post("/treinadores/cadastrar", pokemonController.cadastrar);
router.post("/treinadores/autenticar", pokemonController.autenticar);
router.post("/treinadores/sair", autenticarTreinador, pokemonController.sair);
router.get("/pokemon", pokemonController.listarPokemon);
router.get("/quiz/perguntas", autenticarTreinador, pokemonController.listarPerguntas);
router.post("/quiz/tentativas", autenticarTreinador, pokemonController.registrarTentativa);
router.get("/treinadores/visao-geral", autenticarTreinador, pokemonController.visaoGeral);
router.get("/treinadores/pokedex", autenticarTreinador, pokemonController.listarPokedex);
router.patch("/treinadores/pokedex/:pokemonId/favorito", autenticarTreinador, pokemonController.alterarFavorito);

module.exports = router;
