# Refatoração para a apresentação — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o Pokémon Trainer Hub simples de explicar (JS e banco no nível do 1º semestre,
login no modelo do template), com 118 Pokémon com imagem, visual "cartão-postal praiano"
e guia de explicação.

**Architecture:** Refatoração no lugar, etapa por etapa. Express serve `public/` e a API em
`/api`. Rotas → controllers (validam com `if`) → models (únicos com SQL, sempre com `?`).
No navegador, a estrutura fica no HTML. O JS só preenche valores, e as listas usam
`<template>` + `cloneNode`.

**Tech Stack:** Node.js + Express, mysql2, MySQL 8, HTML/CSS/JS puro, Chart.js
(arquivo local), `node:test`.

**Spec:** [docs/superpowers/specs/2026-11-22-refatoracao-apresentacao-design.md](../specs/2026-11-22-refatoracao-apresentacao-design.md)

## Global Constraints

- Variáveis sempre com `let`, nunca `var` (nem `const`), em todo o JS: front, back e testes.
- Nomes de funções, variáveis, campos de API e colunas em **português**.
- Lógica permitida: `if / else if / else`, `for`, `while`, vetores, objetos, funções,
  `fetch().then()`. Proibidos: `async/await`, `Map`, `Set`, `reduce`, `Promise.all`, regex,
  arrow functions, IIFE, `"use strict"`, `Object.assign`.
- Nenhum `innerHTML` com HTML em string. O JS usa `textContent`, `src`, `classList`,
  `style.display`, `<template>` + `cloneNode(true)`.
- Eventos no HTML com `onclick="funcao()"`, como no template. Em cards clonados, usar
  `botao.onclick = function () { ... }`.
- SQL só com `INT`, `VARCHAR`, `DATETIME`, `DECIMAL`, `PRIMARY KEY`, `FOREIGN KEY`,
  `AUTO_INCREMENT`, `DEFAULT`, `UNIQUE`, `NULL`. Consultas sempre parametrizadas com `?`.
- **Não fazer commit.** Ao fim de cada tarefa: listar o que mudou e por quê, em linguagem
  simples, sugerir a mensagem de commit e aguardar o Pedro. Os passos "Commit" deste plano
  significam "o Pedro faz o commit".
- Sem dependências npm novas. Chart.js entra como arquivo em `public/js/`.
- Não afirmar que funciona só porque o teste passou. Dizer o que foi verificado e o que falta
  testar no navegador com o banco rodando.
- Não escrever o conteúdo pessoal da história. Não inventar dados de Pokémon. Na dúvida,
  `NULL` e avisar.

## Review Focus

1. **Treinador novo, sem partidas:** `SUM` e `MAX` voltam `NULL`. O Painel deve mostrar `0`,
   e não `null` nem `NaN%`. Os gráficos aparecem vazios com uma mensagem. (Teste na Tarefa 4.)
2. **E-mail ou usuário com maiúsculas ou espaços:** `" Pedro@X.com "` e `"pedro@x.com"` não
   podem virar duas contas, e o login deve funcionar com qualquer uma das formas. O controller
   aplica `trim()` + `toLowerCase()` antes de consultar. (Teste na Tarefa 3.)
3. **Rodada do quiz:** nenhum Pokémon repetido na mesma rodada e nenhuma alternativa repetida
   na mesma pergunta. (Verificação manual na Tarefa 13.)
4. **Pokémon com um tipo só (`tipo2` NULL):** o card mostra só um tipo, sem "null", e o
   filtro por tipo continua funcionando. (Verificação manual na Tarefa 12.)
5. **Busca na Pokédex:** "MIMIKYU", "mimikyu" e " mimi" encontram o Mimikyu. A busca ignora
   maiúsculas e espaços nas pontas. (Verificação manual na Tarefa 12.)

## Mapa de arquivos

