var express = require("express");
var router = express.Router();
var pokemonController = require("../controllers/pokemonController");

router.get("/", pokemonController.listarPokemon);

module.exports = router;
