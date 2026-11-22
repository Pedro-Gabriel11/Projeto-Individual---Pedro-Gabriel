let mysql = require("mysql2");

// Dados de conexão com o MySQL, lidos do arquivo .env.dev
let mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

// Executa uma instrução SQL e devolve uma Promise com o resultado.
// "valores" são os dados que entram no lugar de cada ? da instrução.
function executar(instrucao, valores) {
    if (process.env.AMBIENTE_PROCESSO != "producao" && process.env.AMBIENTE_PROCESSO != "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU .env.dev OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        let conexao = mysql.createConnection(mySqlConfig);
        conexao.connect();
        conexao.query(instrucao, valores, function (erro, resultados) {
            conexao.end();
            if (erro) {
                reject(erro);
            } else {
                resolve(resultados);
            }
        });
    });
}

module.exports = {
    executar
};
