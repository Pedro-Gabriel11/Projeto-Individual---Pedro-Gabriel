let pokemonModel = require("../models/pokemonModel");

function listarPokemon(req, res) {
    return pokemonModel.listarPokemon()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro no banco:", erro);
            res.status(500).json({ mensagem: "Não foi possível carregar o catálogo." });
        });
}

module.exports = {
    listarPokemon
};
