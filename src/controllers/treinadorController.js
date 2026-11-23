let treinadorModel = require("../models/treinadorModel");
let pokemonModel = require("../models/pokemonModel");

function numeroOuZero(valor) {
    if (valor == null) {
        return 0;
    }
    return Number(valor);
}

function erroNoServidor(res, erro) {
    console.log("Erro no banco:", erro);
    return res.status(500).json({ mensagem: "Não foi possível concluir a operação. Tente novamente." });
}

function cadastrar(req, res) {
    let nome = req.body.nome;
    let usuario = req.body.usuario;
    let email = req.body.email;
    let senha = req.body.senha;

    if (nome == undefined || usuario == undefined || email == undefined || senha == undefined) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    nome = nome.trim();
    usuario = usuario.trim().toLowerCase();
    email = email.trim().toLowerCase();

    if (nome == "" || usuario == "" || email == "" || senha == "") {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    return treinadorModel.buscarPorUsuario(usuario)
        .then(function (resultadoUsuario) {
            if (resultadoUsuario.length > 0) {
                res.status(409).json({ mensagem: "Esse nome de treinador já está em uso." });
                return;
            }

            return treinadorModel.buscarPorEmail(email)
                .then(function (resultadoEmail) {
                    if (resultadoEmail.length > 0) {
                        res.status(409).json({ mensagem: "Esse e-mail já está cadastrado." });
                        return;
                    }

                    return treinadorModel.cadastrar(nome, usuario, email, senha)
                        .then(function () {
                            res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
                        });
                });
        })
        .catch(function (erro) {
            if (erro.code == "ER_DUP_ENTRY") {
                return res.status(409).json({ mensagem: "Esse nome de treinador ou e-mail já está cadastrado." });
            }
            return erroNoServidor(res, erro);
        });
}

function autenticar(req, res) {
    let conta = req.body.conta;
    let senha = req.body.senha;

    if (conta == undefined || senha == undefined || conta.trim() == "" || senha == "") {
        return res.status(400).json({ mensagem: "Informe seu e-mail ou nome de treinador e sua senha." });
    }

    conta = conta.trim().toLowerCase();

    return treinadorModel.buscarPorConta(conta)
        .then(function (resultado) {
            if (resultado.length == 1 && resultado[0].senha == senha) {
                res.status(200).json({
                    id: resultado[0].id,
                    nome: resultado[0].nome,
                    usuario: resultado[0].usuario,
                    email: resultado[0].email
                });
            } else {
                res.status(403).json({ mensagem: "E-mail/usuário ou senha inválidos." });
            }
        })
        .catch(function (erro) {
            return erroNoServidor(res, erro);
        });
}

function painel(req, res) {
    let idTreinador = Number(req.params.idTreinador);
    if (isNaN(idTreinador) || idTreinador < 1) {
        return res.status(400).json({ mensagem: "Treinador inválido." });
    }

    let resposta = {
        estatisticas: {},
        tentativas: [],
        colecao: []
    };

    return treinadorModel.contarCatalogo()
        .then(function (resultado) {
            resposta.estatisticas.totalCatalogo = numeroOuZero(resultado[0].total);
            return treinadorModel.buscarResumoColecao(idTreinador);
        })
        .then(function (resultado) {
            resposta.estatisticas.desbloqueados = numeroOuZero(resultado[0].desbloqueados);
            resposta.estatisticas.favoritos = numeroOuZero(resultado[0].favoritos);
            return treinadorModel.buscarResumoTentativas(idTreinador);
        })
        .then(function (resultado) {
            resposta.estatisticas.quizzes = numeroOuZero(resultado[0].quizzes);
            resposta.estatisticas.totalAcertos = numeroOuZero(resultado[0].totalAcertos);
            resposta.estatisticas.totalErros = numeroOuZero(resultado[0].totalErros);
            resposta.estatisticas.melhorPontuacao = numeroOuZero(resultado[0].melhorPontuacao);
            return treinadorModel.buscarTentativas(idTreinador);
        })
        .then(function (resultado) {
            resposta.tentativas = resultado;
            return treinadorModel.buscarColecao(idTreinador);
        })
        .then(function (resultado) {
            resposta.colecao = resultado;
            res.status(200).json(resposta);
        })
        .catch(function (erro) {
            return erroNoServidor(res, erro);
        });
}

function pokedex(req, res) {
    let idTreinador = Number(req.params.idTreinador);
    if (isNaN(idTreinador) || idTreinador < 1) {
        return res.status(400).json({ mensagem: "Treinador inválido." });
    }

    let catalogo = [];

    return pokemonModel.listarPokemon()
        .then(function (resultado) {
            catalogo = resultado;
            return treinadorModel.buscarColecao(idTreinador);
        })
        .then(function (colecao) {
            for (let i = 0; i < catalogo.length; i++) {
                catalogo[i].desbloqueado = 0;
                catalogo[i].favorito = 0;

                for (let j = 0; j < colecao.length; j++) {
                    if (colecao[j].id == catalogo[i].id) {
                        catalogo[i].desbloqueado = 1;
                        catalogo[i].favorito = colecao[j].favorito;
                    }
                }
            }
            res.status(200).json(catalogo);
        })
        .catch(function (erro) {
            return erroNoServidor(res, erro);
        });
}

function alterarFavorito(req, res) {
    let idTreinador = Number(req.params.idTreinador);
    let idPokemon = Number(req.params.idPokemon);
    let favorito = req.body.favorito;

    if (isNaN(idTreinador) || isNaN(idPokemon) || (favorito !== 0 && favorito !== 1)) {
        return res.status(400).json({ mensagem: "Dados do favorito inválidos." });
    }

    return treinadorModel.alterarFavorito(idTreinador, idPokemon, favorito)
        .then(function (resultado) {
            if (resultado.affectedRows == 0) {
                res.status(404).json({ mensagem: "Esse Pokémon ainda não foi desbloqueado." });
            } else {
                res.status(200).json({ favorito: favorito });
            }
        })
        .catch(function (erro) {
            return erroNoServidor(res, erro);
        });
}

module.exports = {
    cadastrar,
    autenticar,
    painel,
    pokedex,
    alterarFavorito
};
