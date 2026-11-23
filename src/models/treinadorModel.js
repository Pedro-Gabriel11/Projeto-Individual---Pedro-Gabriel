let database = require("../database/config");

function buscarPorUsuario(usuario) {
    let instrucaoSql = "SELECT id FROM treinador WHERE usuario = ?";
    return database.executar(instrucaoSql, [usuario]);
}

function buscarPorEmail(email) {
    let instrucaoSql = "SELECT id FROM treinador WHERE email = ?";
    return database.executar(instrucaoSql, [email]);
}

function cadastrar(nome, usuario, email, senha) {
    let instrucaoSql = "INSERT INTO treinador (nome, usuario, email, senha) VALUES (?, ?, ?, ?)";
    return database.executar(instrucaoSql, [nome, usuario, email, senha]);
}

function buscarPorConta(conta) {
    let instrucaoSql = `
        SELECT id, nome, usuario, email, senha FROM treinador
        WHERE email = ? OR usuario = ?
    `;
    return database.executar(instrucaoSql, [conta, conta]);
}

function contarCatalogo() {
    let instrucaoSql = "SELECT COUNT(id) AS total FROM pokemon";
    return database.executar(instrucaoSql, []);
}

function buscarResumoColecao(idTreinador) {
    let instrucaoSql = `
        SELECT COUNT(fk_pokemon) AS desbloqueados, SUM(favorito) AS favoritos
        FROM colecao WHERE fk_treinador = ?
    `;
    return database.executar(instrucaoSql, [idTreinador]);
}

function buscarResumoTentativas(idTreinador) {
    let instrucaoSql = `
        SELECT COUNT(id) AS quizzes, SUM(acertos) AS totalAcertos,
               SUM(erros) AS totalErros, MAX(pontos) AS melhorPontuacao
        FROM tentativa WHERE fk_treinador = ?
    `;
    return database.executar(instrucaoSql, [idTreinador]);
}

function buscarTentativas(idTreinador) {
    let instrucaoSql = `
        SELECT pontos, acertos, erros, dt_tentativa FROM tentativa
        WHERE fk_treinador = ? ORDER BY dt_tentativa DESC LIMIT 8
    `;
    return database.executar(instrucaoSql, [idTreinador]);
}

function buscarColecao(idTreinador) {
    let instrucaoSql = `
        SELECT pokemon.id, pokemon.nome, pokemon.tipo1, pokemon.tipo2, pokemon.imagem,
               colecao.favorito, colecao.dt_desbloqueio
        FROM colecao JOIN pokemon ON colecao.fk_pokemon = pokemon.id
        WHERE colecao.fk_treinador = ?
        ORDER BY colecao.dt_desbloqueio DESC
    `;
    return database.executar(instrucaoSql, [idTreinador]);
}

function alterarFavorito(idTreinador, idPokemon, favorito) {
    let instrucaoSql = "UPDATE colecao SET favorito = ? WHERE fk_treinador = ? AND fk_pokemon = ?";
    return database.executar(instrucaoSql, [favorito, idTreinador, idPokemon]);
}

module.exports = {
    buscarPorUsuario,
    buscarPorEmail,
    cadastrar,
    buscarPorConta,
    contarCatalogo,
    buscarResumoColecao,
    buscarResumoTentativas,
    buscarTentativas,
    buscarColecao,
    alterarFavorito
};
