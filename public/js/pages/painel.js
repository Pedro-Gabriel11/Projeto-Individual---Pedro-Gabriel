// Painel do treinador: números, 3 gráficos (Chart.js) e listas de Pokémon.

// Cores da paleta praiana usadas nos gráficos
let corPetroleo = "#1d4e5f";
let corCoral = "#d9534f";
let corTurquesa = "#2ec4b6";
let corMostarda = "#e9b44c";

function carregarPainel() {
    document.getElementById("painel-nome").textContent = sessionStorage.NOME_TREINADOR;
    document.getElementById("painel-usuario").textContent = "@" + sessionStorage.USUARIO_TREINADOR;

    fetch("/api/treinadores/painel/" + sessionStorage.ID_TREINADOR)
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error("erro no servidor");
            }
            return resposta.json();
        })
        .then(function (dados) {
            mostrarNumeros(dados.estatisticas);
            criarGraficoPontos(dados.tentativas);
            criarGraficoAcertos(dados.estatisticas.totalAcertos, dados.estatisticas.totalErros);
            criarGraficoTipos(dados.colecao);
            mostrarUltimos(dados.colecao);
            mostrarFavoritos(dados.colecao);
        })
        .catch(function () {
            document.getElementById("mensagem-painel").textContent = "Não foi possível carregar o painel.";
        });
}

function mostrarNumeros(estatisticas) {
    let progresso = 0;
    if (estatisticas.totalCatalogo > 0) {
        progresso = Math.round(estatisticas.desbloqueados / estatisticas.totalCatalogo * 100);
    }

    let totalRespostas = estatisticas.totalAcertos + estatisticas.totalErros;
    let precisao = 0;
    if (totalRespostas > 0) {
        precisao = Math.round(estatisticas.totalAcertos / totalRespostas * 100);
    }

    document.getElementById("numero-desbloqueados").textContent = estatisticas.desbloqueados;
    document.getElementById("numero-total-catalogo").textContent = "de " + estatisticas.totalCatalogo;
    document.getElementById("numero-progresso").textContent = progresso + "%";
    document.getElementById("numero-favoritos").textContent = estatisticas.favoritos;
    document.getElementById("numero-quizzes").textContent = estatisticas.quizzes;
    document.getElementById("numero-precisao").textContent = precisao + "%";
    document.getElementById("numero-melhor").textContent = estatisticas.melhorPontuacao;
}

// Esconde a área do gráfico e mostra a mensagem de "sem dados".
function mostrarVazio(idCanvas, idMensagem) {
    document.getElementById(idCanvas).parentElement.style.display = "none";
    document.getElementById(idMensagem).style.display = "block";
}

// Gráfico de linha: pontos das últimas partidas.
function criarGraficoPontos(tentativas) {
    if (tentativas.length == 0) {
        mostrarVazio("grafico-pontos", "vazio-pontos");
        return;
    }

    let rotulos = [];
    let pontos = [];

    // O servidor manda da mais recente para a mais antiga;
    // o for de trás para frente coloca a mais antiga primeiro.
    for (let i = tentativas.length - 1; i >= 0; i--) {
        let data = new Date(tentativas[i].dt_tentativa);
        // ex.: "22/11/2026 14:30" (a hora diferencia partidas do mesmo dia)
        rotulos.push(data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR").slice(0, 5));
        pontos.push(tentativas[i].pontos);
    }

    let ctx = document.getElementById("grafico-pontos").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: rotulos,
            datasets: [{
                label: "Pontos",
                data: pontos,
                borderColor: corCoral,
                backgroundColor: corCoral,
                borderWidth: 3
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { y: { min: 0, max: 1000 } }
        }
    });
}

// Gráfico de pizza: total de acertos x total de erros.
function criarGraficoAcertos(totalAcertos, totalErros) {
    if (totalAcertos + totalErros == 0) {
        mostrarVazio("grafico-acertos", "vazio-acertos");
        return;
    }

    let ctx = document.getElementById("grafico-acertos").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Acertos", "Erros"],
            datasets: [{
                data: [totalAcertos, totalErros],
                backgroundColor: [corTurquesa, corCoral]
            }]
        },
        options: {
            // deixa o gráfico ocupar a altura do quadro (.area-grafico)
            maintainAspectRatio: false
        }
    });
}

// Gráfico de barras: quantos Pokémon de cada tipo foram desbloqueados.
// Usa dois vetores "paralelos": nomesTipos[i] tem quantidades[i] Pokémon.
function criarGraficoTipos(colecao) {
    if (colecao.length == 0) {
        mostrarVazio("grafico-tipos", "vazio-tipos");
        return;
    }

    let nomesTipos = [];
    let quantidades = [];

    for (let i = 0; i < colecao.length; i++) {
        contarTipo(colecao[i].tipo1, nomesTipos, quantidades);
        if (colecao[i].tipo2 != null) {
            contarTipo(colecao[i].tipo2, nomesTipos, quantidades);
        }
    }

    let ctx = document.getElementById("grafico-tipos").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: nomesTipos,
            datasets: [{
                label: "Pokémon",
                data: quantidades,
                backgroundColor: corTurquesa,
                borderColor: corPetroleo,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

// Se o tipo já está no vetor, soma 1; se não está, acrescenta com quantidade 1.
function contarTipo(tipo, nomesTipos, quantidades) {
    let posicao = nomesTipos.indexOf(tipo);
    if (posicao == -1) {
        nomesTipos.push(tipo);
        quantidades.push(1);
    } else {
        quantidades[posicao]++;
    }
}

// Copia o molde "mini" para cada Pokémon da lista.
function preencherMiniLista(lista, idDestino) {
    let destino = document.getElementById(idDestino);
    let molde = document.getElementById("molde-mini");

    for (let i = 0; i < lista.length; i++) {
        let item = molde.content.cloneNode(true);
        item.querySelector(".mini-imagem").src = "images/pokemon/" + lista[i].imagem;
        item.querySelector(".mini-nome").textContent = lista[i].nome;
        destino.appendChild(item);
    }
}

// Os 4 mais recentes (a coleção já vem do mais recente para o mais antigo).
function mostrarUltimos(colecao) {
    if (colecao.length == 0) {
        document.getElementById("vazio-ultimos").style.display = "block";
        return;
    }
    let ultimos = [];
    for (let i = 0; i < colecao.length && i < 4; i++) {
        ultimos.push(colecao[i]);
    }
    preencherMiniLista(ultimos, "lista-ultimos");
}

function mostrarFavoritos(colecao) {
    let favoritos = [];
    for (let i = 0; i < colecao.length; i++) {
        if (colecao[i].favorito == 1 && favoritos.length < 8) {
            favoritos.push(colecao[i]);
        }
    }
    if (favoritos.length == 0) {
        document.getElementById("vazio-favoritos").style.display = "block";
        return;
    }
    preencherMiniLista(favoritos, "lista-favoritos");
}

if (validarSessao()) {
    carregarPainel();
}
