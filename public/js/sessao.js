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
