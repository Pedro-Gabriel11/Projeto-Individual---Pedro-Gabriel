# Guia de explicação — Pokémon Trainer Hub

Este guia explica **o que cada parte do site faz, de onde vem cada dado e para onde ele vai**.
Use para estudar antes da apresentação e para consultar se travar em alguma pergunta.

---

## 1. O caminho de um dado (vale para todo o site)

Toda ação do usuário que mexe com o banco segue o mesmo caminho:

```
Página HTML  →  JS da página  →  fetch("/api/...")  →  rota  →  controller  →  model  →  MySQL
   (botão)      (função)         (pedido HTTP)       (routes/)  (controllers/) (models/)  (tabela)
                                                                                            │
Página HTML  ←  JS preenche   ←  resposta JSON     ←────────────────────────────────────────┘
```

| Camada | Pasta | Papel em uma frase |
|---|---|---|
| Rota | `src/routes/` | Diz **qual endereço existe** e qual função do controller atende. |
| Controller | `src/controllers/` | **Confere os dados** com `if` e decide a resposta (200, 400, 404, 409...). |
| Model | `src/models/` | É o **único lugar que escreve SQL**. |
| config.js | `src/database/` | Abre a conexão com o MySQL e executa o SQL. |

**Frase para o professor:** "A rota diz o endereço, o controller valida e responde, e o model conversa com o banco."

### `app.js` em 3 linhas importantes
```js
app.use(express.json());                                   // entende o corpo JSON dos pedidos
app.use(express.static(path.join(__dirname, "public")));   // a pasta public vira a raiz do site
app.use("/api", apiRouter);                                // tudo que começa com /api vai para as rotas
```
Por isso `public/cadastro.html` abre em `localhost:3333/cadastro.html` (sem "/public").

### Códigos de resposta usados

| Código | Significado | Exemplo no projeto |
|---|---|---|
| 200 | deu certo | login certo, painel carregado |
| 201 | criado | cadastro feito |
| 400 | dado inválido | campo vazio, id que não é número |
| 403 | não autorizado | senha errada |
| 404 | não encontrado | favoritar um Pokémon que ainda não foi desbloqueado |
| 409 | conflito | nome de treinador ou e-mail repetido |
| 500 | erro no servidor | banco desligado |

---

## 2. O banco de dados (4 tabelas)

Arquivo: `src/database/script-tabelas-pokemon.sql`. Ele **apaga e recria** o banco inteiro.

| Tabela | Guarda | Detalhes que o professor pode perguntar |
|---|---|---|
| `treinador` | as contas | `usuario` e `email` com `UNIQUE`: o banco recusa repetidos. `id` com `AUTO_INCREMENT`: o banco numera sozinho. |
| `pokemon` | os 118 Pokémon | `id` **sem** AUTO_INCREMENT: nós escolhemos o número. `tipo2` pode ser `NULL` (Pokémon de um tipo só). `numero` é o nº da Pokédex e **pode repetir** entre formas (Oricorio tem 4 com o 741). |
| `colecao` | quem desbloqueou qual Pokémon | **Chave primária composta** `(fk_treinador, fk_pokemon)`: a **dupla** nunca se repete. `favorito` 0 ou 1. |
| `tentativa` | cada partida do quiz | acertos, erros, pontos e data. A precisão não é guardada: é calculada. |

**Por que as perguntas do quiz não ficam no banco?** Elas não mudam nem dependem do usuário:
são parte do jogo. O banco guarda o que muda: contas, coleção e partidas.

**`NULL` x `''`:** `NULL` = "não existe valor". `''` = "existe um texto, só que vazio". O Litten
não tem segundo tipo, então `tipo2` é `NULL`.

---

## 3. Página por página

### Início — `index.html`
Página só de apresentação, sem JavaScript próprio (só o `sessao.js` do menu).

