var mysql = require("mysql2");

// CONEXÃO DO BANCO MYSQL SERVER
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

function executar(instrucao, valores) {

    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect(function (erroConexao) {
            if (erroConexao) {
                conexao.destroy();
                reject(erroConexao);
                return;
            }

            conexao.query(instrucao, valores || [], function (erro, resultados) {
                conexao.end();
                if (erro) {
                    reject(erro);
                    return;
                }
                resolve(resultados);
            });
        });
    });
}

function executarTransacao(instrucoes) {
    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        return Promise.reject(new Error("AMBIENTE NÃO CONFIGURADO EM .env"));
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect(function (erroConexao) {
            if (erroConexao) {
                conexao.destroy();
                reject(erroConexao);
                return;
            }

            conexao.beginTransaction(function (erroTransacao) {
                if (erroTransacao) {
                    conexao.end();
                    reject(erroTransacao);
                    return;
                }

                var resultados = [];
                var indice = 0;

                function executarProximaInstrucao() {
                    if (indice === instrucoes.length) {
                        conexao.commit(function (erroCommit) {
                            if (erroCommit) {
                                conexao.rollback(function () {
                                    conexao.end();
                                    reject(erroCommit);
                                });
                                return;
                            }
                            conexao.end();
                            resolve(resultados);
                        });
                        return;
                    }

                    var instrucao = instrucoes[indice++];
                    var valores;
                    try {
                        valores = typeof instrucao.valores === "function"
                            ? instrucao.valores(resultados)
                            : instrucao.valores || [];
                    } catch (erroValores) {
                        conexao.rollback(function () {
                            conexao.end();
                            reject(erroValores);
                        });
                        return;
                    }
                    conexao.query(instrucao.sql, valores, function (erro, resultado) {
                        if (erro) {
                            conexao.rollback(function () {
                                conexao.end();
                                reject(erro);
                            });
                            return;
                        }
                        resultados.push(resultado);
                        executarProximaInstrucao();
                    });
                }

                executarProximaInstrucao();
            });
        });
    });
}

module.exports = {
    executar,
    executarTransacao
};