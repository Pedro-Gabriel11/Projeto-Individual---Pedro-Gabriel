let database = require("../database/config");

function registrarTentativa(idTreinador, acertos, erros, pontos) {
    let instrucaoSql = "INSERT INTO tentativa (fk_treinador, acertos, erros, pontos) VALUES (?, ?, ?, ?)";
    return database.executar(instrucaoSql, [idTreinador, acertos, erros, pontos]);
}

function buscarIdsDaColecao(idTreinador) {
    let instrucaoSql = "SELECT fk_pokemon FROM colecao WHERE fk_treinador = ?";
    return database.executar(instrucaoSql, [idTreinador]);
}

function desbloquearPokemon(idTreinador, idPokemon) {
    let instrucaoSql = "INSERT INTO colecao (fk_treinador, fk_pokemon) VALUES (?, ?)";
    return database.executar(instrucaoSql, [idTreinador, idPokemon]);
}

module.exports = {
    registrarTentativa,
    buscarIdsDaColecao,
    desbloquearPokemon
};
