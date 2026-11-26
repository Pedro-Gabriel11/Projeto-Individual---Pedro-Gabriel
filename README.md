<div align="center">

# Pokémon Trainer Hub

**Uma plataforma onde cada visitante vira um treinador: cria sua conta, responde quizzes, desbloqueia Pokémon na própria Pokédex e acompanha o progresso em um painel com gráficos.**

![Status](https://img.shields.io/badge/status-pronto%20para%20apresentação-2ec4b6?style=for-the-badge)
![SPTech](https://img.shields.io/badge/SPTech-ADS-1d4e5f?style=for-the-badge)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)

[Sobre](#sobre-o-projeto) •
[Funcionalidades](#funcionalidades) •
[Arquitetura](#arquitetura) •
[Banco de dados](#banco-de-dados) •
[Como executar](#como-executar) •
[API](#api) •
[Uso de IA](#uso-de-ia-e-diário-de-prompts) •
[Autor](#autor)

</div>

---

## Sobre o projeto

> _A preencher: a conexão entre Pokémon e a minha trajetória._

### O tema

O projeto é ambientado no universo Pokémon, na região de **Alola** (Geração VII), inspirada no Havaí —
por isso o visual de "cartão-postal praiano".

### A proposta

Em vez de um site apenas informativo, o Pokémon Trainer Hub coloca o visitante para interagir: ele se
cadastra como treinador, responde a um quiz de silhuetas e curiosidades, e cada acerto desbloqueia um
Pokémon na sua Pokédex pessoal. Esse uso gera os dados que alimentam os gráficos do painel.

> Projeto individual do curso de Análise e Desenvolvimento de Sistemas da **São Paulo Tech School**,
> desenvolvido a partir do template `web-data-viz` fornecido pela instituição e adaptado para este tema.

---

## Funcionalidades

| Página | O que faz |
|---|---|
| **Início** (`index.html`) | Apresenta o site em um "cartão-postal", leva ao quiz, à Pokédex e ao painel, e traz a seção **Minha história**: as fases da minha vida com Pokémon, em fotos estilo polaroid |
| **Cadastro** (`cadastro.html`) | Cria a conta, com validação de e-mail e de senha (maiúscula, minúscula, número e caractere especial) e verificação de nome de treinador e e-mail repetidos |
| **Login** (`login.html`) | Entrada por e-mail ou nome de treinador |
| **Quiz** (`quiz.html`) | 5 perguntas por partida: 3 de silhueta e 2 de curiosidade. Cada acerto desbloqueia o Pokémon |
| **Pokédex** (`pokedex.html`) | Os 118 Pokémon com busca, filtro por tipo, silhuetas dos não descobertos, detalhes e favoritos |
| **Painel** (`painel.html`) | Números do treinador e 3 gráficos (Chart.js): pontos por partida (linha), acertos x erros (pizza) e Pokémon por tipo (barras) |

**Catálogo:** 118 entradas — as 88 espécies da Geração VII (#722 a #809), 12 formas alternativas da
própria geração (Oricorio, Lycanroc, Wishiwashi, Minior, Mimikyu, Necrozma, Magearna) e as 18 formas de Alola.

---

## Arquitetura

Uma única aplicação Express serve o front-end estático e a API, separada em três camadas:

```
app.js                    servidor Express e variáveis de ambiente
│
├── src/
│   ├── routes/           quais endereços existem
│   ├── controllers/      recebe a requisição, valida com if e responde
│   ├── models/           únicos arquivos que escrevem SQL (sempre com ?)
│   └── database/         conexão (config.js) e script do banco
│
├── public/               tudo que o navegador recebe
│   ├── *.html            as 6 páginas (os elementos ficam escritos no HTML)
│   ├── css/shared.css    paleta de cores e estilos comuns
│   ├── css/pages/        um arquivo por página
│   ├── js/sessao.js      menu e controle de sessão (sessionStorage)
│   ├── js/pages/         um script por página
│   └── images/           imagens dos Pokémon e fotos da história
```

**Por que separar assim:** a rota só diz qual endereço existe, o controller cuida das regras e da
resposta, e o model é o único que escreve SQL. Quando algo quebra, a camada aponta onde procurar.

**Front-end:** a estrutura de cada página fica no `.html`; o JavaScript só preenche os valores
(`textContent`, `src`) e mostra ou esconde partes. Listas de tamanho variável (cards da Pokédex,
histórico) usam um molde `<template>` copiado com `cloneNode`.

**Sessão:** no modelo do template da faculdade — depois do login, o navegador guarda o id, o nome e o
usuário do treinador no `sessionStorage`. As páginas Painel, Pokédex e Quiz conferem isso com
`validarSessao()` e mandam para o login se não houver ninguém.

---

## Banco de dados

Banco próprio: `pokemon_trainer_hub`, com 4 tabelas.

| Tabela | Guarda |
|---|---|
| `treinador` | as contas (`usuario` e `email` com `UNIQUE`) |
| `pokemon` | o catálogo de 118 Pokémon (`tipo2` pode ser `NULL`) |
| `colecao` | quais Pokémon cada treinador desbloqueou e favoritou (chave primária composta `fk_treinador` + `fk_pokemon`) |
| `tentativa` | cada partida do quiz: acertos, erros, pontos e data |

As perguntas do quiz não ficam no banco: as de silhueta são montadas a partir do catálogo, e as de
curiosidade ficam em um vetor no `quiz.js`.

---

## Como executar

**Pré-requisitos:** Node.js 18 ou superior e MySQL.

```bash
# 1. Clonar o repositório
git clone https://github.com/Pedro-Gabriel11/Projeto-Individual---Pedro-Gabriel.git
cd Projeto-Individual---Pedro-Gabriel

# 2. Instalar as dependências
npm install
```

**3. Criar o arquivo de ambiente.** Na raiz do projeto, crie um `.env.dev`:

```env
AMBIENTE_PROCESSO=desenvolvimento

DB_HOST=localhost
DB_DATABASE=pokemon_trainer_hub
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_PORT=3306

APP_HOST=localhost
APP_PORT=3333
```

> Os arquivos `.env` não vão para o repositório — eles contêm a senha do banco.

**4. Criar o banco.** Execute o arquivo inteiro `src/database/script-tabelas-pokemon.sql` no MySQL
Workbench. Ele **apaga e recria** o banco, as tabelas e os 118 Pokémon.

```bash
# 5. Iniciar o servidor
npm start
```

Acesse `http://localhost:3333`. O painel usa o Chart.js pela internet (CDN), então é preciso estar online.

---

## API

Todos os endereços começam com `/api`.

### Treinadores

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/api/treinadores/cadastrar` | Cria a conta (`{ nome, usuario, email, senha }`) |
| `POST` | `/api/treinadores/autenticar` | Faz login (`{ conta, senha }`) e devolve `{ id, nome, usuario, email }` |
| `GET` | `/api/treinadores/painel/:idTreinador` | Estatísticas, últimas partidas e coleção |
| `GET` | `/api/treinadores/pokedex/:idTreinador` | Os 118 Pokémon com `desbloqueado` e `favorito` |
| `PUT` | `/api/treinadores/favorito/:idTreinador/:idPokemon` | Marca (`{ favorito: 1 }`) ou desmarca (`0`) um favorito |

### Catálogo e quiz

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/api/pokemon` | Lista o catálogo |
| `POST` | `/api/quiz/tentativa` | Salva a partida (`{ idTreinador, acertos, erros, idsAcertados }`) e devolve `{ pontos, novos }` |

Os pontos (100 por acerto) são calculados no servidor.

---


## Uso de IA e diário de prompts

O desenvolvimento contou com apoio de ferramentas de IA (OpenCode e Claude Code). Eu usei a IA como
uma parceira de programação: **as decisões de tema, escopo, visual, regras do site e conteúdo pessoal
foram minhas**. A IA propunha opções e escrevia código a partir dessas decisões, e eu revisava cada
etapa, testava no navegador, conferia os dados e fazia os commits. Também pedi que ela me explicasse
cada mudança e me fizesse perguntas, para eu entender e conseguir explicar o código.

Abaixo estão os principais pedidos que fiz, em ordem, com o texto organizado e resumido.

### Antes de 22/11 — primeira versão

| # | O que eu pedi | Minha participação |
|---|---|---|
| 1 | Prtótipo so site com Figma | Utilizei a plataforma do Figma para realizar o primeiro protótipo e esboço do projeto, focando mais na parte visual do site. |

### 22/11 — avaliação, planejamento e refatoração

| # | O que eu pedi | Minha participação |
|---|---|---|
| 1 | Avaliar tudo o que já estava feito e me ajudar a planejar as mudanças, porque eu apresentaria o projeto em poucos dias. Listei o que queria: um visual mais "praiano" e menos genérico, fotos e textos sobre a minha relação com Pokémon, JavaScript em português usando a lógica do 1º semestre (if, else, while, for, vetores, JSON), um banco sem tipos que não vimos em aula e um site mais simples, com imagens, silhuetas e descrição para todos os Pokémon. | Levei a lista de problemas que eu mesmo tinha identificado e o feedback de uma colega: não fazia sentido guardar as perguntas do quiz no banco. |
| 2 | Escolher como ficaria o login. | Escolhi manter o modelo de sessão do template da faculdade, que é o que vimos em aula. |
| 3 | Simplificar o site. | Aprovei tirar a página Perfil (os dados dela foram para o Painel) e manter os favoritos. Aprovei o banco com 4 tabelas. |
| 4 | Mostrar opções de visual. | Comparei três estilos e escolhi o "cartão-postal retrô", com os cards de outro estilo. Pedi fotos maiores e mais fases na página da história. |
| 5 | Usar o Chart.js, como no exemplo da faculdade, e acrescentar um gráfico de pizza. | Defini os gráficos do painel e escolhi a pizza de "Acertos x Erros". |
| 6 | Deixar os elementos das páginas escritos no próprio HTML, e não gerados pelo JavaScript, e usar `let` no lugar de `var`. | Regras de código definidas por mim. |
| 7 | Validar o cadastro: e-mail, senha com letra maiúscula, minúscula, número e caractere especial, e verificar no banco se o nome de treinador ou o e-mail já existem. | Defini as regras de validação. |
| 8 | Me guiar durante a execução e me fazer perguntas sobre cada etapa. | Respondi às perguntas de cada etapa (chave primária composta, SQL injection, `while` x `for`, `sessionStorage`, vetores paralelos, CSS) e fiz os commits a cada etapa. |
| 9 | Usar as descrições da Pokédex do **Pokémon Moon** e incluir também as formas diferentes dos Pokémon. | Conferi os quatro lotes do catálogo antes de cada um entrar no banco e escolhi incluir as formas que mudam de tipo ou de aparência (118 Pokémon). |
| 10 | Corrigir dois erros visuais que encontrei testando o quiz. | Encontrei os erros: nas perguntas de curiosidade o Pokémon não aparecia depois da resposta, e ao passar de pergunta dava para ver a imagem antes da silhueta. |
| 11 | Carregar o Chart.js pela internet, sem baixar o arquivo para o projeto, e tirar o e-mail da tela do painel. | Ajustes decididos por mim depois de revisar o painel. |
| 12 | Organizar o repositório no padrão do projeto-modelo da faculdade, tirando arquivos de apoio do desenvolvimento e os comentários do código. | Comparei com o projeto-modelo e decidi o que ficaria. |

### 24/11 a 26/11 — ajustes finais

| # | O que eu pedi | Minha participação |
|---|---|---|
| 13 | Juntar o conteúdo da página "Minha história" à página inicial, mantendo as fotos e os textos. | Decisão minha para deixar o site mais direto. |
| 14 | Tirar "Minha história" do menu, já que tudo passou a ficar na mesma página. | Decisão minha. |
| 15 | Diminuir o quiz para 5 perguntas, porque cada partida estava demorando muito. | Testei o quiz e decidi pelo tamanho menor. |
| 16 | Montar este diário de prompts e um plano de preparação para a apresentação. | Pedido meu para documentar o processo. |

---

## Créditos

- Imagens dos Pokémon: [PokeAPI](https://github.com/PokeAPI/sprites) (artes oficiais).
- Descrições: tradução livre das Pokédex oficiais de Pokémon Moon (quando a entrada não existe nesse
  jogo, Ultra Moon ou Let's Go). Descrições das formas: [PokémonDB](https://pokemondb.net).

---

## Autor

**Pedro Gabriel de Souza Silva**
Análise e Desenvolvimento de Sistemas — São Paulo Tech School

[![GitHub](https://img.shields.io/badge/GitHub-Pedro--Gabriel11-181717?style=flat-square&logo=github)](https://github.com/Pedro-Gabriel11)

---

<div align="center">
<sub>Projeto acadêmico sem fins comerciais. Pokémon é marca registrada da Nintendo,
Game Freak e The Pokémon Company.</sub>
</div>
