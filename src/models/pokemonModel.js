var database = require("../database/config");

function executar(sql, valores) {
    return database.executar(sql, valores);
}

function criarTreinadorComSessao(nome, usuario, email, senhaHash, tokenHash, expiraEm) {
    return database.executarTransacao([
        {
            sql: "INSERT INTO pokemon_treinador (nome, usuario, email, senha_hash) VALUES (?, ?, ?, ?)",
            valores: [nome, usuario, email, senhaHash]
        },
        {
            sql: "INSERT INTO pokemon_sessao (treinador_id, token_hash, expira_em) VALUES (?, ?, ?)",
            valores: function (resultados) {
                return [resultados[0].insertId, tokenHash, expiraEm];
            }
        }
    ]);
}

function buscarConta(conta) {
    return executar(
        "SELECT id, nome, usuario, email, senha_hash FROM pokemon_treinador WHERE email = ? OR usuario = ? LIMIT 1",
        [conta, conta]
    );
}

function criarSessao(treinadorId, tokenHash, expiraEm) {
    return executar(
        "INSERT INTO pokemon_sessao (treinador_id, token_hash, expira_em) VALUES (?, ?, ?)",
        [treinadorId, tokenHash, expiraEm]
    );
}

function buscarSessao(tokenHash) {
    return executar(
        `SELECT t.id, t.nome, t.usuario, t.email
         FROM pokemon_sessao s
         JOIN pokemon_treinador t ON t.id = s.treinador_id
         WHERE s.token_hash = ? AND s.expira_em > UTC_TIMESTAMP()
         LIMIT 1`,
        [tokenHash]
    ).then(function (resultado) {
        return resultado[0] || null;
    });
}

function removerSessao(tokenHash) {
    return executar("DELETE FROM pokemon_sessao WHERE token_hash = ?", [tokenHash]);
}

function listarPokemon() {
    return executar(
        `SELECT id, numero_pokedex AS dexNumber, numero_nacional AS nationalNumber,
                nome AS name, tipos AS types, categoria AS category,
                descricao AS description, altura AS height, imagem_url AS imageURL
         FROM pokemon_catalogo ORDER BY numero_pokedex`
    );
}

function listarPerguntas() {
    return executar(
        `SELECT q.id, q.enunciado AS prompt, q.modo AS mode, q.opcoes AS options,
                p.slug AS silhouetteKey
         FROM pokemon_pergunta q
         JOIN pokemon_catalogo p ON p.id = q.pokemon_id
         WHERE q.ativa = 1 ORDER BY q.id LIMIT 8`
    );
}

function buscarPerguntas(ids) {
    var marcadores = ids.map(function () { return "?"; }).join(", ");
    return executar(
        `SELECT id, pokemon_id, opcoes, resposta_correta
         FROM pokemon_pergunta WHERE ativa = 1 AND id IN (${marcadores})`,
        ids
    );
}

