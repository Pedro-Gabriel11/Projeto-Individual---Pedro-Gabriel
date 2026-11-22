# Refatoração para a apresentação — Pokémon Trainer Hub

Data: 22/11/2026 · Apresentação: entre 26/11 e 03/12

## 1. Por que esta mudança

O Pedro vai apresentar o projeto individual para professores do 1º semestre de ADS
e precisa **explicar cada linha** com segurança. Hoje o projeto funciona, mas:

- o JavaScript usa recursos que não foram vistos em aula (`async/await`, `Map`, `Set`,
  `reduce`, `Promise.all`, regex) e tem nomes e campos em inglês — os professores cobram português;
- o banco usa tipos e comandos fora do conteúdo (BIGINT, SMALLINT, JSON, ENUM, TINYINT
  UNSIGNED, CHARACTER SET, INSERT IGNORE, ON DUPLICATE KEY, COALESCE, índices nomeados);
- as perguntas do quiz estão no banco, o que não faz sentido (feedback de uma colega);
- a autenticação (scrypt, token com hash, Bearer, middleware) é difícil de explicar;
- o visual ainda tem cara de Figma/template; a página "Minha história" está com texto de rascunho;
- o catálogo tem 4 Pokémon (um deles, Pikachu, fora do escopo), sem imagens.

**Sucesso =** site funcionando de ponta a ponta, com visual próprio "praiano", 118 Pokémon
com imagem/silhueta/descrição, e código que o Pedro entende e consegue explicar.

## 2. Objetivos, não-objetivos e anti-objetivos

**Objetivos**
- JS (front e back) em português, com a lógica do 1º semestre: `if / else if / else`,
  `while`, `for`, vetores, objetos/JSON, funções, `fetch().then()`.
- Banco com 4 tabelas, só `INT`, `VARCHAR`, `DATETIME`, `DECIMAL`, `PRIMARY KEY`,
  `FOREIGN KEY`, `AUTO_INCREMENT`, `DEFAULT`.
