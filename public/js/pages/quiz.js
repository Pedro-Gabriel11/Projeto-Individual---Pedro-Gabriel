// Quiz Pokémon.
// Cada partida tem 10 perguntas: 7 de silhueta (montadas a partir do catálogo)
// e 3 de curiosidade (sorteadas do vetor abaixo).

// Perguntas de curiosidade. "idPokemon" é o id do Pokémon na tabela pokemon:
// acertar a pergunta desbloqueia esse Pokémon.
let perguntasCuriosidade = [
    { enunciado: "Qual Pokémon inicial de Alola é do tipo Grama e Voador?", idPokemon: 1, alternativas: ["Litten", "Rowlet", "Popplio", "Pikipek"], resposta: "Rowlet" },
    { enunciado: "Qual destes Pokémon é a evolução final de Litten?", idPokemon: 6, alternativas: ["Torracat", "Salazzle", "Incineroar", "Turtonator"], resposta: "Incineroar" },
    { enunciado: "Qual Pokémon tem a própria voz como principal arma em batalha?", idPokemon: 9, alternativas: ["Primarina", "Brionne", "Comfey", "Oricorio Pa'u"], resposta: "Primarina" },
    { enunciado: "Qual Pokémon se esconde debaixo de um pano velho para se aproximar das pessoas?", idPokemon: 64, alternativas: ["Sandygast", "Dhelmise", "Marshadow", "Mimikyu Disfarçado"], resposta: "Mimikyu Disfarçado" },
    { enunciado: "Qual destes Pokémon é a divindade guardiã da ilha de Poni?", idPokemon: 75, alternativas: ["Tapu Koko", "Tapu Lele", "Tapu Fini", "Tapu Bulu"], resposta: "Tapu Fini" },
    { enunciado: "Qual Pokémon lendário aparece na capa de Pokémon Moon?", idPokemon: 79, alternativas: ["Solgaleo", "Necrozma", "Cosmog", "Lunala"], resposta: "Lunala" },
    { enunciado: "Qual Pokémon lendário aparece na capa de Pokémon Sun?", idPokemon: 78, alternativas: ["Solgaleo", "Lunala", "Tapu Koko", "Necrozma"], resposta: "Solgaleo" },
    { enunciado: "Qual Pokémon tem o hábito de abraçar os companheiros com força demais?", idPokemon: 45, alternativas: ["Stufful", "Passimian", "Oranguru", "Bewear"], resposta: "Bewear" },
    { enunciado: "Os espinhos de aço deste Pokémon de Alola são cobertos de gelo. Quem é ele?", idPokemon: 105, alternativas: ["Sandshrew de Alola", "Sandslash de Alola", "Vulpix de Alola", "Crabominable"], resposta: "Sandslash de Alola" },
    { enunciado: "Qual forma de Alola é do tipo Gelo e Fada?", idPokemon: 107, alternativas: ["Vulpix de Alola", "Sandslash de Alola", "Ninetales de Alola", "Primarina"], resposta: "Ninetales de Alola" },
    { enunciado: "Em Alola, qual Pokémon ficou altíssimo e ganhou o tipo Dragão?", idPokemon: 117, alternativas: ["Drampa", "Exeggutor de Alola", "Kommo-o", "Marowak de Alola"], resposta: "Exeggutor de Alola" },
    { enunciado: "Qual Pokémon se une a muitos outros da espécie e forma um cardume gigante?", idPokemon: 31, alternativas: ["Pyukumuku", "Dewpider", "Wishiwashi Cardume", "Bruxish"], resposta: "Wishiwashi Cardume" },
    { enunciado: "Qual Pokémon foi construído há cerca de 500 anos e tem uma alma artificial?", idPokemon: 91, alternativas: ["Type: Null", "Magearna", "Silvally", "Melmetal"], resposta: "Magearna" },
    { enunciado: "Qual era o nome de Silvally antes de evoluir?", idPokemon: 57, alternativas: ["Cosmog", "Meltan", "Poipole", "Type: Null"], resposta: "Type: Null" },
    { enunciado: "Qual Pokémon é um castelo de areia vivo?", idPokemon: 55, alternativas: ["Sandygast", "Palossand", "Mudsdale", "Golisopod"], resposta: "Palossand" },
    { enunciado: "Qual destes Pokémon é uma Ultracriatura?", idPokemon: 80, alternativas: ["Tapu Lele", "Necrozma", "Nihilego", "Marshadow"], resposta: "Nihilego" },
    { enunciado: "Qual Pokémon de Alola é do tipo Elétrico e Psíquico e se locomove montado na própria cauda?", idPokemon: 103, alternativas: ["Togedemaru", "Raichu de Alola", "Tapu Koko", "Zeraora"], resposta: "Raichu de Alola" }
];

let catalogo = [];          // os 118 Pokémon, vindos do servidor
let rodada = [];            // as 10 perguntas da partida atual
let indiceAtual = 0;        // qual pergunta está na tela (0 a 9)
let alternativaEscolhida = -1;
let acertos = 0;
let erros = 0;
let idsAcertados = [];

