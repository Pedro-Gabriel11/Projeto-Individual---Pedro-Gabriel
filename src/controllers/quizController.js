let quizModel = require("../models/quizModel");

function separarIdsNovos(idsAcertados, idsDaColecao) {
    let novos = [];
    for (let i = 0; i < idsAcertados.length; i++) {
        let id = idsAcertados[i];
        let jaTem = idsDaColecao.indexOf(id) != -1;
        let jaSeparado = novos.indexOf(id) != -1;
        if (!jaTem && !jaSeparado) {
            novos.push(id);
        }
    }
    return novos;
}

function registrarTentativa(req, res) {
    let idTreinador = Number(req.body.idTreinador);
    let acertos = Number(req.body.acertos);
    let erros = Number(req.body.erros);
    let idsAcertados = req.body.idsAcertados;

    if (isNaN(idTreinador) || idTreinador < 1) {
        return res.status(400).json({ mensagem: "Treinador inválido." });
    }
    if (isNaN(acertos) || isNaN(erros) || acertos < 0 || erros < 0 || acertos + erros == 0) {
        return res.status(400).json({ mensagem: "Resultado da partida inválido." });
    }
    if (!Array.isArray(idsAcertados)) {
        return res.status(400).json({ mensagem: "Lista de Pokémon acertados inválida." });
    }

    let pontos = acertos * 100;
    let novos = [];

    return quizModel.registrarTentativa(idTreinador, acertos, erros, pontos)
        .then(function () {
            return quizModel.buscarIdsDaColecao(idTreinador);
        })
        .then(function (resultado) {
            let idsDaColecao = [];
            for (let i = 0; i < resultado.length; i++) {
                idsDaColecao.push(resultado[i].fk_pokemon);
            }
            novos = separarIdsNovos(idsAcertados, idsDaColecao);

            let fila = Promise.resolve();
            for (let i = 0; i < novos.length; i++) {
                let idPokemon = novos[i];
                fila = fila.then(function () {
                    return quizModel.desbloquearPokemon(idTreinador, idPokemon);
                });
            }
            return fila;
        })
        .then(function () {
            res.status(200).json({ pontos: pontos, novos: novos });
        })
        .catch(function (erro) {
            console.log("Erro no banco:", erro);
            res.status(500).json({ mensagem: "Não foi possível salvar a partida. Tente novamente." });
        });
}

module.exports = {
    separarIdsNovos,
    registrarTentativa
};
