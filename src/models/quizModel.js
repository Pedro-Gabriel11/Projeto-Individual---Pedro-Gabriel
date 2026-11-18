var database = require("../database/config");

function executar(sql, valores) {
    return database.executar(sql, valores);
}

function listarPerguntas() {
    return executar(
        `SELECT q.id, q.enunciado AS prompt, q.modo AS mode, q.opcoes AS options,
                p.slug AS silhouetteKey
         FROM pokemon_pergunta q
         JOIN pokemon_catalogo p ON p.id = q.pokemon_id
         WHERE q.ativa = 1 ORDER BY q.id LIMIT 8`
    );
}

function buscarPerguntas(ids) {
    var marcadores = ids.map(function () { return "?"; }).join(", ");
    return executar(
        `SELECT id, pokemon_id, opcoes, resposta_correta
         FROM pokemon_pergunta WHERE ativa = 1 AND id IN (${marcadores})`,
        ids
    );
}

function registrarTentativa(treinadorId, pontos, acertos, erros, total, precisao, resultado, desbloqueados) {
    var instrucoes = desbloqueados.map(function (pokemonId) {
        return {
            sql: "INSERT IGNORE INTO pokemon_colecao (treinador_id, pokemon_id) VALUES (?, ?)",
            valores: [treinadorId, pokemonId]
        };
    });
    instrucoes.push({
        sql: `INSERT INTO pokemon_tentativa
              (treinador_id, pontos, acertos, erros, total, precisao, resultado)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        valores: [treinadorId, pontos, acertos, erros, total, precisao, resultado]
    });

    return database.executarTransacao(instrucoes);
}

module.exports = {
    listarPerguntas,
    buscarPerguntas,
    registrarTentativa
};