function registrarTentativa(treinadorId, pontos, acertos, erros, total, precisao, resultado, desbloqueados) {
    var instrucoes = desbloqueados.map(function (pokemonId) {
        return {
            sql: "INSERT IGNORE INTO pokemon_colecao (treinador_id, pokemon_id) VALUES (?, ?)",
            valores: [treinadorId, pokemonId]
        };
    });
    instrucoes.push({
        sql: `INSERT INTO pokemon_tentativa
              (treinador_id, pontos, acertos, erros, total, precisao, resultado)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        valores: [treinadorId, pontos, acertos, erros, total, precisao, resultado]
    });

    return database.executarTransacao(instrucoes);
}

function listarPokemonDesbloqueados(ids) {
    if (!ids.length) return Promise.resolve([]);
    var marcadores = ids.map(function () { return "?"; }).join(", ");
    return executar(
        `SELECT id, nome AS name, imagem_url AS imageURL
         FROM pokemon_catalogo WHERE id IN (${marcadores})`,
        ids
    );
}

function buscarVisaoGeral(treinadorId) {
    var consultas = [
        executar(
            `SELECT
                (SELECT COUNT(*) FROM pokemon_catalogo) AS catalogSize,
                (SELECT COUNT(*) FROM pokemon_colecao WHERE treinador_id = ?) AS unlocked,
                (SELECT COUNT(*) FROM pokemon_colecao WHERE treinador_id = ? AND favorito = 1) AS favorites,
                (SELECT COUNT(*) FROM pokemon_tentativa WHERE treinador_id = ?) AS quizzes,
                (SELECT COALESCE(SUM(acertos), 0) FROM pokemon_tentativa WHERE treinador_id = ?) AS totalCorrect,
                (SELECT COALESCE(SUM(total), 0) FROM pokemon_tentativa WHERE treinador_id = ?) AS totalAnswers,
                (SELECT COALESCE(MAX(pontos), 0) FROM pokemon_tentativa WHERE treinador_id = ?) AS bestScore`,
            [treinadorId, treinadorId, treinadorId, treinadorId, treinadorId, treinadorId]
        ),
        executar(
            `SELECT a.id, a.pontos AS score, a.acertos AS correct, a.erros AS wrong,
                    a.total, a.precisao AS accuracy, a.criado_em AS completedAt
             FROM pokemon_tentativa a WHERE a.treinador_id = ?
             ORDER BY a.criado_em DESC LIMIT 8`,
            [treinadorId]
        ),
        executar(
            `SELECT p.id, p.nome AS name, p.numero_pokedex AS dexNumber,
                    p.tipos AS types, p.categoria AS category, p.descricao AS description,
                    p.altura AS height, p.imagem_url AS imageURL,
                    c.favorito AS favorite, c.criado_em AS unlockedAt
             FROM pokemon_colecao c JOIN pokemon_catalogo p ON p.id = c.pokemon_id
             WHERE c.treinador_id = ? ORDER BY c.criado_em DESC`,
            [treinadorId]
        )
    ];

    return Promise.all(consultas).then(function (resultados) {
        var stats = resultados[0][0] || {};
        var catalogSize = Number(stats.catalogSize) || 0;
        var totalAnswers = Number(stats.totalAnswers) || 0;
        var totalCorrect = Number(stats.totalCorrect) || 0;

        return {
            stats: {
                unlocked: Number(stats.unlocked) || 0,
                progress: catalogSize ? Math.round((Number(stats.unlocked) / catalogSize) * 100) : 0,
                favorites: Number(stats.favorites) || 0,
                quizzes: Number(stats.quizzes) || 0,
                accuracy: totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
                bestScore: Number(stats.bestScore) || 0,
                catalogSize: catalogSize
            },
            attempts: resultados[1],
            collection: resultados[2].map(function (item) {
                item.types = parseJson(item.types, []);
                return item;
            })
        };
    }).then(function (overview) {
        var counts = new Map();
        overview.collection.forEach(function (item) {
            item.types.forEach(function (type) {
                counts.set(type, (counts.get(type) || 0) + 1);
            });
        });
        overview.topTypes = Array.from(counts.entries())
            .map(function (entry) { return { type: entry[0], count: entry[1] }; })
            .sort(function (a, b) { return b.count - a.count; })
            .slice(0, 5);
        return overview;
    });
}

function listarPokedex(treinadorId) {
    return executar(
        `SELECT p.id, p.numero_pokedex AS dexNumber, p.numero_nacional AS nationalNumber,
                p.nome AS name, p.tipos AS types, p.categoria AS category,
                p.descricao AS description, p.altura AS height, p.imagem_url AS imageURL,
                (c.id IS NOT NULL) AS unlocked, COALESCE(c.favorito, 0) AS favorite
         FROM pokemon_catalogo p
         LEFT JOIN pokemon_colecao c ON c.pokemon_id = p.id AND c.treinador_id = ?
         ORDER BY p.numero_pokedex`,
        [treinadorId]
    ).then(function (itens) {
        return itens.map(function (item) {
            item.types = parseJson(item.types, []);
            item.unlocked = Boolean(item.unlocked);
            item.favorite = Boolean(item.favorite);
            return item;
        });
    });
}

function alterarFavorito(treinadorId, pokemonId, favorito) {
    return executar(
        "UPDATE pokemon_colecao SET favorito = ? WHERE treinador_id = ? AND pokemon_id = ?",
        [favorito, treinadorId, pokemonId]
    );
}

function possuiPokemonDesbloqueado(treinadorId, pokemonId) {
    return executar(
        "SELECT id FROM pokemon_colecao WHERE treinador_id = ? AND pokemon_id = ? LIMIT 1",
        [treinadorId, pokemonId]
    ).then(function (resultado) {
        return resultado.length > 0;
    });
}

function parseJson(value, fallback) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return fallback;
    var parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("Dados JSON inválidos no banco.");
    return parsed;
}

module.exports = {
    criarTreinadorComSessao,
    buscarConta,
    criarSessao,
    buscarSessao,
    removerSessao,
    listarPokemon,
    listarPerguntas,
    buscarPerguntas,
    registrarTentativa,
    listarPokemonDesbloqueados,
    buscarVisaoGeral,
    listarPokedex,
    alterarFavorito,
    possuiPokemonDesbloqueado
};
