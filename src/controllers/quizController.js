var quizModel = require("../models/quizModel");
var pokemonModel = require("../models/pokemonModel");

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

function listarPerguntas(req, res) {
    return quizModel.listarPerguntas()
        .then(function (perguntas) {
            res.json(perguntas.map(function (pergunta) {
                return {
                    id: pergunta.id,
                    prompt: pergunta.prompt,
                    mode: pergunta.mode,
                    silhouetteKey: pergunta.silhouetteKey,
                    options: parseJson(pergunta.options)
                };
            }));
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao consultar perguntas do quiz:");
        });
}

function registrarTentativa(req, res) {
    var envios = req.body && req.body.submissions;
    if (!Array.isArray(envios) || envios.length < 1 || envios.length > 8) {
        return res.status(400).json({ mensagem: "A partida deve conter de 1 a 8 respostas." });
    }

    var ids = [];
    for (var i = 0; i < envios.length; i++) {
        var id = Number(envios[i] && envios[i].questionID);
        if (!Number.isInteger(id) || id < 1 || ids.indexOf(id) !== -1 ||
            typeof envios[i].answer !== "string" || !envios[i].answer.trim()) {
            return res.status(400).json({ mensagem: "As respostas enviadas são inválidas." });
        }
        ids.push(id);
    }

    return quizModel.buscarPerguntas(ids)
        .then(function (perguntas) {
            if (perguntas.length !== ids.length) {
                return res.status(400).json({ mensagem: "A partida contém perguntas inválidas ou indisponíveis." });
            }

            var porId = new Map(perguntas.map(function (pergunta) { return [Number(pergunta.id), pergunta]; }));
            var pokemonCorretos = new Set();
            var acertos = 0;

            for (var j = 0; j < envios.length; j++) {
                var pergunta = porId.get(ids[j]);
                var opcoes = parseJson(pergunta.opcoes);
                if (!opcoes.includes(envios[j].answer)) {
                    return res.status(400).json({ mensagem: "Uma resposta não pertence às opções da pergunta." });
                }
                if (envios[j].answer === pergunta.resposta_correta) {
                    acertos += 1;
                    pokemonCorretos.add(Number(pergunta.pokemon_id));
                }
            }

            var total = envios.length;
            var erros = total - acertos;
            var precisao = Math.round((acertos / total) * 100);
            var resultado = precisao >= 80 ? "expert" : precisao >= 50 ? "explorer" : "beginner";
            var desbloqueados = Array.from(pokemonCorretos);

            return quizModel.registrarTentativa(
                req.treinador.id,
                acertos * 100,
                acertos,
                erros,
                total,
                precisao,
                resultado,
                desbloqueados
            ).then(function (resultados) {
                var novosIds = desbloqueados.filter(function (pokemonId, indice) {
                    return resultados[indice] && resultados[indice].affectedRows === 1;
                });
                return pokemonModel.listarPokemonDesbloqueados(novosIds)
                    .then(function (novosPokemon) {
                        res.json({
                            score: acertos * 100,
                            correct: acertos,
                            wrong: erros,
                            accuracy: precisao,
                            newlyUnlocked: novosPokemon
                        });
                    });
            });
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao salvar tentativa do quiz:");
        });
}

module.exports = {
    listarPerguntas,
    registrarTentativa
};