// Devolve um número inteiro sorteado entre 0 e (maximo - 1).
function sortearNumero(maximo) {
    return Math.floor(Math.random() * maximo);
}

function buscarNoCatalogo(idPokemon) {
    for (let i = 0; i < catalogo.length; i++) {
        if (catalogo[i].id == idPokemon) {
            return catalogo[i];
        }
    }
    return null;
}

// Monta as 4 alternativas de uma pergunta de silhueta:
// o nome certo + 3 nomes sorteados diferentes.
function sortearAlternativas(pokemonCerto) {
    let alternativas = [pokemonCerto.nome];

    while (alternativas.length < 4) {
        let sorteado = catalogo[sortearNumero(catalogo.length)];
        // Não pode repetir nome, nem ser outra forma do mesmo Pokémon
        // (ex.: Magearna e Magearna Cor Original têm a mesma silhueta).
        if (alternativas.indexOf(sorteado.nome) == -1 && sorteado.numero != pokemonCerto.numero) {
            alternativas.push(sorteado.nome);
        }
    }

    // O nome certo está na posição 0; troca com uma posição sorteada.
    let posicao = sortearNumero(4);
    let guardado = alternativas[posicao];
    alternativas[posicao] = alternativas[0];
    alternativas[0] = guardado;

    return alternativas;
}

// Monta as 10 perguntas da partida, sem repetir Pokémon.
// As curiosidades ficam nas posições 3, 6 e 9 (índices 2, 5 e 8).
function montarRodada() {
    rodada = [];
    let idsUsados = [];
    let curiosidadesEscolhidas = [];

    // 1) Sorteia 3 perguntas de curiosidade diferentes
    while (curiosidadesEscolhidas.length < 3) {
        let pergunta = perguntasCuriosidade[sortearNumero(perguntasCuriosidade.length)];
        if (idsUsados.indexOf(pergunta.idPokemon) == -1) {
            idsUsados.push(pergunta.idPokemon);
            curiosidadesEscolhidas.push(pergunta);
        }
    }

    // 2) Monta a rodada, sorteando os Pokémon das silhuetas
    let proximaCuriosidade = 0;
    for (let i = 0; i < 10; i++) {
        if (i == 2 || i == 5 || i == 8) {
            let pergunta = curiosidadesEscolhidas[proximaCuriosidade];
            proximaCuriosidade++;
            rodada.push({
                tipo: "curiosidade",
                enunciado: pergunta.enunciado,
                idPokemon: pergunta.idPokemon,
                alternativas: pergunta.alternativas,
                resposta: pergunta.resposta
            });
        } else {
            let pokemon = catalogo[sortearNumero(catalogo.length)];
            while (idsUsados.indexOf(pokemon.id) != -1) {
                pokemon = catalogo[sortearNumero(catalogo.length)];
            }
            idsUsados.push(pokemon.id);
            rodada.push({
                tipo: "silhueta",
                enunciado: "Qual Pokémon de Alola é esta silhueta?",
                idPokemon: pokemon.id,
                alternativas: sortearAlternativas(pokemon),
                resposta: pokemon.nome
            });
        }
    }
}

// Mostra na tela a pergunta da posição indiceAtual.
function mostrarPergunta() {
    let pergunta = rodada[indiceAtual];
    let imagem = document.getElementById("imagem-pergunta");
    let simbolo = document.getElementById("simbolo-curiosidade");

    document.getElementById("progresso-texto").textContent = "Pergunta " + (indiceAtual + 1) + " de " + rodada.length;
    document.getElementById("pontos-parciais").textContent = acertos + " acerto(s)";
    document.getElementById("progresso-barra").style.width = ((indiceAtual + 1) * 10) + "%";
    document.getElementById("enunciado").textContent = pergunta.enunciado;
    document.getElementById("mensagem-resposta").textContent = "";

    // A imagem do Pokémon da pergunta é carregada já com o filtro de silhueta.
    // Na curiosidade ela fica escondida (aparece o "?") até a resposta ser confirmada.
    let pokemonDaPergunta = buscarNoCatalogo(pergunta.idPokemon);
    imagem.classList.add("silhueta");
    imagem.src = "images/pokemon/" + pokemonDaPergunta.imagem;

    if (pergunta.tipo == "silhueta") {
        document.getElementById("tipo-pergunta").textContent = "Silhueta";
        imagem.style.display = "block";
        simbolo.style.display = "none";
    } else {
        document.getElementById("tipo-pergunta").textContent = "Curiosidade";
        imagem.style.display = "none";
        simbolo.style.display = "block";
    }

    for (let i = 0; i < 4; i++) {
        let botao = document.getElementById("alternativa-" + i);
        botao.querySelector(".texto-alternativa").textContent = pergunta.alternativas[i];
        botao.classList.remove("selected", "certa", "errada");
        botao.disabled = false;
    }

    alternativaEscolhida = -1;
    document.getElementById("botao-confirmar").disabled = true;
    document.getElementById("botao-confirmar").style.display = "inline-flex";
    document.getElementById("botao-proxima").style.display = "none";
}

