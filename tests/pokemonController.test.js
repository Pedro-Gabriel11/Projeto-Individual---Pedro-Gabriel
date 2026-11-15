const test = require("node:test");
const assert = require("node:assert/strict");
const pokemonModel = require("../src/models/pokemonModel");
const controller = require("../src/controllers/pokemonController");

const modelMethods = [
    "criarTreinadorComSessao",
    "buscarConta",
    "criarSessao",
    "alterarFavorito",
    "possuiPokemonDesbloqueado",
    "listarPerguntas",
    "buscarPerguntas",
    "registrarTentativa",
    "listarPokemonDesbloqueados"
];

const originalMethods = {};
modelMethods.forEach((name) => {
    originalMethods[name] = pokemonModel[name];
});

function response() {
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
        },
        end() {
            return this;
        }
    };
}

test.afterEach(() => {
    modelMethods.forEach((name) => {
        pokemonModel[name] = originalMethods[name];
    });
});

test("signup validates fields and persists a password hash, not the password", async () => {
    let savedPasswordHash;
    pokemonModel.criarTreinadorComSessao = async (...values) => {
        savedPasswordHash = values[3];
        return [{ insertId: 7 }, { insertId: 9 }];
    };

    const invalid = response();
    await controller.cadastrar({ body: { nome: "A", usuario: "xy", email: "bad", senha: "123" } }, invalid);
    assert.equal(invalid.statusCode, 400);

    const valid = response();
    await controller.cadastrar({
        body: { nome: "Treinador", usuario: "treinador_1", email: "trainer@example.com", senha: "senha1234" }
    }, valid);
    assert.match(savedPasswordHash, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
    assert.notEqual(savedPasswordHash, "senha1234");
    assert.equal(valid.body.treinador.id, 7);
    assert.equal(valid.body.treinador.senha, undefined);

    pokemonModel.buscarConta = async () => [{
        id: 7,
        nome: "Treinador",
        usuario: "treinador_1",
        email: "trainer@example.com",
        senha_hash: savedPasswordHash
    }];
    pokemonModel.criarSessao = async () => [];
    const login = response();
    await controller.autenticar({ body: { conta: "treinador_1", senha: "senha1234" } }, login);
    assert.equal(login.statusCode, 200);
    assert.equal(login.body.treinador.id, 7);
    assert.ok(login.body.token);
});

test("quiz keeps the answer key private and calculates results on the server", async () => {
    pokemonModel.listarPerguntas = async () => [{
        id: 1,
        prompt: "Qual é este Pokémon?",
        mode: "silhouette",
        silhouetteKey: "rowlet",
        options: '["Rowlet","Litten","Popplio","Pikachu"]',
        correctAnswer: "Rowlet"
    }];
    const questions = response();
    await controller.listarPerguntas({}, questions);
    assert.equal(questions.body[0].silhouetteKey, "rowlet");
    assert.equal(questions.body[0].correctAnswer, undefined);

    pokemonModel.buscarPerguntas = async () => [
        { id: 1, pokemon_id: 1, opcoes: '["Rowlet","Litten"]', resposta_correta: "Rowlet" },
        { id: 2, pokemon_id: 2, opcoes: '["Popplio","Pikachu"]', resposta_correta: "Popplio" }
    ];
    let attempt;
    pokemonModel.registrarTentativa = async (...values) => {
        attempt = values;
        return [{ affectedRows: 1 }, { affectedRows: 1 }];
    };
    pokemonModel.listarPokemonDesbloqueados = async () => [{ id: 1, name: "Rowlet" }];

    const result = response();
    await controller.registrarTentativa({
        treinador: { id: 7 },
        body: { submissions: [{ questionID: 1, answer: "Rowlet" }, { questionID: 2, answer: "Pikachu" }] }
    }, result);
    assert.equal(attempt[1], 100);
    assert.equal(attempt[2], 1);
    assert.equal(attempt[3], 1);
    assert.equal(attempt[5], 50);
    assert.deepEqual(result.body, {
        score: 100,
        correct: 1,
        wrong: 1,
        accuracy: 50,
        newlyUnlocked: [{ id: 1, name: "Rowlet" }]
    });
});

test("quiz rejects duplicate questions and answers outside the options", async () => {
    pokemonModel.buscarPerguntas = async () => [
        { id: 1, pokemon_id: 1, opcoes: '["Rowlet","Litten"]', resposta_correta: "Rowlet" }
    ];
    pokemonModel.registrarTentativa = async () => {
        throw new Error("An invalid quiz must not be stored.");
    };
    const duplicate = response();
    await controller.registrarTentativa({
        treinador: { id: 7 },
        body: { submissions: [{ questionID: 1, answer: "Rowlet" }, { questionID: 1, answer: "Litten" }] }
    }, duplicate);
    assert.equal(duplicate.statusCode, 400);

    const unsupported = response();
    await controller.registrarTentativa({
        treinador: { id: 7 },
        body: { submissions: [{ questionID: 1, answer: "Mewtwo" }] }
    }, unsupported);
    assert.equal(unsupported.statusCode, 400);
});

test("favorite updates are idempotent but cannot change a locked Pokémon", async () => {
    pokemonModel.alterarFavorito = async () => ({ affectedRows: 0 });
    pokemonModel.possuiPokemonDesbloqueado = async () => true;
    const unchanged = response();
    await controller.alterarFavorito({
        treinador: { id: 7 },
        params: { pokemonId: "1" },
        body: { favorite: false }
    }, unchanged);
    assert.equal(unchanged.statusCode, 200);
    assert.deepEqual(unchanged.body, { favorite: false });

    pokemonModel.possuiPokemonDesbloqueado = async () => false;
    const locked = response();
    await controller.alterarFavorito({
        treinador: { id: 7 },
        params: { pokemonId: "2" },
        body: { favorite: true }
    }, locked);
    assert.equal(locked.statusCode, 404);
});