```
src/database/script-tabelas-pokemon.sql   reescrito (4 tabelas + catálogo em 4 lotes)
src/database/config.js                     só executar(instrucao, valores)
src/models/treinadorModel.js               SQL de treinador, colecao, tentativa (leitura)
src/models/pokemonModel.js                 listarPokemon()
src/models/quizModel.js                    registrarTentativa, buscarIdsDaColecao, desbloquearPokemon
src/controllers/treinadorController.js     cadastrar, autenticar, painel, pokedex, alterarFavorito
src/controllers/pokemonController.js       listarPokemon
src/controllers/quizController.js          registrarTentativa, separarIdsNovos
src/routes/{index,treinadores,pokemon,quiz}.js
tests/treinadorController.test.js          novo (substitui treinadorAuth.test.js)
tests/quizController.test.js               novo (substitui pokemonController.test.js)
public/images/pokemon/*.png                118 imagens
public/js/chart.umd.min.js                 Chart.js baixado
public/js/sessao.js                        substitui js/shared/core.js
public/js/pages/{login,cadastro,pokedex,quiz,painel}.js
public/{index,historia,login,cadastro,pokedex,quiz,painel}.html   (painel.html substitui dashboard.html)
public/css/shared.css + css/pages/{home,historia,auth,pokedex,quiz,painel}.css
REMOVER: public/perfil.html, js/pages/perfil.js, css/pages/perfil.css, js/shared/core.js,
         public/dashboard.html, js/pages/dashboard.js, css/pages/dashboard.css, public/dashboard/ (vazia)
docs/guia-de-explicacao.md, README.md, AGENTS.md
```

**Helper de verificação (fora do projeto):** criar no scratchpad `executar-sql.js`. Ele lê o
`.env.dev` do projeto e executa um arquivo `.sql` com `mysql2` (`multipleStatements: true`),
sem imprimir a senha. Uso: `node <scratchpad>/executar-sql.js <arquivo.sql>`. Serve para rodar
o script do banco e consultas de conferência.

---

## Etapa 1 — Correções rápidas

### Task 1: Links quebrados da página inicial

**Files:** Modify `public/index.html:23-24,64`

- [ ] **Step 1:** Trocar os três `href="C:\Users\aleso\...\cadastro.html"` / `login.html`
  por `/cadastro.html` e `/login.html`.
- [ ] **Step 2:** Verificar com `grep -rn "C:\\\\" public`. Esperado: nenhuma linha.
- [ ] **Step 3:** Resumo para o Pedro + commit sugerido: `corrige links da página inicial`.

---

## Etapa 2 — Banco e back-end

### Task 2: Script do banco

**Files:** Rewrite `src/database/script-tabelas-pokemon.sql`

**Interfaces:**
- Produces: tabelas `treinador`, `pokemon`, `colecao`, `tentativa` com as colunas exatas da
  spec 5.2. Ordem do script: `DROP DATABASE IF EXISTS pokemon_trainer_hub;`, `CREATE DATABASE`,
  `USE`, as 4 tabelas, e um bloco comentado `-- CATÁLOGO: LOTE 1..4` (preenchido nas Tarefas 6–9).

- [ ] **Step 1:** Escrever o script com comentários curtos em português explicando cada
  tabela. Sem `CHARACTER SET`. `favorito INT DEFAULT 0`. `colecao` com
  `PRIMARY KEY (fk_treinador, fk_pokemon)`.
- [ ] **Step 2:** Rodar com o helper. Conferir com `SHOW TABLES;` (4 linhas) e
  `DESCRIBE colecao;`.
- [ ] **Step 3:** Resumo + commit sugerido: `simplifica o banco para 4 tabelas`.

### Task 3: Cadastro e login no modelo do template

**Files:**
- Modify: `src/database/config.js` (remover `executarTransacao`; `var` → `let`)
- Rewrite: `src/models/treinadorModel.js` (parte de conta), `src/controllers/treinadorController.js`
  (cadastrar, autenticar), `src/routes/treinadores.js`
- Delete: `tests/treinadorAuth.test.js`, `tests/pokemonController.test.js`
- Test: `tests/treinadorController.test.js`

**Interfaces (Produces):**
- `treinadorModel.buscarPorUsuario(usuario)` → `[{ id }]`
- `treinadorModel.buscarPorEmail(email)` → `[{ id }]`
- `treinadorModel.cadastrar(nome, usuario, email, senha)` → resultado do INSERT
- `treinadorModel.autenticar(conta, senha)` → `[{ id, nome, usuario, email }]`
  (`WHERE (email = ? OR usuario = ?) AND senha = ?`)