| Elemento | O que faz |
|---|---|
| Cartão-postal | Título, texto e botões "Iniciar minha jornada" (→ cadastro) e "Já sou treinador" (→ login). |
| 3 cards | Links para Quiz, Pokédex e Painel. |
| Faixa azul | Link para "Minha história". |

### Menu (todas as páginas) — `js/sessao.js`

| Elemento | O que faz | Função |
|---|---|---|
| "Entrar / Começar" | aparece para quem **não** entrou | `atualizarMenu()` |
| "@usuario / Sair" | aparece para quem entrou | `atualizarMenu()` |
| botão Sair | apaga a sessão e volta ao início | `sair()` |

```js
function atualizarMenu() {
    ...
    if (sessionStorage.ID_TREINADOR != undefined) {   // alguém entrou?
        menuVisitante.style.display = "none";          // esconde Entrar/Começar
        menuTreinador.style.display = "inline";        // mostra @usuario/Sair
        menuUsuario.textContent = "@" + sessionStorage.USUARIO_TREINADOR;
    } else { ... o contrário ... }
}
```

### Cadastro — `cadastro.html` + `js/pages/cadastro.js`

| Campo/botão | O que faz | Para onde vai |
|---|---|---|
| Seu nome (`input-nome`) | nome de exibição (pode repetir) | coluna `treinador.nome` |
| Nome de treinador (`input-usuario`) | o @ (não pode repetir) | `treinador.usuario` |
| E-mail (`input-email`) | não pode repetir | `treinador.email` |
| Senha / Confirmar senha | regras: 8+ caracteres, maiúscula, minúscula, número, especial | `treinador.senha` |
| Criar conta | chama `cadastrar()` | `POST /api/treinadores/cadastrar` |

**Dois lugares de validação:**
- **Navegador (`cadastro.js`) → o formato.** Dá para saber só olhando o texto.
- **Servidor (`treinadorController.cadastrar`) → repetidos.** Só o banco sabe quem já existe.

Fluxo do servidor (5 passos, cada um comentado no código):
1. campos chegaram? se não → **400**
2. tira espaços e põe usuário/e-mail em minúsculas (`"Pedro@X.com"` = `"pedro@x.com"`)
3. `SELECT id FROM treinador WHERE usuario = ?` → se voltou linha → **409** "nome de treinador já está em uso"
4. `SELECT id FROM treinador WHERE email = ?` → se voltou linha → **409** "e-mail já está cadastrado"
5. `INSERT` → **201**; o navegador mostra "Cadastro feito!" e, 2 segundos depois (`setTimeout`), vai para o login.

### Login — `login.html` + `js/pages/login.js`

| Campo/botão | O que faz | Para onde vai |
|---|---|---|
| E-mail ou nome de treinador | pode ser qualquer um dos dois | `SELECT ... WHERE email = ? OR usuario = ?` |
| Senha | comparada **no JavaScript** do controller | `resultado[0].senha == senha` |
| Entrar na jornada | chama `entrar()` | `POST /api/treinadores/autenticar` |

**Por que a senha é comparada no JavaScript e não no SQL?** O MySQL compara textos ignorando
maiúsculas e minúsculas (a colação do banco termina em `_ci`, de *case insensitive*). Com
`AND senha = ?`, a senha `Rowlet@722` aceitaria `rowlet@722`. No JavaScript, o `==` diferencia.

Se achou a conta **e** a senha é igual, o servidor manda `{ id, nome, usuario }` e o navegador guarda:
```js
sessionStorage.ID_TREINADOR = treinador.id;
sessionStorage.NOME_TREINADOR = treinador.nome;
sessionStorage.USUARIO_TREINADOR = treinador.usuario;
window.location = "painel.html";
```
O `sessionStorage` é apagado quando a aba fecha.

**`validarSessao()`** é o "porteiro" das páginas Painel, Pokédex e Quiz:
```js
if (sessionStorage.ID_TREINADOR == undefined) {   // ninguém entrou?
    window.location = "login.html";               // manda para o login
    return false;
}
return true;
```
Cada uma dessas páginas termina com `if (validarSessao()) { carregar...(); }`.

