var pokemonModel = require("../models/pokemonModel");

function listarPokemon(req, res) {
    return pokemonModel.listarPokemon()
        .then(function (pokemon) {
            res.json(pokemon.map(normalizarPokemon));
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao consultar catálogo Pokémon:");
        });
}

function tratarErroBanco(erro, res, mensagem) {
    console.error(mensagem, erro);
    return res.status(500).json({ mensagem: "Não foi possível concluir a operação. Tente novamente." });
}

function parseJson(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") throw new Error("Dados JSON inválidos no banco.");
    var parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("Dados JSON inválidos no banco.");
    return parsed;
}

function normalizarPokemon(pokemon) {
    return {
        id: pokemon.id,
        dexNumber: pokemon.dexNumber,
        nationalNumber: pokemon.nationalNumber,
        name: pokemon.name,
        types: parseJson(pokemon.types),
        category: pokemon.category,
        description: pokemon.description,
        height: pokemon.height,
        imageURL: pokemon.imageURL
    };
}

module.exports = {
    listarPokemon
};
