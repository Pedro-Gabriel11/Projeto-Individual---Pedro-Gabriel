// Testes do treinadorController.
// Eles NÃO usam o banco: trocamos as funções do model por versões falsas,
// que devolvem o que o teste precisa. Assim testamos só as regras do controller.

let test = require("node:test");
let assert = require("node:assert/strict");
let treinadorModel = require("../src/models/treinadorModel");
let pokemonModel = require("../src/models/pokemonModel");
let treinadorController = require("../src/controllers/treinadorController");

// Guarda as funções originais dos models para restaurar depois de cada teste.
let originaisTreinador = {};
for (let nome in treinadorModel) {
    originaisTreinador[nome] = treinadorModel[nome];
}
let originaisPokemon = {};
for (let nome in pokemonModel) {
    originaisPokemon[nome] = pokemonModel[nome];
}

test.afterEach(function () {
    for (let nome in originaisTreinador) {
        treinadorModel[nome] = originaisTreinador[nome];
    }
    for (let nome in originaisPokemon) {
        pokemonModel[nome] = originaisPokemon[nome];
    }
});

// Imita o objeto "res" do Express: guarda o status e o JSON enviados.
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

function cadastroValido() {
    return { nome: "Ash Ketchum", usuario: "ash_k", email: "ash@x.com", senha: "Pikachu@25" };
}

// ---------------- CADASTRO ----------------

test("cadastro sem nome responde 400", function () {
    let modelChamado = false;
    treinadorModel.buscarPorUsuario = function () {
        modelChamado = true;
        return Promise.resolve([]);
    };

    let corpo = cadastroValido();
    delete corpo.nome;
    let res = respostaFalsa();
    treinadorController.cadastrar({ body: corpo }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(modelChamado, false);
});

test("cadastro com usuário repetido responde 409 e não insere", function () {
    let inseriu = false;
    treinadorModel.buscarPorUsuario = function () { return Promise.resolve([{ id: 1 }]); };
    treinadorModel.buscarPorEmail = function () { return Promise.resolve([]); };
    treinadorModel.cadastrar = function () {
        inseriu = true;
        return Promise.resolve({ insertId: 2 });
    };

    let res = respostaFalsa();
    return treinadorController.cadastrar({ body: cadastroValido() }, res).then(function () {
        assert.equal(res.statusCode, 409);
        assert.equal(res.corpo.mensagem, "Esse nome de treinador já está em uso.");
        assert.equal(inseriu, false);
    });
});

test("cadastro com e-mail repetido responde 409", function () {
    let inseriu = false;
    treinadorModel.buscarPorUsuario = function () { return Promise.resolve([]); };
    treinadorModel.buscarPorEmail = function () { return Promise.resolve([{ id: 1 }]); };
    treinadorModel.cadastrar = function () {
        inseriu = true;
        return Promise.resolve({ insertId: 2 });
    };

    let res = respostaFalsa();
    return treinadorController.cadastrar({ body: cadastroValido() }, res).then(function () {
        assert.equal(res.statusCode, 409);
        assert.equal(res.corpo.mensagem, "Esse e-mail já está cadastrado.");
        assert.equal(inseriu, false);
    });
});

test("cadastro normaliza e-mail e usuário antes de consultar", function () {
    let usuarioConsultado;
    let emailConsultado;
    let dadosInseridos;
    treinadorModel.buscarPorUsuario = function (usuario) {
        usuarioConsultado = usuario;
        return Promise.resolve([]);
    };
    treinadorModel.buscarPorEmail = function (email) {
        emailConsultado = email;
        return Promise.resolve([]);
    };
    treinadorModel.cadastrar = function (nome, usuario, email, senha) {
        dadosInseridos = [nome, usuario, email, senha];
        return Promise.resolve({ insertId: 2 });
    };

    let corpo = cadastroValido();
    corpo.usuario = " Ash_K ";
    corpo.email = " Ash@X.com ";
    let res = respostaFalsa();
    return treinadorController.cadastrar({ body: corpo }, res).then(function () {
        assert.equal(usuarioConsultado, "ash_k");
        assert.equal(emailConsultado, "ash@x.com");
        assert.deepEqual(dadosInseridos, ["Ash Ketchum", "ash_k", "ash@x.com", "Pikachu@25"]);
        assert.equal(res.statusCode, 201);
    });
});

// ---------------- LOGIN ----------------

test("login com dados certos devolve o treinador", function () {
    treinadorModel.autenticar = function () {
        return Promise.resolve([{ id: 7, nome: "Ash Ketchum", usuario: "ash_k", email: "ash@x.com" }]);
    };

    let res = respostaFalsa();
    return treinadorController.autenticar({ body: { conta: "ash_k", senha: "Pikachu@25" } }, res).then(function () {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.corpo, { id: 7, nome: "Ash Ketchum", usuario: "ash_k", email: "ash@x.com" });
    });
});