### Pokédex — `pokedex.html` + `js/pages/pokedex.js`

| Elemento | O que faz | Função / rota |
|---|---|---|
| Contador "X / 118" | conta os desbloqueados com `for` | `mostrarPokedex()` |
| Busca | filtra pelo nome a cada letra (`oninput`) | `mostrarPokedex()` |
| 19 botões de tipo | filtram por tipo | `filtrarPorTipo('Água')` |
| Card | número, imagem (ou silhueta), nome, tipos | molde `<template id="molde-card">` |
| ♥ | favorita/desfavorita | `alternarFavorito(id)` → `PUT /api/treinadores/favorito/:idTreinador/:idPokemon` |
| Clique no card | abre a janela de detalhes | `abrirDetalhes(id)` |
| Janela (`<dialog>`) | imagem, tipos, categoria, altura, descrição | `showModal()` / `close()` |

Dados: `GET /api/treinadores/pokedex/:idTreinador` → os 118 Pokémon, cada um com `desbloqueado` e `favorito` (0 ou 1).

No servidor, quem marca isso são **dois `for`, um dentro do outro** (`treinadorController.pokedex`):
o de fora percorre os 118 do catálogo, o de dentro percorre a coleção do treinador; o `if`
pergunta "este Pokémon do catálogo está na coleção?". Com 10 na coleção: 118 × 10 = 1180 voltas.

**Silhueta = uma linha de CSS:** `.silhueta { filter: brightness(0); }` → brilho zero, imagem toda preta.

### Quiz — `quiz.html` + `js/pages/quiz.js`

| Elemento | O que faz | Função |
|---|---|---|
| Barra "Pergunta X de 10" | progresso | `mostrarPergunta()` |
| Imagem / "?" | silhueta ou símbolo de curiosidade | `mostrarPergunta()` |
| 4 botões A–D (fixos no HTML) | escolher uma alternativa | `escolherAlternativa(0..3)` |
| Confirmar resposta | corrige, pinta verde/vermelho, revela o Pokémon | `confirmarResposta()` |
| Próxima pergunta / Ver resultado | avança | `proximaPergunta()` |
| Tela de resultado | pontos, acertos, erros, precisão, novos Pokémon | `mostrarResultado()` |
| Jogar novamente | zera tudo e sorteia outra rodada | `jogarNovamente()` |

Dados: `GET /api/pokemon` (catálogo). No fim: `POST /api/quiz/tentativa` com
`{ idTreinador, acertos, erros, idsAcertados }`. O **servidor** calcula `pontos = acertos * 100`.

Cada partida: **10 perguntas** — 7 de silhueta (montadas a partir do catálogo) e 3 de curiosidade
(sorteadas do vetor `perguntasCuriosidade`, nas posições 3, 6 e 9).

### Painel — `painel.html` + `js/pages/painel.js`

| Elemento | De onde vem | Função |
|---|---|---|
| "Aloha, nome!" e @usuario | `sessionStorage` | `carregarPainel()` |
| Desbloqueados / Favoritos | `COUNT` e `SUM(favorito)` na `colecao` | `mostrarNumeros()` |
| Progresso (%) | desbloqueados ÷ 118 × 100 | `mostrarNumeros()` |
| Quizzes / Melhor pontuação | `COUNT` e `MAX(pontos)` na `tentativa` | `mostrarNumeros()` |
| Precisão (%) | acertos ÷ (acertos + erros) × 100 | `mostrarNumeros()` |
| Gráfico de **linha** | pontos das últimas 8 partidas | `criarGraficoPontos()` |
| Gráfico de **pizza** | total de acertos x total de erros | `criarGraficoAcertos()` |
| Gráfico de **barras** | quantos Pokémon de cada tipo | `criarGraficoTipos()` |
| Últimos desbloqueios / Favoritos | a coleção | `mostrarUltimos()` / `mostrarFavoritos()` |

