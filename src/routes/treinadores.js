let express = require("express");
let router = express.Router();
let treinadorController = require("../controllers/treinadorController");

router.post("/cadastrar", function (req, res) {
    treinadorController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
    treinadorController.autenticar(req, res);
});

router.get("/painel/:idTreinador", function (req, res) {
    treinadorController.painel(req, res);
});

router.get("/pokedex/:idTreinador", function (req, res) {
    treinadorController.pokedex(req, res);
});

router.put("/favorito/:idTreinador/:idPokemon", function (req, res) {
    treinadorController.alterarFavorito(req, res);
});

module.exports = router;
