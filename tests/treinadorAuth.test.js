const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const treinadorModel = require("../src/models/treinadorModel");
const treinadorController = require("../src/controllers/treinadorController");

const buscarSessaoOriginal = treinadorModel.buscarSessao;
const consoleErrorOriginal = console.error;

function criarResposta() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

function autenticar(authorization) {
    const req = { headers: { authorization } };

    return new Promise((resolve, reject) => {
        const res = criarResposta();
        const jsonOriginal = res.json;
        res.json = function (body) {
            jsonOriginal.call(this, body);
            resolve({ req, res, nextCalled: false });
            return this;
        };

        Promise.resolve(treinadorController.autenticarTreinador(req, res, () => {
            resolve({ req, res, nextCalled: true });
        })).catch(reject);
    });
}

test.afterEach(() => {
    treinadorModel.buscarSessao = buscarSessaoOriginal;
    console.error = consoleErrorOriginal;
});

test("autenticação rejeita cabeçalho ausente ou Bearer malformado sem consultar a sessão", async () => {
    let consultas = 0;
    treinadorModel.buscarSessao = async () => {
        consultas += 1;
        return null;
    };

    const ausente = await autenticar(undefined);
    const malformado = await autenticar("Basic token");

    assert.equal(ausente.res.statusCode, 401);
    assert.deepEqual(ausente.res.body, { mensagem: "Entre na sua conta para continuar." });
    assert.equal(malformado.res.statusCode, 401);
    assert.deepEqual(malformado.res.body, { mensagem: "Entre na sua conta para continuar." });
    assert.equal(consultas, 0);
});

test("autenticação consulta o hash do token e rejeita sessão inexistente ou expirada", async () => {
    const token = "token-exemplo_123";
    const tokenHashEsperado = crypto.createHash("sha256").update(token).digest("hex");
    let hashConsultado;
    treinadorModel.buscarSessao = async (tokenHash) => {
        hashConsultado = tokenHash;
        return null;
    };

    const resultado = await autenticar("Bearer " + token);

    assert.equal(hashConsultado, tokenHashEsperado);
    assert.equal(resultado.res.statusCode, 401);
    assert.deepEqual(resultado.res.body, { mensagem: "Sua sessão expirou. Entre novamente." });
    assert.equal(resultado.nextCalled, false);
});

test("autenticação anexa o treinador e o hash da sessão antes de prosseguir", async () => {
    const token = "token-valido_456";
    const tokenHashEsperado = crypto.createHash("sha256").update(token).digest("hex");
    const treinador = { id: 42, nome: "Treinador Alola" };
    treinadorModel.buscarSessao = async () => treinador;

    const resultado = await autenticar("Bearer " + token);

    assert.equal(resultado.nextCalled, true);
    assert.equal(resultado.req.treinador, treinador);
    assert.equal(resultado.req.tokenHash, tokenHashEsperado);
    assert.equal(resultado.res.statusCode, 200);
});

test("autenticação trata falhas na consulta da sessão como erro interno", async () => {
    treinadorModel.buscarSessao = async () => {
        throw new Error("Falha simulada no banco.");
    };
    console.error = () => {};

    const resultado = await autenticar("Bearer token-valido_789");

    assert.equal(resultado.res.statusCode, 500);
    assert.deepEqual(resultado.res.body, { mensagem: "Não foi possível validar sua sessão." });
    assert.equal(resultado.nextCalled, false);
});