- Login no modelo do template da faculdade (Aquatech).
- Catálogo completo: 88 espécies da Geração VII (#722–#809) + 12 formas alternativas da própria Geração VII + 18 formas de Alola = 118 (decisão do Pedro: "caminho A" — formas que mudam tipo ou aparência; Megas, Hisui, Gigantamax, Totem, cores do Minior e tipos do Silvally ficam de fora).
- Visual "cartão-postal praiano" (aprovado no rascunho visual).
- Página "Minha história" com 5 fases em polaroids, pronta para receber fotos e textos do Pedro.
- Um **guia de explicação** página por página (cada campo, botão e função).

**Não-objetivos**
- Segurança de nível profissional (escolha consciente pelo modelo do template).
- Novas funcionalidades além das existentes.

**Anti-objetivos** (falha mesmo que funcione)
- Qualquer trecho que o Pedro não consiga explicar.
- Dados de Pokémon inventados ou errados.
- Site quebrado no computador da apresentação (caminhos absolutos, dependência de internet
  para as imagens).
- Texto da história escrito pela IA — o conteúdo pessoal é do Pedro.

## 3. Restrições

- Seguir o [AGENTS.md](../../../AGENTS.md): HTML/CSS/JS puro, Express, MySQL, `node:test`;
  sem frameworks; sem dependências novas sem perguntar; **sem commits automáticos** —
  o Pedro faz os commits ao fim de cada etapa.
- Uma etapa por vez; ao fim de cada uma, listar o que mudou e por quê, em linguagem simples,
  e aguardar o Pedro.
- Não afirmar que algo funciona só porque o teste passou: dizer o que foi verificado e o que
  precisa ser testado no navegador com o banco rodando.

## 4. Abordagens consideradas

| | Abordagem | Trade-off |
|---|---|---|
| **A (escolhida)** | Refatorar o projeto atual, etapa por etapa | Site funcional ao fim de cada etapa; histórico no Git; se o prazo apertar, o que está feito já serve. Partes antigas e novas convivem por um tempo. |
| B | Recomeçar do zero a partir do template | Código uniforme, mas nada funciona até quase o fim — risco alto com 4 dias. Refaz trabalho já validado. |

Escolhida a **A**, pelo prazo e por manter o projeto sempre apresentável.

## 5. O que foi decidido

### 5.1 Login e sessão — modelo do template (decisão do Pedro)

- **Cadastro:** front envia `nome, usuario, email, senha`. Controller valida com
  `if / else if` (campos vazios/indefinidos), model faz `INSERT`. E-mail ou usuário repetido
  → mensagem amigável.
- **Login:** `SELECT id, nome, usuario, email FROM treinador WHERE (email = ? OR usuario = ?) AND senha = ?`.
  Se voltar 1 linha → devolve os dados; senão → "E-mail/usuário ou senha inválidos".
- **Senha guardada em texto puro**, como no template. Escolha consciente do Pedro.
- **Navegador** guarda em `sessionStorage`: `ID_TREINADOR`, `NOME_TREINADOR`, `USUARIO_TREINADOR` (o e-mail não é guardado nem mostrado no Painel — pedido do Pedro).
- **Páginas protegidas** (Painel, Pokédex, Quiz): se não houver `ID_TREINADOR`, redireciona para o login.
- **Sair:** `sessionStorage.clear()` e volta ao início.
- **Consultas com `?`** (parametrizadas), não com `'${valor}'` como o template — mesma
  dificuldade, e evita SQL injection (bom argumento se o professor perguntar).
- **Removidos:** tabela `pokemon_sessao`, módulo `crypto`, middleware `autenticarTreinador`,
  `executarTransacao` do `config.js`, testes de autenticação.
- Atualizar a seção 7 do AGENTS.md para refletir o novo modelo.

### 5.2 Banco de dados

Script novo recria o banco do zero (`DROP DATABASE IF EXISTS` + `CREATE`), autorizado pelo
Pedro — os dados de teste atuais serão perdidos.

```
treinador  id INT PK AI · nome VARCHAR(80) · usuario VARCHAR(30) UNIQUE · email VARCHAR(100) UNIQUE
           · senha VARCHAR(50) · dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP

pokemon    id INT PK · numero INT · nome VARCHAR(50) · tipo1 VARCHAR(20) · tipo2 VARCHAR(20) (pode ser NULL)
           · categoria VARCHAR(60) · descricao VARCHAR(400) · altura DECIMAL(4,1) · imagem VARCHAR(60)

colecao    fk_treinador INT · fk_pokemon INT · favorito INT DEFAULT 0 · dt_desbloqueio DATETIME DEFAULT CURRENT_TIMESTAMP
           PRIMARY KEY (fk_treinador, fk_pokemon) · FKs para treinador e pokemon

tentativa  id INT PK AI · fk_treinador INT FK · acertos INT · erros INT · pontos INT
           · dt_tentativa DATETIME DEFAULT CURRENT_TIMESTAMP
```

- `tipos JSON` → `tipo1` / `tipo2`.
- `colecao` com chave primária composta: o banco impede o mesmo Pokémon duas vezes para o
  mesmo treinador.
- `precisao` e `resultado` saem — são calculados: `acertos / (acertos + erros)`.
- Tabelas `pokemon_pergunta` e `pokemon_sessao` deixam de existir; prefixo `pokemon_` sai dos nomes.
- Números do Painel com `COUNT`, `SUM`, `MAX`. Contagem por tipo feita no JS, com `for`.
- `numero` = número nacional (Vulpix de Alola = 37). `altura` em metros.

### 5.3 Endpoints novos

```
POST /api/treinadores/cadastrar
POST /api/treinadores/autenticar
GET  /api/treinadores/painel/:idTreinador          estatísticas + tentativas + coleção
GET  /api/treinadores/pokedex/:idTreinador         catálogo inteiro + desbloqueado/favorito
PUT  /api/treinadores/favorito/:idTreinador/:idPokemon   corpo: { favorito: 0 ou 1 }
GET  /api/pokemon                                  catálogo inteiro (usado pelo quiz)
POST /api/quiz/tentativa                           corpo: { idTreinador, acertos, erros, idsAcertados: [...] }
```

Campos de entrada e saída em português (`acertos`, `idTreinador`, `nome`, `tipo1`…).
Ao salvar a tentativa, o controller grava a `tentativa`, busca a coleção do treinador e
insere só os ids que ainda não estão nela (`for` + `if`), e devolve os ids novos.

### 5.4 Quiz

- **Perguntas fora do banco.**
- **Silhueta:** gerada a partir do catálogo (`GET /api/pokemon`). Sorteia um Pokémon,
  mostra a imagem com `filter: brightness(0)`; as alternativas são o nome certo + 3 nomes
  sorteados diferentes (`while` até ter 4 nomes distintos). Assim **todos os 118 podem ser
  desbloqueados** sem escrever 118 perguntas. *(Decisão do assistente — ver seção 6.)*
- **Curiosidade:** vetor de objetos em `quiz.js`
  (`{ enunciado, idPokemon, alternativas: [...], resposta }`), com ~15 perguntas baseadas
  em fatos oficiais, conferidas pelo Pedro.
- O navegador corrige as respostas e envia acertos, erros e os ids acertados. O servidor
  calcula os pontos (100 por acerto) e devolve, para a regra ficar em um lugar só.
  O gabarito fica visível no navegador — aceito, combina com o modelo do template.
- Cada acerto desbloqueia o Pokémon daquela pergunta.

### 5.5 Páginas

**Ficam:** Início, Minha história, Cadastro, Login, Quiz, Pokédex, Painel.
**Sai:** Perfil — os dados do treinador (nome, @usuario, e-mail, botão sair) vão para o topo
do Painel. Favoritos continuam (Pokédex + seção no Painel).

**Regra de front-end (pedido do Pedro): os elementos ficam escritos no próprio `.html`,
não gerados pelo JavaScript.** O JS só preenche valores (`textContent`, `src` de imagem),
troca classes e mostra/esconde blocos (`style.display`). Nenhum `innerHTML` com HTML em string.

Como cada parte fica:
- **Menu (cabeçalho):** escrito em cada página. O JS só esconde "Entrar/Começar" ou
  "@usuario/Sair" conforme a sessão.
- **Quiz:** a pergunta tem sempre 4 alternativas, então os **4 botões ficam fixos no HTML**.
  O JS troca o texto deles e a imagem a cada pergunta. A tela de resultado também fica
  pronta no HTML, escondida até o fim da partida.
- **Painel:** os 6 cards de números e os 2 `<canvas>` dos gráficos ficam no HTML com `id`.
  O JS só coloca os números.
- **Filtros de tipo da Pokédex:** botões escritos no HTML (os 18 tipos).
- **Listas de tamanho variável** (118 cards da Pokédex, últimos desbloqueios, favoritos,
  histórico de partidas): o "molde" de um card fica no HTML dentro de uma tag `<template>`.
  O JS faz um `for` pelo vetor de dados, copia o molde (`cloneNode`) e preenche os campos.
  Essa é a **única** parte em que o JS cria elementos, e o desenho do card continua no HTML.

**Correções rápidas (etapa 1):**
- `index.html`: três links com caminho `C:\Users\...` → `/cadastro.html` e `/login.html`.
- Remover Pikachu do catálogo.
- Trocar o texto de rascunho do Figma em `historia.html`.

### 5.6 Organização do JS no navegador

- `fetch().then()` em vez de `async/await`, como no template.
- `js/shared/core.js` vira `js/sessao.js` simples, com `validarSessao()`, `limparSessao()`
  e a montagem do menu com base no `sessionStorage`.
- Um arquivo por página em `js/pages/`, com nomes de funções e variáveis em português
  (`carregarPokedex`, `listaPokemon`, `perguntaAtual`…).
- **Variáveis sempre com `let`** (pedido do Pedro), nunca `var`, em todo o JS do projeto:
  front, back e testes. Isso inclui os `require`.

### 5.6.0 Validações do cadastro

**No navegador (`cadastro.js`): o formato**, com `if / else if` e uma mensagem por regra:
- **E-mail:** não vazio; sem espaços (`indexOf(" ")`); `@` depois de pelo menos 1 caractere;
  `.` pelo menos 2 caracteres depois do `@` e não no final (`lastIndexOf(".")`).
- **Senha:** um `for` percorre cada caractere e liga as variáveis `temMaiuscula`,
  `temMinuscula`, `temNumero` e `temEspecial` comparando faixas (`letra >= "A" && letra <= "Z"`,
  etc.). Qualquer caractere que não seja letra nem número conta como especial. Regras: mínimo
  de 8 caracteres, uma maiúscula, uma minúscula, um número, um especial e confirmação igual.
  Sem regex.
- **Usuário (nome de treinador):** não vazio, de 3 a 30 caracteres, sem espaços.

**No servidor (`treinadorController.js`): o que só o banco sabe.**
- Confere campos vazios ou indefinidos, como o template.
- Antes do `INSERT`, `SELECT id FROM treinador WHERE usuario = ?`: se houver resultado →
  "Esse nome de treinador já está em uso."
- Depois, `SELECT id FROM treinador WHERE email = ?`: se houver resultado →
  "Esse e-mail já está cadastrado."
- O `UNIQUE` em `usuario` e `email` continua no banco como garantia extra.
- "Nome de treinador" = campo `usuario` (o @). O nome de exibição pode se repetir.

### 5.6.1 Gráficos do Painel — Chart.js (decisão do Pedro)

- Seguir o exemplo da faculdade (`DOCUMENTOS_DE_APOIO/exemplo_criacao_grafico_estatico`):
  `new Chart(ctx, { type: ..., data: { labels: [...], datasets: [...] } })`.
- **Gráfico de linha:** pontos das últimas 8 partidas (rótulo = data da partida).
- **Gráfico de barras:** quantidade de Pokémon desbloqueados por tipo.
- **Gráfico de pizza (`type: 'pie'`):** Acertos x Erros, somando todas as partidas
  (`SUM(acertos)` e `SUM(erros)` da tabela `tentativa`).
- Os vetores `labels` e `data` são montados com `for` a partir da resposta da API.
- Chart.js carregado **pela CDN** (`<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js">`), como no exemplo da faculdade — decisão do Pedro. Consequência: o Painel precisa de internet para mostrar os gráficos.
  As cores dos gráficos seguem a paleta
  praiana.
- O AGENTS.md diz "sem bibliotecas sem autorização". Esta tem autorização do Pedro;
  registrar isso no AGENTS.md.

### 5.7 Catálogo (118 Pokémon)

- **Escopo:** #722 Rowlet a #809 Melmetal (88) + formas de Alola de Rattata, Raticate,
  Raichu, Sandshrew, Sandslash, Vulpix, Ninetales, Diglett, Dugtrio, Meowth, Persian,
  Geodude, Graveler, Golem, Grimer, Muk, Exeggutor e Marowak (18).
- **Imagens:** artes oficiais do repositório público da PokeAPI (`PokeAPI/sprites`,
  `official-artwork`), **baixadas** para `public/images/pokemon/`. Arquivo = nome em
  minúsculas (`rowlet.png`, `vulpix-alola.png`); a coluna `imagem` guarda esse nome.
  Créditos no rodapé e no README.
- **Descrições e categorias:** tradução livre das entradas oficiais em inglês de
  Pokémon **Moon** (pedido do Pedro); formas que não existem no Moon (Lycanroc Crepuscular, Necrozma Juba Crepuscular, Asas da Alvorada e Ultra) usam Ultra Moon. Descrições das formas vêm da PokémonDB, pois a PokeAPI não as guarda. Aviso "tradução livre" na Pokédex. Tipos em português. Altura em metros.
- **Conferência:** inserir em ~4 lotes de 25–27; o Pedro confere cada lote antes do próximo.

### 5.8 Visual "cartão-postal praiano" (aprovado)

- Paleta: creme `#f3e6c8`, azul-petróleo `#1d4e5f`, coral `#d9534f`, mostarda `#e9b44c`,
  turquesa `#2ec4b6`, branco.
- Fontes (Google Fonts via `<link>`): **Pacifico** (títulos), **Bungee** (rótulos/pequenos
  destaques), **Nunito** (texto), **Fredoka** (cards dos Pokémon).
- Página inicial: moldura de cartão-postal (borda branca + `outline` tracejado com
  `outline-offset`), selo "ALOLA" inclinado, botões retangulares azul-petróleo.
- Pokédex: fundo azul-petróleo; cards brancos arredondados com sombra turquesa
  (`box-shadow: 0 6px 0`), número, ♥ favorito, tipos em coral; bloqueados em silhueta com "???".
- Minha história: 5 fases em polaroids (340px, alternando esquerda/direita com
  `flex-direction: row-reverse`, classes `inclinada-esquerda` / `inclinada-direita`),
  parágrafo de abertura, ano + título + texto. Fotos em `public/images/historia/`.
  No celular, foto em cima e texto embaixo.
- Só CSS explicável: `flex` (não `grid` onde der), `transform: rotate`, `filter: brightness(0)`,
  `@media`. Sem `:nth-child`.
- Rascunhos de referência: `.superpowers/brainstorm/.../visual-praiano-v2.html` e `historia-v3.html`.

### 5.9 Ordem das etapas

| # | Etapa | Meta |
|---|---|---|
| 1 | Correções rápidas | 22/11 |
| 2 | Banco + back-end (models, controllers, rotas, config, testes) | 23/11 |
| 3 | Catálogo: 4 lotes + imagens | 23–24/11 |
| 4 | JS e HTML em português, página por página (sessao.js → login → cadastro → pokédex → quiz → painel; remover perfil) | 24–25/11 |
| 5 | Visual praiano + estrutura da história com fotos | 25/11 |
| 6 | Guia de explicação (`docs/guia-de-explicacao.md`) + README/AGENTS.md atualizados | 25–26/11 |

O guia de explicação explica, página por página, cada campo, botão e função: o que faz,
de onde vem o dado e para onde vai. Os trechos de lógica (validação de senha e e-mail,
sorteio das alternativas, montagem dos gráficos, `<template>` + `cloneNode`) são explicados
linha por linha, em linguagem simples. Além do guia, cada etapa termina com um resumo simples
do que mudou e por quê.

A etapa 2 quebra o front antigo até a etapa 4 terminar. Por isso as etapas 2 e 4 devem
ser feitas em sequência, sem pausa longa entre elas.

### 5.10 Testes

Os testes antigos (autenticação, quiz no servidor) deixam de fazer sentido. Novos testes
`node:test` cobrem as validações dos controllers (cadastro com campo faltando → 400,
tentativa sem `idTreinador` → 400) com o model simulado, e a função que separa ids novos
da coleção. Cada etapa termina com a lista do que foi verificado e do que precisa ser
testado no navegador com o banco rodando.

## 6. O que fica para o builder / decisões do assistente

- **Silhuetas geradas a partir do catálogo** (5.4): sem isso, só os Pokémon com pergunta
  escrita poderiam ser desbloqueados.
- **`<template>` para listas de tamanho variável** (5.5): mantém o desenho do card no HTML,
  como o Pedro pediu. `createElement` foi descartado porque levaria a estrutura para o JS.
- **Ordem da Pokédex:** por `id` — espécies da Geração VII em ordem nacional, cada forma alternativa logo depois da sua espécie (ids 1–100); formas de Alola no fim (101–118).
- **Rodada do quiz:** 10 perguntas (7 de silhueta + 3 de curiosidade), sorteadas com `Math.random`.
- **Perguntas de curiosidade:** o assistente redige a partir de fatos oficiais; o Pedro confere.
- **Fontes:** `<link>` do Google Fonts (mais fácil de explicar), sempre com fonte reserva
  (`font-family: Pacifico, cursive`). Sem internet, o site continua funcionando, só com
  outra letra.
- **Cards de números do Painel:** desbloqueados, progresso (%), favoritos, quizzes,
  precisão geral e melhor pontuação. São os mesmos de hoje.
