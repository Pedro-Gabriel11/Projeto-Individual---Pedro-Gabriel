// Pokédex do treinador.
// listaPokemon guarda os 118 Pokémon que vêm do servidor, cada um com
// desbloqueado (0 ou 1) e favorito (0 ou 1).
let listaPokemon = [];
let tipoSelecionado = "Todos";

// Transforma 7 em "#007" e 37 em "#037".
function formatarNumero(numero) {
    if (numero < 10) {
        return "#00" + numero;
    } else if (numero < 100) {
        return "#0" + numero;
    }
    return "#" + numero;
}

// O banco manda a altura como "0.3"; mostramos "0,3 m".
function formatarAltura(altura) {
    return Number(altura).toFixed(1).replace(".", ",") + " m";
}

function carregarPokedex() {
    let idTreinador = sessionStorage.ID_TREINADOR;

    fetch("/api/treinadores/pokedex/" + idTreinador)
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error("erro no servidor");
            }
            return resposta.json();
        })
        .then(function (dados) {
            listaPokemon = dados;
            mostrarPokedex();
        })
        .catch(function () {
            document.getElementById("mensagem-pokedex").textContent = "Não foi possível carregar a Pokédex.";
        });
}

// Desenha os cards de acordo com a busca e o tipo escolhido.
function mostrarPokedex() {
    let grade = document.getElementById("grade-pokemon");
    let molde = document.getElementById("molde-card");
    let busca = document.getElementById("busca-pokemon").value.trim().toLowerCase();
    let quantidadeMostrada = 0;
    let quantidadeDescobertos = 0;

    grade.textContent = ""; // apaga os cards anteriores

    for (let i = 0; i < listaPokemon.length; i++) {
        let pokemon = listaPokemon[i];

        if (pokemon.desbloqueado == 1) {
            quantidadeDescobertos++;
        }

        // Com busca ou filtro ativos, só aparecem os já descobertos
        // (assim a busca não revela onde está um Pokémon bloqueado).
        if (pokemon.desbloqueado == 0 && (busca != "" || tipoSelecionado != "Todos")) {
            continue;
        }
        if (busca != "" && pokemon.nome.toLowerCase().indexOf(busca) == -1) {
            continue;
        }
        if (tipoSelecionado != "Todos" && pokemon.tipo1 != tipoSelecionado && pokemon.tipo2 != tipoSelecionado) {
            continue;
        }

        // Copia o molde e preenche a cópia
        let card = molde.content.cloneNode(true);
        let imagem = card.querySelector(".card-imagem");
        let tipo2 = card.querySelector(".card-tipo2");
        let botaoFavorito = card.querySelector(".card-favorito");

        card.querySelector(".card-numero").textContent = formatarNumero(pokemon.numero);
        imagem.src = "images/pokemon/" + pokemon.imagem;

        if (pokemon.desbloqueado == 1) {
            card.querySelector(".card-nome").textContent = pokemon.nome;
            card.querySelector(".card-tipo1").textContent = pokemon.tipo1;
            if (pokemon.tipo2 != null) {
                tipo2.textContent = pokemon.tipo2;
            } else {
                tipo2.style.display = "none";
            }
            card.querySelector(".card-status").style.display = "none";

            if (pokemon.favorito == 1) {
                botaoFavorito.textContent = "♥";
                botaoFavorito.classList.add("selected");
            }
            botaoFavorito.onclick = function () {
                alternarFavorito(pokemon.id);
            };
        } else {
            imagem.classList.add("silhueta");
            card.querySelector(".card-nome").textContent = "???";
            card.querySelector(".type-tags").style.display = "none";
            botaoFavorito.style.display = "none";
        }

        card.querySelector(".card-abrir").onclick = function () {
            abrirDetalhes(pokemon.id);
        };

        grade.appendChild(card);
        quantidadeMostrada++;
    }

    document.getElementById("contador-pokedex").textContent =
        quantidadeDescobertos + " / " + listaPokemon.length + " descobertos";

    if (quantidadeMostrada == 0) {
        document.getElementById("mensagem-pokedex").textContent = "Nenhum Pokémon descoberto com esse nome ou tipo.";
    } else {
        document.getElementById("mensagem-pokedex").textContent = "";
    }
}

// Chamado pelos botões de tipo. Marca o botão escolhido e redesenha.
function filtrarPorTipo(tipo) {
    tipoSelecionado = tipo;

    let botoes = document.querySelectorAll(".filter-chip");
    for (let i = 0; i < botoes.length; i++) {
        if (botoes[i].textContent == tipo) {
            botoes[i].classList.add("active");
        } else {
            botoes[i].classList.remove("active");
        }
    }

    mostrarPokedex();
}

// Procura um Pokémon da lista pelo id.
function buscarPokemonPorId(idPokemon) {
    for (let i = 0; i < listaPokemon.length; i++) {
        if (listaPokemon[i].id == idPokemon) {
            return listaPokemon[i];
        }
    }
    return null;
}

function alternarFavorito(idPokemon) {
    let pokemon = buscarPokemonPorId(idPokemon);
    let novoValor = 1;
    if (pokemon.favorito == 1) {
        novoValor = 0;
    }

    fetch("/api/treinadores/favorito/" + sessionStorage.ID_TREINADOR + "/" + idPokemon, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorito: novoValor })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                pokemon.favorito = novoValor;
                mostrarPokedex();
            } else {
                document.getElementById("mensagem-pokedex").textContent = "Não foi possível alterar o favorito.";
            }
        })
        .catch(function () {
            document.getElementById("mensagem-pokedex").textContent = "Não foi possível conectar ao servidor.";
        });
}

function abrirDetalhes(idPokemon) {
    let pokemon = buscarPokemonPorId(idPokemon);
    let imagem = document.getElementById("detalhe-imagem");

    document.getElementById("detalhe-numero").textContent = "Pokédex " + formatarNumero(pokemon.numero);
    imagem.src = "images/pokemon/" + pokemon.imagem;

    if (pokemon.desbloqueado == 1) {
        imagem.classList.remove("silhueta");
        document.getElementById("detalhe-nome").textContent = pokemon.nome;
        document.getElementById("detalhe-tipo1").textContent = pokemon.tipo1;
        if (pokemon.tipo2 != null) {
            document.getElementById("detalhe-tipo2").textContent = pokemon.tipo2;
            document.getElementById("detalhe-tipo2").style.display = "inline";
        } else {
            document.getElementById("detalhe-tipo2").style.display = "none";
        }
        document.getElementById("detalhe-categoria").textContent = pokemon.categoria;
        document.getElementById("detalhe-altura").textContent = formatarAltura(pokemon.altura);
        document.getElementById("detalhe-descricao").textContent = pokemon.descricao;
        document.getElementById("detalhe-conteudo").style.display = "block";
        document.getElementById("detalhe-bloqueado").style.display = "none";
    } else {
        imagem.classList.add("silhueta");
        document.getElementById("detalhe-nome").textContent = "Pokémon não descoberto";
        document.getElementById("detalhe-conteudo").style.display = "none";
        document.getElementById("detalhe-bloqueado").style.display = "block";
    }

    document.getElementById("detalhes-pokemon").showModal();
}

function fecharDetalhes() {
    document.getElementById("detalhes-pokemon").close();
}

if (validarSessao()) {
    carregarPokedex();
}