- `POST /api/treinadores/cadastrar` corpo `{ nome, usuario, email, senha }` → `201 { mensagem }`
  · `400 { mensagem }` · `409 { mensagem }`
- `POST /api/treinadores/autenticar` corpo `{ conta, senha }` → `200 { id, nome, usuario, email }`
  · `400` · `403 { mensagem: "E-mail/usuário ou senha inválidos." }`
- Os erros sempre vêm em `{ mensagem }`, e o front exibe `mensagem`.

- [ ] **Step 1: Escrever os testes que falham** (mesmo padrão dos testes antigos: substituir a
  função do model, objeto `resposta()` falso, restaurar no `afterEach`):
  - `cadastro sem nome responde 400` → `statusCode === 400`, model não chamado.
  - `cadastro com usuário repetido responde 409 e não insere` → `buscarPorUsuario` devolve
    `[{ id: 1 }]`; espera `409`, `mensagem === "Esse nome de treinador já está em uso."`,
    `cadastrar` não chamado.
  - `cadastro com e-mail repetido responde 409` → `buscarPorUsuario` devolve `[]`,
    `buscarPorEmail` devolve `[{ id: 1 }]`; `mensagem === "Esse e-mail já está cadastrado."`.
  - `cadastro normaliza e-mail e usuário antes de consultar` → corpo
    `{ usuario: " Ash_K ", email: " Ash@X.com " }`; `buscarPorUsuario` recebe `"ash_k"`,
    `buscarPorEmail` recebe `"ash@x.com"`, `cadastrar` recebe os mesmos; status `201`.
  - `login com dados certos devolve o treinador` → `autenticar` devolve 1 linha; corpo da
    resposta `{ id, nome, usuario, email }`.
  - `login errado responde 403` → `autenticar` devolve `[]`.
  - `login normaliza a conta` → conta `" Ash@X.com "` chega ao model como `"ash@x.com"`.
- [ ] **Step 2:** `npm test`. Esperado: FAIL (funções inexistentes).
- [ ] **Step 3:** Implementar models, controller e rotas. O controller encadeia com `.then`:
  `buscarPorUsuario` → `buscarPorEmail` → `cadastrar`, retornando cada promessa.
  `ER_DUP_ENTRY` no `catch` também vira 409, como garantia.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** Com `npm start`, testar no terminal com
  `curl -X POST localhost:3333/api/treinadores/cadastrar -H "Content-Type: application/json" -d '{...}'`:
  cadastro novo (201), repetido (409) e login (200). Avisar o Pedro de que o front antigo fica
  quebrado até a Etapa 4.
- [ ] **Step 6:** Resumo + commit sugerido: `login e cadastro no modelo do template`.

### Task 4: Painel, Pokédex e favorito

**Files:** Modify `src/models/treinadorModel.js`, `src/controllers/treinadorController.js`,
`src/routes/treinadores.js`; Rewrite `src/models/pokemonModel.js`; Test `tests/treinadorController.test.js`

**Interfaces:**
- Produces: `pokemonModel.listarPokemon()` →
  `[{ id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem }]` `ORDER BY id`.
  Criado aqui e usado também na Tarefa 5.
- Produces (model):
  - `contarCatalogo()` → `[{ total }]`
  - `buscarResumoColecao(idTreinador)` → `[{ desbloqueados, favoritos }]` (`COUNT`, `SUM(favorito)`)
  - `buscarResumoTentativas(idTreinador)` → `[{ quizzes, totalAcertos, totalErros, melhorPontuacao }]`
  - `buscarTentativas(idTreinador)` → últimas 8, `ORDER BY dt_tentativa DESC LIMIT 8`:
    `[{ pontos, acertos, erros, dt_tentativa }]`
  - `buscarColecao(idTreinador)` → `JOIN pokemon`, `ORDER BY dt_desbloqueio DESC`:
    `[{ id, nome, tipo1, tipo2, imagem, favorito, dt_desbloqueio }]`
  - `alterarFavorito(idTreinador, idPokemon, favorito)` → resultado do UPDATE
