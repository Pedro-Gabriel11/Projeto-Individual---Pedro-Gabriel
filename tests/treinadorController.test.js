// Testes do treinadorController.
// Eles NÃO usam o banco: trocamos as funções do model por versões falsas,
// que devolvem o que o teste precisa. Assim testamos só as regras do controller.

let test = require("node:test");
let assert = require("node:assert/strict");
let treinadorModel = require("../src/models/treinadorModel");
let treinadorController = require("../src/controllers/treinadorController");

// Guarda as funções originais do model para restaurar depois de cada teste.
let funcoesOriginais = {};
for (let nome in treinadorModel) {
    funcoesOriginais[nome] = treinadorModel[nome];
}

test.afterEach(function () {
    for (let nome in funcoesOriginais) {
        treinadorModel[nome] = funcoesOriginais[nome];
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
