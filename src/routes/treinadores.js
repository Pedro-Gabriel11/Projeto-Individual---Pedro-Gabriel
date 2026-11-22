let express = require("express");
let router = express.Router();
let treinadorController = require("../controllers/treinadorController");

router.post("/cadastrar", function (req, res) {
    treinadorController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
    treinadorController.autenticar(req, res);
});

module.exports = router;