- Produces (API):
  - `GET /api/treinadores/painel/:idTreinador` →
    `{ estatisticas: { totalCatalogo, desbloqueados, favoritos, quizzes, totalAcertos, totalErros, melhorPontuacao }, tentativas: [...], colecao: [...] }`.
    Todos os números são inteiros, e `NULL` vira `0` no controller.
  - `GET /api/treinadores/pokedex/:idTreinador` → vetor do catálogo inteiro, cada item com
    `desbloqueado` (0/1) e `favorito` (0/1). O controller junta `listarPokemon()` +
    `buscarColecao()` com dois `for` aninhados. Sem `LEFT JOIN`.
  - `PUT /api/treinadores/favorito/:idTreinador/:idPokemon` corpo `{ favorito: 0|1 }` →
    `200 { favorito }` · `400` · `404 { mensagem: "Esse Pokémon ainda não foi desbloqueado." }`
    (quando `affectedRows == 0`).

- [ ] **Step 1: Testes que falham:**
  - `painel de treinador sem partidas mostra zeros` → resumo de tentativas devolve
    `[{ quizzes: 0, totalAcertos: null, totalErros: null, melhorPontuacao: null }]`; espera
    `estatisticas.totalAcertos === 0`, `totalErros === 0`, `melhorPontuacao === 0`.
  - `pokedex marca desbloqueados e favoritos` → catálogo com ids 1, 2, 3 e coleção
    `[{ id: 2, favorito: 1 }]`; espera o item 2 com `desbloqueado 1 / favorito 1` e os itens
    1 e 3 com `0 / 0`.
  - `favorito com valor inválido responde 400` → corpo `{ favorito: "sim" }`.
  - `favorito em Pokémon bloqueado responde 404` → `alterarFavorito` devolve `{ affectedRows: 0 }`.
  - `painel com id inválido responde 400` → `params.idTreinador = "abc"`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar. No painel, uma cadeia plana de `.then`, em que cada passo guarda
  o resultado em um objeto `resposta` e retorna a próxima consulta.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Resumo + commit sugerido: `painel, pokédex e favoritos no back-end`.

### Task 5: Catálogo e quiz no back-end

**Files:** Rewrite `src/models/quizModel.js`,
`src/controllers/pokemonController.js`, `src/controllers/quizController.js`,
`src/routes/pokemon.js`, `src/routes/quiz.js`, `src/routes/index.js` (`var` → `let`),
`app.js` (`var` → `let`); Test `tests/quizController.test.js`

**Interfaces (Produces):**
- Consumes: `pokemonModel.listarPokemon()` (Tarefa 4)
- `GET /api/pokemon` → o vetor de `listarPokemon()`
- `quizModel.registrarTentativa(idTreinador, acertos, erros, pontos)`,
  `quizModel.buscarIdsDaColecao(idTreinador)` → `[{ fk_pokemon }]`,
  `quizModel.desbloquearPokemon(idTreinador, idPokemon)`
- `quizController.separarIdsNovos(idsAcertados, idsDaColecao)` → vetor só com os ids de
  `idsAcertados` que não estão em `idsDaColecao` e sem repetição (`for` + `indexOf`)
- `POST /api/quiz/tentativa` corpo `{ idTreinador, acertos, erros, idsAcertados }` →
  `200 { pontos, novos: [ids] }`, com `pontos = acertos * 100` calculado no servidor ·
  `400 { mensagem }`. Os inserts dos novos ids são feitos um por um, encadeados.