Dados: `GET /api/treinadores/painel/:idTreinador`. O Chart.js vem pela internet (CDN).

**Treinador novo:** `SUM` e `MAX` sem nenhuma linha devolvem **`NULL`**. A função `numeroOuZero`
do controller troca `NULL` por `0`. E no navegador, a precisão só é calculada `if (totalRespostas > 0)`,
porque `0 / 0` em JavaScript dá **`NaN`** ("não é um número").

### Minha história — `historia.html`
Só HTML e CSS. Cada fase é uma `.polaroid` (foto + legenda) ao lado de um `.texto-fase`.
As fases com a classe `invertida` usam `flex-direction: row-reverse` → o texto vem primeiro.

---

## 4. Trechos explicados linha por linha

### 4.1 Validação de senha (`cadastro.js`)
```js
let temMaiuscula = false;        // 4 "luzes" começam apagadas
let temMinuscula = false;
let temNumero = false;
let temEspecial = false;

for (let i = 0; i < senha.length; i++) {        // olha cada caractere, um por vez
    let letra = senha[i];
    if (letra >= "A" && letra <= "Z") {          // está entre A e Z? é maiúscula
        temMaiuscula = true;
    } else if (letra >= "a" && letra <= "z") {   // entre a e z? minúscula
        temMinuscula = true;
    } else if (letra >= "0" && letra <= "9") {   // entre 0 e 9? número
        temNumero = true;
    } else {
        temEspecial = true;                      // qualquer outra coisa: ! @ # $ ...
    }
}
```
Funciona porque o computador guarda cada letra como um **número**, e as letras de A a Z estão em
sequência. Depois, uma cadeia de `if / else if` devolve a mensagem do **primeiro** problema.
Exemplo `Pikachu#25`: "P" acende maiúscula, "i" acende minúscula, "#" acende especial, "2" acende número.

### 4.2 Validação de e-mail (`cadastro.js`)
```js
let posicaoArroba = email.indexOf("@");     // posição do @ (-1 se não tiver)
let posicaoPonto = email.lastIndexOf(".");  // posição do ÚLTIMO ponto

if (email == "") ...                                    // vazio
else if (email.indexOf(" ") != -1) ...                  // tem espaço
else if (posicaoArroba < 1) ...                         // sem @, ou @ logo no começo
else if (posicaoPonto < posicaoArroba + 2 || posicaoPonto == email.length - 1) ...
                                                        // sem ponto depois do @, ou ponto no final
```

### 4.3 Sortear as alternativas (`quiz.js`) — por que `while`
```js
let alternativas = [pokemonCerto.nome];           // começa com a resposta certa

while (alternativas.length < 4) {                 // repete ENQUANTO não tiver 4
    let sorteado = catalogo[sortearNumero(catalogo.length)];
    if (alternativas.indexOf(sorteado.nome) == -1 && sorteado.numero != pokemonCerto.numero) {
        alternativas.push(sorteado.nome);         // só entra se for novo e de outra espécie
    }
}

let posicao = sortearNumero(4);                   // troca a certa (posição 0) de lugar
let guardado = alternativas[posicao];
alternativas[posicao] = alternativas[0];
alternativas[0] = guardado;
```
**Por que `while` e não `for`?** O `for` repete um número fixo de vezes. Aqui, às vezes o sorteio
não serve (nome repetido, ou outra forma do mesmo Pokémon, como "Magearna Cor Original" quando a
resposta é "Magearna" — a silhueta é igual). O `while` simplesmente tenta de novo até ter 4.
**Regra:** `for` quando sei quantas vezes; `while` quando sei a condição de parada.

`sortearNumero(maximo)` = `Math.floor(Math.random() * maximo)` → um inteiro de 0 a maximo − 1.

