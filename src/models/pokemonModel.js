let database = require("../database/config");

// Devolve o catálogo inteiro, na ordem da Pokédex do site.
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