// Chamada ao clicar numa alternativa (0 = A, 1 = B, 2 = C, 3 = D).
function escolherAlternativa(indice) {
    alternativaEscolhida = indice;
    for (let i = 0; i < 4; i++) {
        let botao = document.getElementById("alternativa-" + i);
        if (i == indice) {
            botao.classList.add("selected");
        } else {
            botao.classList.remove("selected");
        }
    }
    document.getElementById("botao-confirmar").disabled = false;
}

function confirmarResposta() {
    if (alternativaEscolhida == -1) {
        return;
    }

    let pergunta = rodada[indiceAtual];
    let escolhida = pergunta.alternativas[alternativaEscolhida];
    let mensagem = document.getElementById("mensagem-resposta");

    if (escolhida == pergunta.resposta) {
        acertos++;
        idsAcertados.push(pergunta.idPokemon);
        mensagem.textContent = "Acertou! É " + pergunta.resposta + ".";
    } else {
        erros++;
        mensagem.textContent = "Errou! A resposta certa é " + pergunta.resposta + ".";
    }

    // Pinta a certa de verde e a escolhida errada de vermelho; trava os botões
    for (let i = 0; i < 4; i++) {
        let botao = document.getElementById("alternativa-" + i);
        botao.disabled = true;
        if (pergunta.alternativas[i] == pergunta.resposta) {
            botao.classList.add("certa");
        } else if (i == alternativaEscolhida) {
            botao.classList.add("errada");
        }
    }

    // Revela o Pokémon: tira o filtro de silhueta e mostra a imagem
    // (na curiosidade, a imagem estava escondida atrás do "?")
    let imagem = document.getElementById("imagem-pergunta");
    imagem.classList.remove("silhueta");
    imagem.style.display = "block";
    document.getElementById("simbolo-curiosidade").style.display = "none";

    document.getElementById("botao-confirmar").style.display = "none";
    let botaoProxima = document.getElementById("botao-proxima");
    botaoProxima.style.display = "inline-flex";
    if (indiceAtual == rodada.length - 1) {
        botaoProxima.textContent = "Ver resultado";
    } else {
        botaoProxima.textContent = "Próxima pergunta";
    }
}

function proximaPergunta() {
    indiceAtual++;
    if (indiceAtual < rodada.length) {
        mostrarPergunta();
    } else {
        finalizarQuiz();
    }
}

// Envia o resultado para o servidor, que grava a partida e desbloqueia os Pokémon.
function finalizarQuiz() {
    document.getElementById("tela-pergunta").style.display = "none";
    document.getElementById("mensagem-quiz").textContent = "Salvando seu resultado...";

    fetch("/api/quiz/tentativa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idTreinador: sessionStorage.ID_TREINADOR,
            acertos: acertos,
            erros: erros,
            idsAcertados: idsAcertados
        })
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error("erro no servidor");
            }
            return resposta.json();
        })
        .then(function (resultado) {
            mostrarResultado(resultado.pontos, resultado.novos);
        })
        .catch(function () {
            document.getElementById("mensagem-quiz").textContent = "Não foi possível salvar a partida. Tente jogar novamente.";
        });
}

function mostrarResultado(pontos, novos) {
    let lista = document.getElementById("lista-novos");
    let molde = document.getElementById("molde-novo");

    document.getElementById("mensagem-quiz").textContent = "";
    document.getElementById("resultado-pontos").textContent = pontos;
    document.getElementById("resultado-acertos").textContent = acertos;
    document.getElementById("resultado-erros").textContent = erros;
    document.getElementById("resultado-precisao").textContent = Math.round(acertos / (acertos + erros) * 100) + "%";

    lista.textContent = "";
    for (let i = 0; i < novos.length; i++) {
        let pokemon = buscarNoCatalogo(novos[i]);
        let item = molde.content.cloneNode(true);
        item.querySelector(".novo-imagem").src = "images/pokemon/" + pokemon.imagem;
        item.querySelector(".novo-nome").textContent = pokemon.nome;
        lista.appendChild(item);
    }

    if (novos.length == 0) {
        document.getElementById("sem-novos").style.display = "block";
    } else {
        document.getElementById("sem-novos").style.display = "none";
    }

    document.getElementById("tela-resultado").style.display = "block";
}

function jogarNovamente() {
    indiceAtual = 0;
    acertos = 0;
    erros = 0;
    idsAcertados = [];
    montarRodada();
    document.getElementById("tela-resultado").style.display = "none";
    document.getElementById("tela-pergunta").style.display = "block";
    mostrarPergunta();
}

// Busca o catálogo no servidor e começa a primeira partida.
function carregarCatalogo() {
    fetch("/api/pokemon")
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error("erro no servidor");
            }
            return resposta.json();
        })
        .then(function (dados) {
            catalogo = dados;
            document.getElementById("tela-carregando").style.display = "none";
            jogarNovamente();
        })
        .catch(function () {
            document.getElementById("tela-carregando").textContent = "Não foi possível carregar o quiz.";
        });
}

if (validarSessao()) {
    carregarCatalogo();
}
