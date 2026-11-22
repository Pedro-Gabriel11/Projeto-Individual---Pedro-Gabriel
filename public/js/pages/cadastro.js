// Cadastro: as três funções de validação devolvem "" quando está tudo certo,
// ou a mensagem do primeiro problema encontrado.

function validarUsuario(usuario) {
    if (usuario == "") {
        return "Informe seu nome de treinador.";
    } else if (usuario.length < 3 || usuario.length > 30) {
        return "O nome de treinador precisa ter de 3 a 30 caracteres.";
    } else if (usuario.indexOf(" ") != -1) {
        return "O nome de treinador não pode ter espaços.";
    }
    return "";
}

function validarEmail(email) {
    let posicaoArroba = email.indexOf("@");
    let posicaoPonto = email.lastIndexOf(".");

    if (email == "") {
        return "Informe seu e-mail.";
    } else if (email.indexOf(" ") != -1) {
        return "O e-mail não pode ter espaços.";
    } else if (posicaoArroba < 1) {
        return "O e-mail precisa ter um @ depois do nome.";
    } else if (posicaoPonto < posicaoArroba + 2 || posicaoPonto == email.length - 1) {
        return "O e-mail precisa de um domínio, como @gmail.com.";
    }
    return "";
}

function validarSenha(senha, confirmacao) {
    let temMaiuscula = false;
    let temMinuscula = false;
    let temNumero = false;
    let temEspecial = false;

    // Olha cada caractere da senha, um por vez
    for (let i = 0; i < senha.length; i++) {
        let letra = senha[i];
        if (letra >= "A" && letra <= "Z") {
            temMaiuscula = true;
        } else if (letra >= "a" && letra <= "z") {
            temMinuscula = true;
        } else if (letra >= "0" && letra <= "9") {
            temNumero = true;
        } else {
            temEspecial = true; // qualquer outro caractere: ! @ # $ % ...
        }
    }

    if (senha.length < 8) {
        return "A senha precisa ter pelo menos 8 caracteres.";
    } else if (!temMaiuscula) {
        return "A senha precisa ter uma letra maiúscula.";
    } else if (!temMinuscula) {
        return "A senha precisa ter uma letra minúscula.";
    } else if (!temNumero) {
        return "A senha precisa ter um número.";
    } else if (!temEspecial) {
        return "A senha precisa ter um caractere especial (ex.: ! @ #).";
    } else if (senha != confirmacao) {
        return "As senhas não são iguais.";
    }
    return "";
}

// Chamada pelo botão "Criar conta de treinador" (onclick="cadastrar()").
function cadastrar() {
    let nome = document.getElementById("input-nome").value.trim();
    let usuario = document.getElementById("input-usuario").value.trim();
    let email = document.getElementById("input-email").value.trim();
    let senha = document.getElementById("input-senha").value;
    let confirmacao = document.getElementById("input-confirmacao").value;
    let mensagem = document.getElementById("mensagem-cadastro");

    // Verifica tudo na ordem; mostra só o primeiro problema
    let erro = "";
    if (nome == "") {
        erro = "Informe seu nome.";
    }
    if (erro == "") {
        erro = validarUsuario(usuario);
    }
    if (erro == "") {
        erro = validarEmail(email);
    }
    if (erro == "") {
        erro = validarSenha(senha, confirmacao);
    }

    if (erro != "") {
        mensagem.textContent = erro;
        return;
    }

    mensagem.textContent = "Criando sua conta...";

    fetch("/api/treinadores/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, usuario: usuario, email: email, senha: senha })
    })
        .then(function (resposta) {
            if (resposta.status == 201) {
                mensagem.textContent = "Cadastro feito! Indo para o login...";
                setTimeout(function () {
                    window.location = "login.html";
                }, 2000);
            } else {
                // Ex.: "Esse nome de treinador já está em uso."
                return resposta.json().then(function (resultado) {
                    mensagem.textContent = resultado.mensagem;
                });
            }
        })
        .catch(function () {
            mensagem.textContent = "Não foi possível conectar ao servidor.";
        });
}
