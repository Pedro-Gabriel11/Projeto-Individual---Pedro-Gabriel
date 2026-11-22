let express = require("express");
let router = express.Router();
let pokemonController = require("../controllers/pokemonController");

router.get("/", function (req, res) {
    pokemonController.listarPokemon(req, res);
});

module.exports = router;
