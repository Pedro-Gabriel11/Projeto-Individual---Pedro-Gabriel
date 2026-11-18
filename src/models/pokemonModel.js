var database = require("../database/config");

function listarPokemon() {
    return database.executar(
        `SELECT id, numero_pokedex AS dexNumber, numero_nacional AS nationalNumber,
                nome AS name, tipos AS types, categoria AS category,
                descricao AS description, altura AS height, imagem_url AS imageURL
         FROM pokemon_catalogo ORDER BY numero_pokedex`
    );
}

function listarPokemonDesbloqueados(ids) {
    if (!ids.length) return Promise.resolve([]);
    var marcadores = ids.map(function () { return "?"; }).join(", ");
    return database.executar(
        `SELECT id, nome AS name, imagem_url AS imageURL
         FROM pokemon_catalogo WHERE id IN (${marcadores})`,
        ids
    );
}

module.exports = {
    listarPokemon,
    listarPokemonDesbloqueados
};
