let quizModel = require("../models/quizModel");

// Recebe os ids que o treinador acertou no quiz e os ids que ele já tem.
// Devolve só os ids novos, sem repetir nenhum.
// Exemplo: separarIdsNovos([3, 5, 5, 8], [5]) → [3, 8]
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

    // 1) Grava a partida
    return quizModel.registrarTentativa(idTreinador, acertos, erros, pontos)
        .then(function () {
            // 2) Busca o que o treinador já tem
            return quizModel.buscarIdsDaColecao(idTreinador);
        })
        .then(function (resultado) {
            // O banco devolve [{ fk_pokemon: 5 }, ...]; transformamos em [5, ...]
            let idsDaColecao = [];
            for (let i = 0; i < resultado.length; i++) {
                idsDaColecao.push(resultado[i].fk_pokemon);
            }
            novos = separarIdsNovos(idsAcertados, idsDaColecao);

            // 3) Desbloqueia os novos, um de cada vez, como uma fila:
            //    cada .then espera o INSERT anterior terminar.
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
