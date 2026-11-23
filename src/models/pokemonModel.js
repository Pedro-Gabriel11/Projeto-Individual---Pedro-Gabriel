let database = require("../database/config");

function listarPokemon() {
    let instrucaoSql = `
        SELECT id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem
        FROM pokemon ORDER BY id
    `;
    return database.executar(instrucaoSql, []);
}

module.exports = {
    listarPokemon
};
