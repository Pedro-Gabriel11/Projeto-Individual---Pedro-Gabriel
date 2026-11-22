// Funções de sessão usadas por todas as páginas.
// Depois do login, os dados do treinador ficam guardados no sessionStorage do navegador
// (como no template da faculdade). Eles somem quando a aba é fechada ou quando o treinador sai.

// Mostra no menu "Entrar / Começar" para visitantes,
// ou "@usuario / Sair" para quem já entrou.
function atualizarMenu() {
    let menuVisitante = document.getElementById("menu-visitante");
    let menuTreinador = document.getElementById("menu-treinador");
    let menuUsuario = document.getElementById("menu-usuario");

    if (sessionStorage.ID_TREINADOR != undefined) {
        menuVisitante.style.display = "none";
        menuTreinador.style.display = "inline";
        menuUsuario.textContent = "@" + sessionStorage.USUARIO_TREINADOR;
    } else {
        menuVisitante.style.display = "inline";
        menuTreinador.style.display = "none";
    }
}

// Usada no começo das páginas que só treinadores podem ver (Painel, Pokédex e Quiz).
// Se ninguém entrou, manda para o login e devolve false.
function validarSessao() {
    if (sessionStorage.ID_TREINADOR == undefined) {
        window.location = "login.html";
        return false;
    }
    return true;
}

function limparSessao() {
    sessionStorage.clear();
}

function sair() {
    limparSessao();
    window.location = "index.html";
}

atualizarMenu();
