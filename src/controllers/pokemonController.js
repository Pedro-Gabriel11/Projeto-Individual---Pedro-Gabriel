var crypto = require("crypto");
var pokemonModel = require("../models/pokemonModel");

function hashSenha(senha) {
    var sal = crypto.randomBytes(16).toString("hex");
    var hash = crypto.scryptSync(senha, sal, 64).toString("hex");
    return sal + ":" + hash;
}

function verificarSenha(senha, senhaArmazenada) {
    var partes = String(senhaArmazenada || "").split(":");
    if (partes.length !== 2) return false;
    var hashArmazenado = Buffer.from(partes[1], "hex");
    var hashInformado = crypto.scryptSync(senha, partes[0], hashArmazenado.length);
    return hashArmazenado.length === hashInformado.length &&
        crypto.timingSafeEqual(hashArmazenado, hashInformado);
}

function criarSessao(treinador, res) {
    var token = crypto.randomBytes(32).toString("base64url");
    var tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    var expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace("T", " ");

    return pokemonModel.criarSessao(treinador.id, tokenHash, expiraEm)
        .then(function () {
            res.json({
                token: token,
                treinador: {
                    id: treinador.id,
                    nome: treinador.nome,
                    usuario: treinador.usuario,
                    email: treinador.email
                }
            });
        });
}

function tratarErroBanco(erro, res, mensagem) {
    if (erro && erro.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ mensagem: "Este e-mail ou nome de usuário já está cadastrado." });
    }
    console.error(mensagem, erro);
    return res.status(500).json({ mensagem: "Não foi possível concluir a operação. Tente novamente." });
}

function cadastrar(req, res) {
    var body = req.body || {};
    var nome = typeof body.nome === "string" ? body.nome.trim() : "";
    var usuario = typeof body.usuario === "string" ? body.usuario.trim().toLowerCase() : "";
    var email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    var senha = typeof body.senha === "string" ? body.senha : "";

    if (nome.length < 2 || nome.length > 80) {
        return res.status(400).json({ mensagem: "Informe um nome com 2 a 80 caracteres." });
    }
    if (!/^[a-z0-9_]{3,24}$/.test(usuario)) {
        return res.status(400).json({ mensagem: "Use de 3 a 24 letras minúsculas, números ou underscore no usuário." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return res.status(400).json({ mensagem: "Informe um e-mail válido." });
    }
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
        return res.status(400).json({ mensagem: "A senha deve ter ao menos 8 caracteres, com letras e números." });
    }

    var token = crypto.randomBytes(32).toString("base64url");
    var tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    var expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace("T", " ");

    return pokemonModel.criarTreinadorComSessao(nome, usuario, email, hashSenha(senha), tokenHash, expiraEm)
        .then(function (resultados) {
            res.json({
                token: token,
                treinador: {
                    id: resultados[0].insertId,
                    nome: nome,
                    usuario: usuario,
                    email: email
                }
            });
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao cadastrar treinador:");
        });
}

function autenticar(req, res) {
    var body = req.body || {};
    var conta = typeof body.conta === "string" ? body.conta.trim().toLowerCase() : "";
    var senha = typeof body.senha === "string" ? body.senha : "";
    if (!conta || !senha) {
        return res.status(400).json({ mensagem: "Informe seu e-mail ou usuário e sua senha." });
    }

    return pokemonModel.buscarConta(conta)
        .then(function (resultado) {
            var treinador = resultado[0];
            if (!treinador || !verificarSenha(senha, treinador.senha_hash)) {
                return res.status(401).json({ mensagem: "Credenciais incorretas. Verifique e tente novamente." });
            }
            return criarSessao(treinador, res);
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao autenticar treinador:");
        });
}

function sair(req, res) {
    return pokemonModel.removerSessao(req.tokenHash)
        .then(function () {
            res.status(204).end();
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao encerrar sessão:");
        });
}

function listarPokemon(req, res) {
    return pokemonModel.listarPokemon()
        .then(function (pokemon) {
            res.json(pokemon.map(normalizarPokemon));
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao consultar catálogo Pokémon:");
        });
}

function listarPerguntas(req, res) {
    return pokemonModel.listarPerguntas()
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

    return pokemonModel.buscarPerguntas(ids)
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

            return pokemonModel.registrarTentativa(
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

function visaoGeral(req, res) {
    return pokemonModel.buscarVisaoGeral(req.treinador.id)
        .then(function (visao) {
            res.json(visao);
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao montar painel do treinador:");
        });
}

function listarPokedex(req, res) {
    return pokemonModel.listarPokedex(req.treinador.id)
        .then(function (pokemon) {
            res.json(pokemon);
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao consultar a Pokédex do treinador:");
        });
}

function alterarFavorito(req, res) {
    var pokemonId = Number(req.params.pokemonId);
    var favorito = req.body && req.body.favorite;
    if (!Number.isInteger(pokemonId) || pokemonId < 1 || typeof favorito !== "boolean") {
        return res.status(400).json({ mensagem: "Informe um Pokémon e um estado de favorito válidos." });
    }

    return pokemonModel.alterarFavorito(req.treinador.id, pokemonId, favorito)
        .then(function (resultado) {
            if (resultado.affectedRows !== 1) {
                return pokemonModel.possuiPokemonDesbloqueado(req.treinador.id, pokemonId)
                    .then(function (desbloqueado) {
                        if (!desbloqueado) {
                            return res.status(404).json({ mensagem: "Esse Pokémon ainda não foi desbloqueado." });
                        }
                        res.json({ favorite: favorito });
                    });
            }
            res.json({ favorite: favorito });
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao atualizar favorito:");
        });
}

function parseJson(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") throw new Error("Dados JSON inválidos no banco.");
    var parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("Dados JSON inválidos no banco.");
    return parsed;
}

function normalizarPokemon(pokemon) {
    return {
        id: pokemon.id,
        dexNumber: pokemon.dexNumber,
        nationalNumber: pokemon.nationalNumber,
        name: pokemon.name,
        types: parseJson(pokemon.types),
        category: pokemon.category,
        description: pokemon.description,
        height: pokemon.height,
        imageURL: pokemon.imageURL
    };
}

module.exports = {
    cadastrar,
    autenticar,
    sair,
    listarPokemon,
    listarPerguntas,
    registrarTentativa,
    visaoGeral,
    listarPokedex,
    alterarFavorito
};
