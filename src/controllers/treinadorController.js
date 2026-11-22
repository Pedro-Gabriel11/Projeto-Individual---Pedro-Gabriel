let treinadorModel = require("../models/treinadorModel");

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

    return treinadorModel.autenticar(conta, senha)
        .then(function (resultado) {
            if (resultado.length == 1) {
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

module.exports = {
    cadastrar,
    autenticar
};