### 4.4 Montar a rodada (`quiz.js`)
1. Um `while` sorteia 3 curiosidades diferentes (o vetor `idsUsados` evita repetir Pokémon).
2. Um `for` de 0 a 9: nas posições 2, 5 e 8 entra uma curiosidade; nas outras, um Pokémon sorteado
   vira pergunta de silhueta (de novo com `while` + `idsUsados` para não repetir).

### 4.5 Molde `<template>` + `cloneNode` (Pokédex, quiz, painel)
O desenho de **um** card fica no HTML, dentro de `<template>` (o navegador não mostra o que está ali).
```js
let card = molde.content.cloneNode(true);                     // copia o molde
card.querySelector(".card-nome").textContent = pokemon.nome;  // preenche a cópia
imagem.src = "images/pokemon/" + pokemon.imagem;
grade.appendChild(card);                                      // coloca na página
```
Assim o HTML continua no `.html` e o JS só preenche valores — nada de HTML dentro de texto no JS.

**Por que `let pokemon` dentro do `for` importa:**
```js
botaoFavorito.onclick = function () { alternarFavorito(pokemon.id); };
```
Essa linha só **guarda** a função no botão; ela roda no clique. Com `let`, cada volta do `for`
cria uma variável nova, e cada botão lembra do **seu** Pokémon. Com `var`, seria uma variável só,
e os 118 botões favoritariam o último da lista.

### 4.6 Contar tipos com vetores paralelos (`painel.js`)
```js
function contarTipo(tipo, nomesTipos, quantidades) {
    let posicao = nomesTipos.indexOf(tipo);   // esse tipo já está no vetor?
    if (posicao == -1) {                      // não está:
        nomesTipos.push(tipo);                //   acrescenta o nome
        quantidades.push(1);                  //   com quantidade 1
    } else {                                  // já está:
        quantidades[posicao]++;               //   soma 1 na mesma posição
    }
}
```
Exemplo com Rowlet e Dartrix (os dois Grama/Voador): no fim `nomesTipos = ["Grama", "Voador"]`
e `quantidades = [2, 2]`. **Paralelos** porque a mesma posição fala da mesma coisa.
O gráfico recebe `labels: nomesTipos` e `data: quantidades`.

### 4.7 Gráfico de linha de trás para frente (`painel.js`)
O servidor manda as partidas da mais recente para a mais antiga (`ORDER BY dt_tentativa DESC`).
Para o gráfico ir da mais antiga para a mais nova, o `for` anda ao contrário:
```js
for (let i = tentativas.length - 1; i >= 0; i--) { ... }
```

### 4.8 Desbloquear só os novos (`quizController.js`)
```js
function separarIdsNovos(idsAcertados, idsDaColecao) {
    let novos = [];
    for (let i = 0; i < idsAcertados.length; i++) {
        let id = idsAcertados[i];
        let jaTem = idsDaColecao.indexOf(id) != -1;   // o treinador já tem?
        let jaSeparado = novos.indexOf(id) != -1;     // eu já separei?
        if (!jaTem && !jaSeparado) {
            novos.push(id);
        }
    }
    return novos;
}
```
`separarIdsNovos([2, 4, 2], [4])` → volta 1: 2 entra; volta 2: 4 já tem; volta 3: 2 já separado → `[2]`.

Depois, os `INSERT` são feitos **um de cada vez, como uma fila**:
```js
let fila = Promise.resolve();                       // uma fila vazia, já "pronta"
for (let i = 0; i < novos.length; i++) {
    let idPokemon = novos[i];
    fila = fila.then(function () {                  // pendura mais um passo no fim da fila
        return quizModel.desbloquearPokemon(idTreinador, idPokemon);
    });
}
return fila;                                        // só segue quando o último terminar
```

### 4.9 `?` no SQL (todos os models)
```js
"SELECT id FROM treinador WHERE usuario = ?"   // o valor vai separado: [usuario]
```
Se alguém digitar `' OR '1'='1` e o SQL fosse montado com texto (`'${usuario}'`), a consulta viraria
`WHERE usuario = '' OR '1'='1'` — sempre verdadeira (**SQL injection**). Com `?`, o MySQL trata
o texto todo como um valor comum.

