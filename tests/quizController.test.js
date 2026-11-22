// Testes do quizController (sem banco: as funções do model são trocadas por versões falsas).

let test = require("node:test");
let assert = require("node:assert/strict");
let quizModel = require("../src/models/quizModel");
let quizController = require("../src/controllers/quizController");

let originais = {};
for (let nome in quizModel) {
    originais[nome] = quizModel[nome];
}

test.afterEach(function () {
    for (let nome in originais) {
        quizModel[nome] = originais[nome];
    }
});

function respostaFalsa() {
    return {
        statusCode: 200,
        corpo: undefined,
        status: function (codigo) {
            this.statusCode = codigo;
            return this;
        },
        json: function (dados) {
            this.corpo = dados;
            return this;
        }
    };
}

test("separarIdsNovos remove os que já estão na coleção e repetidos", function () {
    assert.deepEqual(quizController.separarIdsNovos([3, 5, 5, 8], [5]), [3, 8]);
});

test("tentativa sem idTreinador responde 400", function () {
    let res = respostaFalsa();
    quizController.registrarTentativa({ body: { acertos: 1, erros: 9, idsAcertados: [3] } }, res);
    assert.equal(res.statusCode, 400);
});

test("tentativa com idsAcertados que não é vetor responde 400", function () {
    let res = respostaFalsa();
    quizController.registrarTentativa({ body: { idTreinador: 1, acertos: 1, erros: 9, idsAcertados: "3" } }, res);
    assert.equal(res.statusCode, 400);
});

test("tentativa grava pontos e desbloqueia só os novos", function () {
    let tentativaGravada;
    let desbloqueados = [];
    quizModel.registrarTentativa = function (idTreinador, acertos, erros, pontos) {
        tentativaGravada = [idTreinador, acertos, erros, pontos];
        return Promise.resolve({ insertId: 1 });
    };
    quizModel.buscarIdsDaColecao = function () {
        return Promise.resolve([{ fk_pokemon: 5 }]);
    };
    quizModel.desbloquearPokemon = function (idTreinador, idPokemon) {
        desbloqueados.push(idPokemon);
        return Promise.resolve({ affectedRows: 1 });
    };

    let res = respostaFalsa();
    let corpo = { idTreinador: 1, acertos: 3, erros: 7, idsAcertados: [3, 5, 8] };
    return quizController.registrarTentativa({ body: corpo }, res).then(function () {
        assert.deepEqual(tentativaGravada, [1, 3, 7, 300]);
        assert.deepEqual(desbloqueados, [3, 8]);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.corpo, { pontos: 300, novos: [3, 8] });
    });
});