- [ ] **Step 1: Testes que falham:**
  - `separarIdsNovos remove os que já estão na coleção e repetidos` →
    `separarIdsNovos([3, 5, 5, 8], [5])` deepEqual `[3, 8]`.
  - `tentativa sem idTreinador responde 400`.
  - `tentativa com idsAcertados que não é vetor responde 400`.
  - `tentativa grava pontos e desbloqueia só os novos` → coleção `[{ fk_pokemon: 5 }]`,
    corpo `{ idTreinador: 1, acertos: 3, erros: 7, idsAcertados: [3, 5, 8] }`;
    `registrarTentativa` chamado com `(1, 3, 7, 300)`, `desbloquearPokemon` chamado para 3 e 8,
    resposta `{ pontos: 300, novos: [3, 8] }`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test` → PASS. Conferir `grep -rn "var \|async \|=>" src app.js tests`:
  esperado nenhuma linha.
- [ ] **Step 5:** Resumo + commit sugerido: `quiz e catálogo no back-end, sem perguntas no banco`.

---

## Etapa 3 — Catálogo (118 Pokémon)

Fonte dos dados: `https://pokeapi.co/api/v2/pokemon-species/<nome>` (descrição inglesa da
versão `sun`; `genera` em inglês para a categoria) e `.../pokemon/<nome>` (tipos e altura em
decímetros ÷ 10). Imagens:
`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/<id-pokeapi>.png`.
O script de coleta fica no **scratchpad**, não no projeto. A tradução para português é feita
à mão pelo assistente: descrição fiel à original, categoria "Pokémon X", tipos com os nomes
oficiais em PT (Grama, Fogo, Água, Inseto, Voador, Elétrico, Pedra, Terra, Aço, Fada, Psíquico,
Fantasma, Lutador, Venenoso, Gelo, Dragão, Sombrio, Normal).

Cada tarefa deste bloco tem os mesmos passos:
- [ ] Coletar os dados do lote e salvar um `.json` de conferência no scratchpad.
- [ ] Baixar as imagens do lote para `public/images/pokemon/<nome-minusculo>.png`.
  Conferir a quantidade de arquivos e que nenhum tem 0 bytes.
- [ ] Acrescentar o `INSERT INTO pokemon (id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem) VALUES ...`
  do lote no bloco comentado do script.
- [ ] Rodar o script com o helper e conferir `SELECT COUNT(*) FROM pokemon;`.
- [ ] Mostrar ao Pedro uma tabela do lote (id, nome, tipos, categoria, descrição) e **aguardar
  a conferência** antes do próximo lote. Commit sugerido: `catálogo: lote N`.

### Task 6: Lote 1 — ids 1–33 (#722 Rowlet a #748 Toxapex + formas de Oricorio, Lycanroc, Wishiwashi)
### Task 7: Lote 2 — ids 34–61 (#749 Mudbray a #775 Komala + Minior Núcleo)
### Task 8: Lote 3 — ids 62–100 (#776 Turtonator a #809 Melmetal + Mimikyu Desmascarado, 3 formas de Necrozma, Magearna Cor Original)
### Task 9: Lote 4 — ids 101–118 (formas de Alola)

`numero` = número nacional; nome `"<Espécie> de Alola"`; imagem `"<especie>-alola.png"`.
Ordem: Rattata, Raticate, Raichu, Sandshrew, Sandslash, Vulpix, Ninetales, Diglett, Dugtrio,
Meowth, Persian, Geodude, Graveler, Golem, Grimer, Muk, Exeggutor, Marowak. Na PokeAPI, o nome
é `<especie>-alola`. Pegar o id numérico da imagem pelo campo `id` de `/pokemon/<especie>-alola`.

---

## Etapa 4 — Páginas em português, com os elementos no HTML

**Menu comum (exato, em todas as páginas):** dentro de `<header class="site-header">`:
marca (bola + "Pokémon Trainer Hub", link `/`); links Início `/`, Minha história
`/historia.html`, Painel `/painel.html`, Pokédex `/pokedex.html`, Quiz `/quiz.html`;
`<div id="menu-visitante">` com Entrar `/login.html` e Começar `/cadastro.html`;
`<div id="menu-treinador" style="display:none">` com `<span id="menu-usuario"></span>` e
`<button onclick="sair()">Sair</button>`. O link da página atual recebe `class="atual"`,
escrito à mão no HTML. Cada página carrega `js/sessao.js` antes do JS da página.

### Task 10: sessao.js + menu em todas as páginas + login

**Files:** Create `public/js/sessao.js`; Rewrite `public/js/pages/login.js`, `public/login.html`;
Modify `<header>` de `index.html`, `historia.html`, `cadastro.html`, `pokedex.html`,
`quiz.html`; Rename `dashboard.html` → `painel.html` (só o menu por enquanto); Delete
`public/js/shared/core.js`.

