// Login: chamado pelo botão "Entrar na jornada" (onclick="entrar()" no login.html).
function entrar() {
    let conta = document.getElementById("input-conta").value;
    let senha = document.getElementById("input-senha").value;
    let mensagem = document.getElementById("mensagem-login");

    if (conta == "" || senha == "") {
        mensagem.textContent = "Informe seu e-mail ou nome de treinador e sua senha.";
        return;
    }

    mensagem.textContent = "Entrando...";

    fetch("/api/treinadores/autenticar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conta: conta, senha: senha })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json().then(function (treinador) {
                    // Guarda os dados do treinador para as outras páginas usarem
                    sessionStorage.ID_TREINADOR = treinador.id;
                    sessionStorage.NOME_TREINADOR = treinador.nome;
                    sessionStorage.USUARIO_TREINADOR = treinador.usuario;
                    window.location = "painel.html";
                });
            } else {
                // O servidor manda a mensagem do erro, ex.: "E-mail/usuário ou senha inválidos."
                return resposta.json().then(function (erro) {
                    mensagem.textContent = erro.mensagem;
                });
            }
        })
        .catch(function () {
            mensagem.textContent = "Não foi possível conectar ao servidor.";
        });
}
