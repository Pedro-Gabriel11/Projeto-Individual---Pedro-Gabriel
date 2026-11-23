let ambiente_processo = 'desenvolvimento';

let caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });
process.env.AMBIENTE_PROCESSO = process.env.AMBIENTE_PROCESSO || ambiente_processo;

let express = require("express");
let path = require("path");
let PORTA_APP = process.env.APP_PORT;
let HOST_APP = process.env.APP_HOST;

let app = express();

let apiRouter = require("./src/routes");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiRouter);

app.listen(PORTA_APP, function () {
    console.log(`
      Pokémon Trainer Hub está disponível em http://${HOST_APP}:${PORTA_APP}
      Ambiente: ${process.env.AMBIENTE_PROCESSO}
    `);
});