**Interfaces (Produces):**
- `sessionStorage.ID_TREINADOR`, `NOME_TREINADOR`, `USUARIO_TREINADOR`, `EMAIL_TREINADOR`
- `atualizarMenu()`: chamado no fim do `sessao.js`. Se houver `ID_TREINADOR`, esconde
  `#menu-visitante`, mostra `#menu-treinador` e escreve `@usuario`.
- `validarSessao()`: chamado no topo do JS das páginas protegidas. Sem `ID_TREINADOR` →
  `window.location = "login.html"`.
- `sair()`: `sessionStorage.clear()` e depois `window.location = "index.html"`.
- `login.js`: `entrar()`, ligado ao botão com `onclick`. Mensagens em `#mensagem-login`.
  Sucesso → grava as 4 chaves e vai para `painel.html`.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** No navegador (`npm start`): login com a conta criada na Tarefa 3 → painel;
  o menu mostra `@usuario`; Sair limpa e volta ao início; abrir `/pokedex.html` sem login
  manda para o login (depois da Tarefa 12); senha errada mostra a mensagem do servidor.
- [ ] **Step 3:** Resumo + commit sugerido: `sessão e login no modelo do template`.

### Task 11: Cadastro com validações

**Files:** Rewrite `public/js/pages/cadastro.js`, `public/cadastro.html`

**Interfaces (Produces):** `validarUsuario(usuario)`, `validarEmail(email)` e
`validarSenha(senha, confirmacao)` devolvem `""` quando está tudo certo ou a mensagem do
primeiro erro (textos exatos da spec 5.6.0 e da conversa); `cadastrar()` chama as três em
ordem e exibe a primeira mensagem em `#mensagem-cadastro`. Se passar, faz o POST; com `201`,
mostra "Cadastro feito! Indo para o login..." e redireciona com `setTimeout` de 2 s.

- [ ] **Step 1:** Remover do HTML os atributos `pattern` e `minlength`. A validação passa a
  ser do JS, para ser explicável.
- [ ] **Step 2:** Implementar (o algoritmo da senha é o `for` com 4 booleanos da spec 5.6.0).
- [ ] **Step 3:** No navegador, testar uma vez cada mensagem: senha sem maiúscula, sem
  minúscula, sem número, sem especial, curta, confirmação diferente; e-mail sem `@`, com
  espaço, sem domínio; usuário repetido; e-mail repetido; cadastro válido → login.
- [ ] **Step 4:** Resumo + commit sugerido: `cadastro com validações em português`.

### Task 12: Pokédex

**Files:** Rewrite `public/pokedex.html`, `public/js/pages/pokedex.js`

**Interfaces:**
- Consumes: `GET /api/treinadores/pokedex/:idTreinador`, `PUT /api/treinadores/favorito/...`
- HTML: busca `#busca-pokemon` (`oninput="mostrarPokedex()"`); 19 botões de filtro escritos
  à mão ("Todos" + 18 tipos) com `onclick="filtrarPorTipo('Água')"`; `#contador-pokedex`;
  `#grade-pokemon`; `<template id="molde-card">` com `.card-numero`, `.card-imagem` (img),
  `.card-nome`, `.card-tipos`, `.card-favorito` (botão); `<dialog id="detalhes-pokemon">`
  com campos fixos `#detalhe-numero`, `#detalhe-imagem`, `#detalhe-nome`, `#detalhe-tipos`,
  `#detalhe-categoria`, `#detalhe-altura`, `#detalhe-descricao` e o aviso "Descrição: tradução
  livre da Pokédex oficial (Pokémon Moon)."
- JS: `let listaPokemon = []`, `let tipoSelecionado = "Todos"`; `carregarPokedex()`,
  `mostrarPokedex()` (limpa a grade, `for` + `if` de busca/tipo, clona o molde),
  `filtrarPorTipo(tipo)`, `alternarFavorito(idPokemon)`, `abrirDetalhes(idPokemon)`.
  Pokémon bloqueado: imagem com classe `silhueta`, nome "???", tipos escondidos, sem botão de
  favorito; o diálogo mostra "Acerte este Pokémon no quiz para descobri-lo.".

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** No navegador: contador "X / 118 descobertos"; filtros; busca
  (Review Focus 4 e 5); favoritar e desfavoritar; detalhes de um bloqueado e de um desbloqueado.
