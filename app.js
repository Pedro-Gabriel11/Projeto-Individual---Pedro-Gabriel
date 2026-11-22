// let ambiente_processo = 'producao';
let ambiente_processo = 'desenvolvimento';

let caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

require("dotenv").config({ path: caminho_env });
process.env.AMBIENTE_PROCESSO = process.env.AMBIENTE_PROCESSO || ambiente_processo;

let express = require("express");
let path = require("path");
let PORTA_APP = process.env.APP_PORT;
let HOST_APP = process.env.APP_HOST;

let app = express();

let apiRouter = require("./src/routes");

app.use(express.json());
// A pasta public vira a raiz do site: public/cadastro.html → /cadastro.html
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiRouter);

app.listen(PORTA_APP, function () {
    console.log(`
      Pokémon Trainer Hub está disponível em http://${HOST_APP}:${PORTA_APP}
      Ambiente: ${process.env.AMBIENTE_PROCESSO}
    `);
});
