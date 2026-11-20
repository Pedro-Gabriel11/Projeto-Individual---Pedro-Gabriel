<div align="center">

# Pokémon Trainer Hub

**Uma plataforma onde cada visitante vira um treinador: cria sua conta, responde quizzes, desbloqueia Pokémon na própria Pokédex e acompanha o progresso em uma dashboard.**

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-FFCB05?style=for-the-badge)
![SPTech](https://img.shields.io/badge/SPTech-ADS-3B4CCA?style=for-the-badge)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)

[Sobre](#sobre-o-projeto) •
[Status](#status-do-projeto) •
[Telas](#telas) •
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

O projeto é ambientado no universo Pokémon, com foco na região de Alola e na Geração VII.

### A proposta

Em vez de um site apenas informativo, o Pokémon Trainer Hub coloca o visitante
para interagir: ele se cadastra como treinador, responde a quizzes de silhueta e
trivia, e cada acerto desbloqueia um Pokémon na sua Pokédex pessoal. Esse uso gera
os dados que alimentam a dashboard de progresso.

> Projeto individual do curso de Análise e Desenvolvimento de Sistemas da
> **São Paulo Tech School**, desenvolvido a partir do template `web-data-viz`
> fornecido pela instituição e refatorado para este tema.

---

## Status do projeto

O projeto está **em desenvolvimento**. O fluxo principal — cadastro, login, quiz,
desbloqueio de Pokémon e dashboard — já foi validado de ponta a ponta com o banco
em execução. O que falta é conteúdo: a história pessoal, o catálogo completo e as
imagens.

| Funcionalidade | Descrição | Status |
|---|---|---|
| **Cadastro de treinador** | Conta com nome, usuário, e-mail e senha, validando duplicidade | Implementado |
| **Login e sessão** | Autenticação por e-mail ou usuário, sessão de 7 dias e logout | Implementado |
| **Quiz** | Perguntas de silhueta e trivia, com pontuação calculada no servidor | Implementado |
| **Desbloqueio na Pokédex** | Cada acerto no quiz adiciona o Pokémon à coleção do treinador | Implementado |
| **Favoritos** | Marcar e desmarcar Pokémon já desbloqueados | Implementado |
| **Dashboard** | Histórico de tentativas, precisão e tipos mais coletados | Implementado |
| **Perfil** | Dados do treinador e resumo do progresso | Implementado |
| **Minha história** | Página que conecta a franquia à trajetória pessoal do autor | Conteúdo pendente |
| **Catálogo completo** | 106 entradas (Geração VII + formas de Alola) | 4 entradas de demonstração |
| **Imagens dos Pokémon** | Artes e silhuetas do catálogo | Pendente (ilustrações em CSS) |
| **Validação ponta a ponta** | Teste manual do fluxo principal com o banco ativo | Concluída |

### Páginas

`index.html` · `historia.html` · `cadastro.html` · `login.html` ·
`quiz.html` · `pokedex.html` · `dashboard.html` · `perfil.html`

---

## Telas

<!-- PEDRO: rode o projeto, tire prints e salve em docs/prints/.
     Depois troque os comentários abaixo pelas imagens. Exemplo:
     ![Home](docs/prints/home.png) -->

| Home | Quiz |
|---|---|
| _print pendente_ | _print pendente_ |

| Pokédex | Dashboard |
|---|---|
| _print pendente_ | _print pendente_ |

---

## Arquitetura

Uma única aplicação Express serve o front-end estático e a API, com a separação
clássica em três camadas:

```
app.js                    servidor Express, carrega as variáveis de ambiente
│
├── src/
│   ├── routes/           define os endereços da API (o "o quê")
│   ├── controllers/      recebe a requisição, valida e responde (o "como")
│   ├── models/           conversa com o MySQL (o "onde")
│   └── database/         conexão e script de criação das tabelas
│
├── public/               tudo que o navegador recebe
│   ├── *.html            as oito páginas
│   ├── css/shared.css    estilos comuns
│   ├── css/pages/        um arquivo por página
│   ├── js/shared/        funções compartilhadas (core.js)
│   └── js/pages/         um script por página
│
└── tests/                testes unitários
```

**Por que separar assim:** a rota só diz qual endereço existe, o controller cuida
das regras e da resposta, e o model é o único que escreve SQL. Quando algo quebra,
a camada aponta onde procurar.

As rotas privadas passam antes pelo middleware `autenticarTreinador`, que confere
o token de sessão enviado no cabeçalho `Authorization: Bearer <token>`.

---

## Banco de dados

Banco próprio: `pokemon_trainer_hub`.

| Tabela | Guarda |
|---|---|
| `pokemon_treinador` | Contas dos treinadores (com `senha_hash`) |
| `pokemon_sessao` | Sessões ativas, com hash do token e data de expiração |
| `pokemon_catalogo` | As entradas da Pokédex (nome, tipos, categoria, descrição) |
| `pokemon_pergunta` | Perguntas do quiz, suas alternativas e a resposta correta |
| `pokemon_colecao` | Quais Pokémon cada treinador desbloqueou e favoritou |
| `pokemon_tentativa` | Histórico de cada partida: pontos, acertos, erros e precisão |

As tabelas usam chaves estrangeiras com `ON DELETE CASCADE`, de forma que apagar
um treinador remove junto suas sessões, sua coleção e seu histórico.

**Segurança:** senhas são guardadas com `scrypt`, nunca em texto puro. O token de
sessão é aleatório e só o seu hash fica no banco — mesmo quem lesse a tabela não
conseguiria se passar pelo treinador.

---

## Como executar

**Pré-requisitos:** Node.js 18 ou superior e MySQL instalados.

```bash
# 1. Clonar o repositório
git clone https://github.com/Pedro-Gabriel11/Projeto-Individual---Pedro-Gabriel.git
cd Projeto-Individual---Pedro-Gabriel

# 2. Instalar as dependências
npm install
```

**3. Criar o arquivo de ambiente.** Na raiz do projeto, crie um `.env.dev` com:

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

**4. Criar as tabelas.** Execute o script `src/database/script-tabelas-pokemon.sql`
no MySQL. Ele cria o banco, as tabelas e insere dados de demonstração.

```bash
# 5. Iniciar o servidor
npm start
```

Acesse o endereço configurado em `APP_HOST` e `APP_PORT`.

---

## API

Todos os endpoints usam o prefixo `/api`. Os marcados com 🔒 exigem o cabeçalho
`Authorization: Bearer <token>`.

### Treinadores

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/api/treinadores/cadastrar` | Cria a conta do treinador |
| `POST` | `/api/treinadores/autenticar` | Faz login e devolve o token de sessão |
| `POST` | `/api/treinadores/sair` | 🔒 Encerra a sessão |
| `GET` | `/api/treinadores/visao-geral` | 🔒 Progresso e histórico do treinador |
| `GET` | `/api/treinadores/pokedex` | 🔒 Coleção de Pokémon do treinador |
| `PATCH` | `/api/treinadores/pokedex/:pokemonId/favorito` | 🔒 Marca ou desmarca favorito |

### Quiz e catálogo

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/api/quiz/perguntas` | 🔒 Lista as perguntas disponíveis |
| `POST` | `/api/quiz/tentativas` | 🔒 Registra o resultado de uma partida |
| `GET` | `/api/pokemon` | Lista o catálogo de Pokémon |

A pontuação das tentativas é calculada no servidor, não no navegador — assim o
resultado não pode ser alterado pelo usuário.

---

## Testes

O projeto tem testes unitários escritos com o módulo nativo `node:test`,
sem bibliotecas externas.

```bash
npm test
```

Cobrem o cadastro e o hash de senha, o fluxo de autenticação, o cálculo de
pontuação do quiz e a marcação de favoritos.

---

## Uso de IA

<!-- PEDRO: confira se a disciplina exige esse registro e em que formato.
     Se exigir um diário de prompts detalhado, vale criar docs/diario-de-prompts.md
     e linkar aqui. -->

O desenvolvimento contou com apoio de ferramentas de IA (OpenCode e Claude Code)
para estruturação do código e revisão. As decisões de escopo, o tema, o conteúdo
pessoal e a validação do que foi implementado são de autoria própria.

As diretrizes dadas aos agentes estão documentadas em [`AGENTS.md`](AGENTS.md).

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