- [ ] **Step 3:** Resumo + commit sugerido: `pokédex com elementos no HTML`.

### Task 13: Quiz

**Files:** Rewrite `public/quiz.html`, `public/js/pages/quiz.js`

**Interfaces:**
- Consumes: `GET /api/pokemon`, `POST /api/quiz/tentativa`
- HTML: `#tela-pergunta` (`#progresso-texto`, `#progresso-barra`, `#tipo-pergunta`,
  `#enunciado`, `#imagem-pergunta`, 4 botões fixos `#alternativa-0..3` com
  `onclick="escolherAlternativa(0..3)"`, `#botao-proxima`); `#tela-resultado` escondida
  (`#resultado-pontos`, `#resultado-acertos`, `#resultado-erros`, `#resultado-precisao`,
  `#lista-novos`, `<template id="molde-novo">`, botão "Jogar novamente").
- JS: `let perguntasCuriosidade = [...]` (~15 objetos `{ enunciado, idPokemon, alternativas, resposta }`,
  redigidos pelo assistente a partir de fatos oficiais e **conferidos pelo Pedro**);
  `carregarCatalogo()`, `montarRodada()` (10 perguntas: 7 de silhueta + 3 sorteadas do vetor;
  `while` evita Pokémon repetido na rodada), `sortearAlternativas(nomeCerto)` (`while` até ter
  4 nomes diferentes, posição do certo sorteada), `mostrarPergunta()`,
  `escolherAlternativa(indice)`, `proximaPergunta()`, `finalizarQuiz()`, `jogarNovamente()`.
  Na silhueta, a imagem recebe a classe `silhueta`; na curiosidade, a imagem fica escondida.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** No navegador: jogar 2 rodadas; conferir que não há Pokémon nem alternativa
  repetidos (Review Focus 3); o resultado lista os novos com imagem; a Pokédex mostra os
  desbloqueados.
- [ ] **Step 3:** Mostrar ao Pedro as perguntas de curiosidade para ele conferir.
- [ ] **Step 4:** Resumo + commit sugerido: `quiz com perguntas em vetor`.

### Task 14: Painel com Chart.js + remover Perfil

**Files:** Create `public/js/chart.umd.min.js` (baixar de
`https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`); Rewrite
`public/painel.html`, Create `public/js/pages/painel.js`, `public/css/pages/painel.css`
(partindo do dashboard.css); Delete os arquivos de perfil e dashboard da lista de remoção.

**Interfaces:**
- HTML: topo com `#painel-nome`, `#painel-usuario`, `#painel-email` e botão Sair; 6 cards com
  `#numero-desbloqueados`, `#numero-progresso`, `#numero-favoritos`, `#numero-quizzes`,
  `#numero-precisao`, `#numero-melhor`; `<canvas id="grafico-pontos">`,
  `<canvas id="grafico-tipos">`, `<canvas id="grafico-acertos">`, cada um com um
  `<p class="grafico-vazio">` escondido; `#lista-ultimos` e `#lista-favoritos` com
  `<template id="molde-mini">`.
- JS: `carregarPainel()`, `mostrarNumeros(estatisticas)` (progresso e precisão com
  `Math.round`; divisão só se o total for maior que 0), `criarGraficoPontos(tentativas)`
  (linha, do mais antigo para o mais novo), `criarGraficoTipos(colecao)` (`for` conta
  tipo1/tipo2 em dois vetores paralelos `nomesTipos` / `quantidades`),
  `criarGraficoAcertos(totalAcertos, totalErros)` (pizza), `mostrarMiniLista(lista, idDestino)`.
  Sem dados → esconde o canvas e mostra o `.grafico-vazio`.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** No navegador: conta nova (tudo 0, gráficos com mensagem, Review Focus 1) e
  conta depois de 2 partidas (3 gráficos com dados). Conferir que nenhum link aponta para
  `perfil.html` ou `dashboard.html` (`grep -rn "perfil.html\|dashboard.html" public`).
- [ ] **Step 3:** Resumo + commit sugerido: `painel com Chart.js; perfil incorporado`.

---

## Etapa 5 — Visual praiano

