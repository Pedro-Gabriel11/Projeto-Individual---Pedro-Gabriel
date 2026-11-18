var crypto = require("crypto");
var treinadorModel = require("../models/treinadorModel");

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

    return treinadorModel.criarSessao(treinador.id, tokenHash, expiraEm)
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

    return treinadorModel.criarTreinadorComSessao(
        nome,
        usuario,
        email,
        hashSenha(senha),
        tokenHash,
        expiraEm
    ).then(function (resultados) {
        res.json({
            token: token,
            treinador: {
                id: resultados[0].insertId,
                nome: nome,
                usuario: usuario,
                email: email
            }
        });
    }).catch(function (erro) {
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

    return treinadorModel.buscarConta(conta)
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
    return treinadorModel.removerSessao(req.tokenHash)
        .then(function () {
            res.status(204).end();
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao encerrar sessão:");
        });
}

function visaoGeral(req, res) {
    return treinadorModel.buscarVisaoGeral(req.treinador.id)
        .then(function (visao) {
            res.json(visao);
        })
        .catch(function (erro) {
            tratarErroBanco(erro, res, "Erro ao montar painel do treinador:");
        });
}

function listarPokedex(req, res) {
    return treinadorModel.listarPokedex(req.treinador.id)
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

    return treinadorModel.alterarFavorito(req.treinador.id, pokemonId, favorito)
        .then(function (resultado) {
            if (resultado.affectedRows !== 1) {
                return treinadorModel.possuiPokemonDesbloqueado(req.treinador.id, pokemonId)
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

module.exports = {
    cadastrar,
    autenticar,
    sair,
    visaoGeral,
    listarPokedex,
    alterarFavorito
};