test("login errado responde 403", function () {
    treinadorModel.autenticar = function () { return Promise.resolve([]); };

    let res = respostaFalsa();
    return treinadorController.autenticar({ body: { conta: "ash_k", senha: "errada" } }, res).then(function () {
        assert.equal(res.statusCode, 403);
        assert.equal(res.corpo.mensagem, "E-mail/usuário ou senha inválidos.");
    });
});

test("login normaliza a conta", function () {
    let contaConsultada;
    treinadorModel.autenticar = function (conta) {
        contaConsultada = conta;
        return Promise.resolve([]);
    };

    let res = respostaFalsa();
    return treinadorController.autenticar({ body: { conta: " Ash@X.com ", senha: "Pikachu@25" } }, res).then(function () {
        assert.equal(contaConsultada, "ash@x.com");
    });
});

// ---------------- PAINEL ----------------

test("painel de treinador sem partidas mostra zeros", function () {
    treinadorModel.contarCatalogo = function () { return Promise.resolve([{ total: 106 }]); };
    treinadorModel.buscarResumoColecao = function () { return Promise.resolve([{ desbloqueados: 0, favoritos: null }]); };
    treinadorModel.buscarResumoTentativas = function () {
        return Promise.resolve([{ quizzes: 0, totalAcertos: null, totalErros: null, melhorPontuacao: null }]);
    };
    treinadorModel.buscarTentativas = function () { return Promise.resolve([]); };
    treinadorModel.buscarColecao = function () { return Promise.resolve([]); };

    let res = respostaFalsa();
    return treinadorController.painel({ params: { idTreinador: "1" } }, res).then(function () {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.corpo.estatisticas, {
            totalCatalogo: 106,
            desbloqueados: 0,
            favoritos: 0,
            quizzes: 0,
            totalAcertos: 0,
            totalErros: 0,
            melhorPontuacao: 0
        });
        assert.deepEqual(res.corpo.tentativas, []);
        assert.deepEqual(res.corpo.colecao, []);
    });
});

test("painel com id inválido responde 400", function () {
    let res = respostaFalsa();
    treinadorController.painel({ params: { idTreinador: "abc" } }, res);
    assert.equal(res.statusCode, 400);
});

// ---------------- POKÉDEX ----------------

test("pokedex marca desbloqueados e favoritos", function () {
    pokemonModel.listarPokemon = function () {
        return Promise.resolve([{ id: 1, nome: "Rowlet" }, { id: 2, nome: "Dartrix" }, { id: 3, nome: "Decidueye" }]);
    };
    treinadorModel.buscarColecao = function () { return Promise.resolve([{ id: 2, favorito: 1 }]); };

    let res = respostaFalsa();
    return treinadorController.pokedex({ params: { idTreinador: "1" } }, res).then(function () {
        assert.equal(res.corpo.length, 3);
        assert.equal(res.corpo[0].desbloqueado, 0);
        assert.equal(res.corpo[0].favorito, 0);
        assert.equal(res.corpo[1].desbloqueado, 1);
        assert.equal(res.corpo[1].favorito, 1);
        assert.equal(res.corpo[2].desbloqueado, 0);
        assert.equal(res.corpo[2].favorito, 0);
    });
});

// ---------------- FAVORITO ----------------

test("favorito com valor inválido responde 400", function () {
    let res = respostaFalsa();
    treinadorController.alterarFavorito({ params: { idTreinador: "1", idPokemon: "2" }, body: { favorito: "sim" } }, res);
    assert.equal(res.statusCode, 400);
});

test("favorito em Pokémon bloqueado responde 404", function () {
    treinadorModel.alterarFavorito = function () { return Promise.resolve({ affectedRows: 0 }); };

    let res = respostaFalsa();
    return treinadorController.alterarFavorito({ params: { idTreinador: "1", idPokemon: "2" }, body: { favorito: 1 } }, res)
        .then(function () {
            assert.equal(res.statusCode, 404);
            assert.equal(res.corpo.mensagem, "Esse Pokémon ainda não foi desbloqueado.");
        });
});

test("favorito em Pokémon desbloqueado responde com o novo valor", function () {
    let valoresRecebidos;
    treinadorModel.alterarFavorito = function (idTreinador, idPokemon, favorito) {
        valoresRecebidos = [idTreinador, idPokemon, favorito];
        return Promise.resolve({ affectedRows: 1 });
    };

    let res = respostaFalsa();
    return treinadorController.alterarFavorito({ params: { idTreinador: "1", idPokemon: "2" }, body: { favorito: 1 } }, res)
        .then(function () {
            assert.deepEqual(valoresRecebidos, [1, 2, 1]);
            assert.equal(res.statusCode, 200);
            assert.deepEqual(res.corpo, { favorito: 1 });
        });
});
