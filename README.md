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
[Testes](#testes) •
[Uso de IA](#uso-de-ia) •
[Autor](#autor)

</div>

---

## Sobre o projeto

<!-- PEDRO: esta seção é sua. Conte a sua história com Pokémon: quando começou,
     o que a franquia significou em cada fase da sua vida, e por que ela virou
     o tema deste projeto. Dois ou três parágrafos bastam. -->

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
| **Início** (`index.html`) | Apresenta o site em um "cartão-postal" e leva ao quiz, à Pokédex e ao painel |
| **Minha história** (`historia.html`) | Fases da minha vida com Pokémon, em fotos estilo polaroid |
| **Cadastro** (`cadastro.html`) | Cria a conta, com validação de e-mail e de senha (maiúscula, minúscula, número e caractere especial) e verificação de nome de treinador e e-mail repetidos |
| **Login** (`login.html`) | Entrada por e-mail ou nome de treinador |
| **Quiz** (`quiz.html`) | 10 perguntas por partida: 7 de silhueta e 3 de curiosidade. Cada acerto desbloqueia o Pokémon |
| **Pokédex** (`pokedex.html`) | Os 118 Pokémon com busca, filtro por tipo, silhuetas dos não descobertos, detalhes e favoritos |
| **Painel** (`painel.html`) | Números do treinador e 3 gráficos (Chart.js): pontos por partida (linha), acertos x erros (pizza) e Pokémon por tipo (barras) |

**Catálogo:** 118 entradas — as 88 espécies da Geração VII (#722 a #809), 12 formas alternativas da
própria geração (Oricorio, Lycanroc, Wishiwashi, Minior, Mimikyu, Necrozma, Magearna) e as 18 formas de Alola.

Explicação detalhada de cada página, campo e função: [`docs/guia-de-explicacao.md`](docs/guia-de-explicacao.md).

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
│   ├── *.html            as 7 páginas (os elementos ficam escritos no HTML)
│   ├── css/shared.css    paleta de cores e estilos comuns
│   ├── css/pages/        um arquivo por página
│   ├── js/sessao.js      menu e controle de sessão (sessionStorage)
│   ├── js/pages/         um script por página
│   └── images/           imagens dos Pokémon e fotos da história
│
└── tests/                testes unitários (node:test)
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

## Testes

Testes unitários com o módulo nativo `node:test`, sem bibliotecas externas:

```bash
npm test
```

Cobrem as validações do cadastro e do login (campos vazios, usuário e e-mail repetidos, normalização
de maiúsculas), o painel de um treinador sem partidas, a marcação de desbloqueados na Pokédex, os
favoritos e o registro de partidas do quiz. Os testes **não usam o banco**: as funções do model são
substituídas por versões falsas. Por isso, o fluxo completo também foi testado no navegador com o
banco ligado.

---

## Uso de IA

<!-- PEDRO: confira se a disciplina exige esse registro e em que formato. -->

O desenvolvimento contou com apoio de ferramentas de IA (OpenCode e Claude Code) para estruturação do
código, tradução das descrições dos Pokémon e revisão. As decisões de escopo, o tema, o visual, o
conteúdo pessoal e a validação do que foi implementado são de autoria própria.

As diretrizes dadas aos agentes estão em [`AGENTS.md`](AGENTS.md).

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
