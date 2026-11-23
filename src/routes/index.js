let express = require("express");
let router = express.Router();

router.use("/treinadores", require("./treinadores"));
router.use("/pokemon", require("./pokemon"));
router.use("/quiz", require("./quiz"));

module.exports = router;
