let treinadorModel = require("../models/treinadorModel");
let pokemonModel = require("../models/pokemonModel");

// O SUM e o MAX do MySQL devolvem NULL quando não há linhas.
// Esta função troca NULL por 0 e garante que o valor seja um número.
function numeroOuZero(valor) {
    if (valor == null) {
        return 0;
    }
    return Number(valor);
}

// Resposta padrão quando o banco dá erro.
function erroNoServidor(res, erro) {
    console.log("Erro no banco:", erro);
    return res.status(500).json({ mensagem: "Não foi possível concluir a operação. Tente novamente." });
}

// ---------------- CADASTRO ----------------

function cadastrar(req, res) {
    let nome = req.body.nome;
    let usuario = req.body.usuario;
    let email = req.body.email;
    let senha = req.body.senha;

    // 1) Confere se os campos chegaram
    if (nome == undefined || usuario == undefined || email == undefined || senha == undefined) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    // 2) Tira espaços das pontas; usuário e e-mail sempre em minúsculas,
    //    para "Ash@X.com" e "ash@x.com" serem a mesma conta
    nome = nome.trim();
    usuario = usuario.trim().toLowerCase();
    email = email.trim().toLowerCase();

    if (nome == "" || usuario == "" || email == "" || senha == "") {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    // 3) O nome de treinador já existe?
    return treinadorModel.buscarPorUsuario(usuario)
        .then(function (resultadoUsuario) {
            if (resultadoUsuario.length > 0) {
                res.status(409).json({ mensagem: "Esse nome de treinador já está em uso." });
                return;
            }

            // 4) O e-mail já existe?
            return treinadorModel.buscarPorEmail(email)
                .then(function (resultadoEmail) {
                    if (resultadoEmail.length > 0) {
                        res.status(409).json({ mensagem: "Esse e-mail já está cadastrado." });
                        return;
                    }

                    // 5) Tudo certo: grava no banco
                    return treinadorModel.cadastrar(nome, usuario, email, senha)
                        .then(function () {
                            res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
                        });
                });
        })
        .catch(function (erro) {
            // Garantia extra: o UNIQUE do banco também barra repetidos
            if (erro.code == "ER_DUP_ENTRY") {
                return res.status(409).json({ mensagem: "Esse nome de treinador ou e-mail já está cadastrado." });
            }
            return erroNoServidor(res, erro);
        });
}

// ---------------- LOGIN ----------------

function autenticar(req, res) {
    let conta = req.body.conta;
    let senha = req.body.senha;

    if (conta == undefined || senha == undefined || conta.trim() == "" || senha == "") {
        return res.status(400).json({ mensagem: "Informe seu e-mail ou nome de treinador e sua senha." });
    }

    conta = conta.trim().toLowerCase();

    return treinadorModel.buscarPorConta(conta)
        .then(function (resultado) {
            // Achou a conta E a senha é exatamente igual (maiúsculas contam)?
            if (resultado.length == 1 && resultado[0].senha == senha) {
                // A senha não é enviada de volta ao navegador
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

// ---------------- PAINEL ----------------

function painel(req, res) {
    let idTreinador = Number(req.params.idTreinador);
    if (isNaN(idTreinador) || idTreinador < 1) {
        return res.status(400).json({ mensagem: "Treinador inválido." });
    }

    // Cada consulta guarda o seu resultado neste objeto, uma depois da outra.
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

// ---------------- POKÉDEX ----------------

// Devolve o catálogo inteiro, marcando em cada Pokémon se o treinador
// já o desbloqueou e se ele é favorito.
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

                // Procura este Pokémon na coleção do treinador
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

// ---------------- FAVORITO ----------------

function alterarFavorito(req, res) {
    let idTreinador = Number(req.params.idTreinador);
    let idPokemon = Number(req.params.idPokemon);
    let favorito = req.body.favorito;

    if (isNaN(idTreinador) || isNaN(idPokemon) || (favorito !== 0 && favorito !== 1)) {
        return res.status(400).json({ mensagem: "Dados do favorito inválidos." });
    }

    return treinadorModel.alterarFavorito(idTreinador, idPokemon, favorito)
        .then(function (resultado) {
            // affectedRows = quantas linhas o UPDATE alterou.
            // 0 significa que esse Pokémon não está na coleção do treinador.
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
