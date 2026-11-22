let express = require("express");
let router = express.Router();

// Todas as rotas da API começam com /api (definido no app.js)
router.use("/treinadores", require("./treinadores"));
router.use("/pokemon", require("./pokemon"));
router.use("/quiz", require("./quiz"));

module.exports = router;