---

## 5. CSS que vale saber explicar

| CSS | O que faz | Onde |
|---|---|---|
| `:root { --coral: #d9534f; }` + `var(--coral)` | **variável**: a cor fica definida num lugar só; mudar a linha muda o site inteiro | `shared.css` |
| `display: flex` | coloca elementos **lado a lado** | menu, quiz, história, botões |
| `flex-direction: row-reverse` | inverte a ordem (texto antes da foto) | história |
| `display: grid` + `repeat(4, 1fr)` | divide a largura em **4 colunas iguais** | Pokédex, números do painel |
| `filter: brightness(0)` | brilho zero → silhueta preta | Pokédex e quiz |
| `transition: filter .4s` | anima a mudança em 0,4 s (só na revelação) | quiz |
| `:hover` | "enquanto o mouse estiver em cima" | cards, botões |
| `transform: translateY(-4px)` | sobe 4 px (no navegador, Y cresce para baixo) | cards |
| `transform: rotate(6deg)` | gira o elemento | selo, polaroids |
| `outline` + `outline-offset: -22px` | linha tracejada desenhada **por dentro** da borda | cartões-postais |
| `@media (max-width: 760px)` | regras que só valem em telas pequenas (celular) | todas |

---

## 6. Perguntas que o professor pode fazer

**Por que o login compara a senha no JavaScript?** Porque o MySQL ignora maiúsculas/minúsculas
nas comparações de texto; no JS, `"Rowlet@722" == "rowlet@722"` é falso.

**Onde fica a senha?** Na tabela `treinador`, coluna `senha`, em texto puro — o mesmo modelo do
template da faculdade. Num sistema real, ela seria guardada embaralhada (hash).

**Por que `?` nas consultas?** Para evitar SQL injection (ver 4.9).

**Por que chave primária composta na `colecao`?** Para o mesmo Pokémon não entrar duas vezes para o
mesmo treinador. A **dupla** (treinador, Pokémon) é única; cada um sozinho pode repetir.

**Por que `id` e `numero` na tabela `pokemon`?** `numero` é o nº da Pokédex e repete entre formas
(Oricorio tem 4 entradas com 741). A chave primária precisa ser única, então existe o `id`.

**Por que as perguntas não estão no banco?** São fixas do jogo e não dependem do usuário. As de
silhueta são montadas a partir do catálogo, então todos os 118 Pokémon podem ser desbloqueados.

**Por que usuário e e-mail repetidos são verificados no servidor?** O navegador não conhece os outros
treinadores; só o banco sabe. O navegador confere o **formato**; o servidor confere **o que já existe**.

**Por que a pontuação é calculada no servidor?** Para a regra (100 pontos por acerto) ficar em um
lugar só: o número mostrado é sempre o mesmo que foi gravado.

**O que é o `sessionStorage`?** Um espaço do navegador onde guardamos `ID_TREINADOR`, nome e usuário
depois do login. Some quando a aba fecha. A `validarSessao()` usa isso para proteger as páginas.

**O que acontece com um treinador novo no painel?** `SUM`/`MAX` devolvem `NULL`; o servidor troca por
0 (`numeroOuZero`), e o navegador não divide por zero (evita `NaN`). Os gráficos dão lugar a mensagens.

**De onde vêm as imagens e descrições?** Imagens: PokeAPI (artes oficiais). Descrições: tradução livre
das Pokédex oficiais de Pokémon Moon (quando não existe, Ultra Moon ou Let's Go).

**Por que `let` e não `var`?** O `let` existe só dentro do bloco `{ }` onde foi criado. Isso evita
erros como o dos botões de favorito (ver 4.5).

**Por que `.then()`?** O `fetch` e o banco demoram um pouco para responder. O `.then(function...)`
diz "quando a resposta chegar, faça isto".