Referência: `.superpowers/brainstorm/2179-1795364081/content/visual-praiano-v2.html` e
`historia-v3.html`. Paleta e fontes exatas na spec 5.8. CSS em português nos nomes de classe
novos. Só `flex`, `transform: rotate`, `filter: brightness(0)`, `outline-offset`, `@media`.

### Task 15: Base visual + Início + Login/Cadastro

**Files:** Rewrite `public/css/shared.css` (variáveis da paleta em `:root`, fontes, menu,
botões, rodapé, `.silhueta { filter: brightness(0); }`), `public/css/pages/home.css`,
`public/css/pages/auth.css`; Modify `public/index.html` (hero de cartão-postal com selo
"ALOLA", chamada "LEMBRANÇAS DE ALOLA", título em Pacifico; `<link>` do Google Fonts em todas
as páginas); rodapé com crédito: "Imagens: PokeAPI. Pokémon © Nintendo / Game Freak /
The Pokémon Company."

- [ ] **Step 1:** Implementar. **Step 2:** Conferir no navegador em 1280px e 375px (DevTools).
- [ ] **Step 3:** Resumo + commit sugerido: `visual praiano: base, início e login`.

### Task 16: Visual da Pokédex, Quiz e Painel

**Files:** Rewrite `public/css/pages/pokedex.css`, `quiz.css`, `painel.css`. Pokédex: fundo
azul-petróleo, cards brancos com `box-shadow: 0 6px 0 var(--turquesa)`. Cores dos gráficos
do Chart.js iguais à paleta (definidas em `painel.js`).

- [ ] **Step 1:** Implementar. **Step 2:** Conferir as 3 páginas em 1280px e 375px.
- [ ] **Step 3:** Resumo + commit sugerido: `visual praiano: pokédex, quiz e painel`.

### Task 17: Estrutura da Minha história

**Files:** Rewrite `public/historia.html`, `public/css/pages/historia.css`

- [ ] **Step 1:** Parágrafo de abertura e 5 fases (`.fase` / `.fase invertida`, `.polaroid`
  com `.inclinada-esquerda` / `.inclinada-direita`, `.ano`, `h2`, `p`), com os textos
  provisórios do rascunho marcados `<!-- PEDRO: escreva aqui -->`. Sem fotos: usar
  `<div class="foto-vazia">Foto em breve</div>` (não referenciar arquivos inexistentes).
  Criar a pasta `public/images/historia/` e explicar ao Pedro como trocar a div por
  `<img src="images/historia/fase1.jpg">`.
- [ ] **Step 2:** Remover o aviso do Figma. Conferir em 1280px e 375px.
- [ ] **Step 3:** Resumo + commit sugerido: `estrutura da página minha história`.

---

## Etapa 6 — Documentação

### Task 18: Guia de explicação, README e AGENTS.md

**Files:** Create `docs/guia-de-explicacao.md`; Modify `README.md`, `AGENTS.md`

- [ ] **Step 1:** Guia: para cada página (Início, História, Cadastro, Login, Quiz, Pokédex,
  Painel), uma tabela com campo/botão → o que faz → função JS → rota da API → tabela do banco.
  Depois, explicação linha por linha de: validação de senha, validação de e-mail,
  `sortearAlternativas`, `montarRodada`, `<template>` + `cloneNode`, `criarGraficoTipos`,
  `separarIdsNovos` e o fluxo de login com `sessionStorage`. No fim, "Perguntas que o professor
  pode fazer", com respostas curtas (por que `?` no SQL, por que chave composta, onde fica a
  senha, por que as perguntas não ficam no banco).
- [ ] **Step 2:** README: atualizar tabelas, endpoints, banco, páginas, créditos das imagens
  e status. AGENTS.md: seções 3, 5, 6 e 7 conforme a spec (modelo do template, `let`, Chart.js
  autorizado, elementos no HTML, tabelas novas).
- [ ] **Step 3:** `npm test` final + `grep -rn "var \|async \|=>\|innerHTML" src public/js tests app.js`
  (esperado nenhuma linha, exceto dentro de `chart.umd.min.js`).
- [ ] **Step 4:** Resumo + commit sugerido: `guia de explicação e documentação atualizada`.
