# AGENTS.md — Pokémon Trainer Hub

Instruções para agentes de IA (Claude Code, OpenCode) que trabalharem neste projeto.
Leia este arquivo antes de qualquer alteração.

---

## 1. Sobre o desenvolvedor

Pedro Gabriel, aluno do **1º semestre** de Análise e Desenvolvimento de Sistemas
na São Paulo Tech School. Este é um projeto individual acadêmico.

Como trabalhar comigo:

- Responda sempre em **português**.
- **Explique o que está sendo feito e por quê**, não só entregue o código.
- Prefira **código simples e legível** a código enxuto e esperto.
- Se precisar usar um recurso além do básico de JavaScript, **explique antes de usar**.
- Quando houver mais de uma forma de resolver, mostre a mais direta primeiro.
- Vou precisar **explicar este código para um professor**. Se eu não conseguir
  entender uma solução, ela não serve, mesmo que funcione.
- Ao terminar uma tarefa, faça 1 ou 2 perguntas curtas para eu fixar o que foi feito.

### Escopo de cada tarefa

- Faça **uma tarefa por vez**, no escopo de arquivos que eu indicar.
- Não altere arquivos fora do escopo pedido.
- Não reescreva arquivos inteiros quando uma alteração pontual resolve.
- Ao terminar, **liste o que mudou e por quê**, e aguarde antes de seguir.
- Não faça commits automaticamente.
- Não instale dependências novas sem me perguntar.

---

## 2. O projeto

O Pokémon Trainer Hub é uma aplicação web ambientada no universo Pokémon, com
foco na região de Alola e na Geração VII.

O visitante cria uma conta como treinador, responde um quiz de silhuetas e
curiosidades, desbloqueia Pokémon na própria Pokédex a cada acerto, e acompanha
o progresso em um painel com gráficos.

### Tecnologias

- **Front-end:** HTML, CSS e JavaScript puro — sem frameworks.
- **Gráficos:** Chart.js 4.4.1, carregado pela CDN do jsDelivr no `painel.html`
  (autorizado; mesmo formato do exemplo da faculdade).
- **Fontes:** Google Fonts por `<link>` (Pacifico, Bungee, Nunito, Fredoka).
- **Back-end:** Node.js com Express.
- **Banco:** MySQL, base `pokemon_trainer_hub`.
- **Testes:** módulo nativo `node:test`.

Não introduzir React, Next.js, TypeScript, bibliotecas de CSS ou qualquer
tecnologia adicional sem autorização.

### Regras de código JavaScript (front e back)

- Variáveis sempre com **`let`** — nunca `var` nem `const`.
- Nomes de funções, variáveis, campos da API e colunas em **português**.
- Usar a lógica do 1º semestre: `if / else if / else`, `for`, `while`, vetores,
  objetos, funções e `fetch().then()`.
- **Não usar:** `async/await`, `Map`, `Set`, `reduce`, `Promise.all`, regex,
  arrow functions (`=>`), IIFE, `"use strict"`, `Object.assign`.

---

## 3. Estado atual

**Tudo funciona e foi testado no navegador com o banco ligado:** cadastro com
validações, login, menu de sessão, quiz, desbloqueio, Pokédex com 118 Pokémon
(imagens e silhuetas), favoritos, painel com 3 gráficos e o visual praiano.

**Pendente (do autor):**

| Item | Situação |
|---|---|
| Fotos e textos de `historia.html` | Estrutura pronta com 5 fases; conteúdo a ser escrito pelo autor — **não gerar** |
| Seção "Sobre o projeto" do README | A ser escrita pelo autor |

Documentação do projeto:
- `docs/guia-de-explicacao.md` — explicação de cada página, campo e função.
- `docs/superpowers/specs/` e `docs/superpowers/plans/` — decisões e plano da refatoração.

---

## 4. Aquatech: referência técnica, fora do projeto

O Aquatech (`web-data-viz`) é o template fornecido pela faculdade. Ele **não está
dentro deste repositório**.

Dele vale a **organização** (Express servindo front e API, routes/controllers/models,
conexão via `dotenv`) e o **modelo de sessão** (dados do usuário no `sessionStorage`).

Dele **não** vale nada de negócio: empresas, aquários, sensores, medidas, avisos,
códigos de ativação. Não criar tabelas, rotas, entidades ou arquivos com esses nomes.

---

## 5. Banco de dados

Base própria: `pokemon_trainer_hub`. Credenciais sempre por variáveis de ambiente,
nunca no código.

### Tabelas

| Tabela | Guarda |
|---|---|
| `treinador` | Contas (`usuario` e `email` com `UNIQUE`; `senha` em texto, como no template) |
| `pokemon` | O catálogo de 118 entradas (`tipo1`, `tipo2` pode ser `NULL`) |
| `colecao` | Pokémon desbloqueados e favoritados (PK composta `fk_treinador` + `fk_pokemon`) |
| `tentativa` | Partidas do quiz: acertos, erros, pontos e data |

As perguntas do quiz **não** ficam no banco (vetor `perguntasCuriosidade` em `quiz.js`
e silhuetas montadas a partir do catálogo).

### Regras

- Usar apenas tipos e comandos vistos em aula: `INT`, `VARCHAR`, `DATETIME`, `DECIMAL`,
  `PRIMARY KEY`, `FOREIGN KEY`, `AUTO_INCREMENT`, `DEFAULT`, `UNIQUE`, `NULL`.
  **Não usar** BIGINT, SMALLINT, TINYINT, JSON, ENUM, CHARACTER SET, `INSERT IGNORE`,
  `ON DUPLICATE KEY`, `COALESCE`.
- O script `src/database/script-tabelas-pokemon.sql` **apaga e recria** o banco
  (`DROP DATABASE IF EXISTS`). Mudanças na estrutura vão nele.
- Sempre usar **consultas parametrizadas** (`?`), nunca concatenar valores no SQL.
- Não criar tabela nova sem antes verificar se uma existente atende.

---

## 6. Organização do código

```
app.js              servidor e variáveis de ambiente
src/routes/         quais endereços existem
src/controllers/    recebe a requisição, valida com if, responde
src/models/         únicos arquivos que escrevem SQL
src/database/       conexão e script das tabelas
public/             HTML, CSS, JS e imagens
tests/              testes unitários
```

### Endpoints

```
POST   /api/treinadores/cadastrar
POST   /api/treinadores/autenticar
GET    /api/treinadores/painel/:idTreinador
GET    /api/treinadores/pokedex/:idTreinador
PUT    /api/treinadores/favorito/:idTreinador/:idPokemon
GET    /api/pokemon
POST   /api/quiz/tentativa
```

Antes de alterar um endpoint: verificar quem o consome em `public/js/` e
atualizar os consumidores junto.

### Regra de front-end

**Os elementos ficam escritos no próprio `.html`, não gerados pelo JavaScript.**
O JS só preenche valores (`textContent`, `src`), troca classes e mostra/esconde
blocos (`style.display`). Nunca usar `innerHTML` com HTML em texto.

Para listas de tamanho variável, o desenho de um item fica num `<template>` no HTML
e o JS copia com `cloneNode(true)` dentro de um `for`.

Eventos no HTML com `onclick="funcao()"`, como no template da faculdade.

### CSS

- Paleta em variáveis no `:root` de `css/shared.css` (`--creme`, `--petroleo`,
  `--coral`, `--mostarda`, `--turquesa`...). Usar sempre as variáveis.
- Preferir `display: flex`; `grid` só nas grades de cards (`repeat(n, 1fr)`).
- Evitar seletores avançados (`:nth-child`, `:has` etc.). Usar classes com nomes claros.

---

## 7. Sessão e segurança

O projeto segue **o modelo do template da faculdade**, por escolha do autor:

- No login, o model busca a conta por e-mail/usuário (`SELECT ... WHERE email = ? OR usuario = ?`)
  e o **controller compara a senha em JavaScript** — o MySQL (colação `_ci`) ignora
  maiúsculas/minúsculas, então a senha **não** deve ser comparada no SQL.
- O navegador guarda `ID_TREINADOR`, `NOME_TREINADOR` e `USUARIO_TREINADOR` no
  `sessionStorage`.
- As páginas Painel, Pokédex e Quiz chamam `validarSessao()` e mandam para o login
  se não houver sessão.
- As rotas recebem o id do treinador na URL ou no corpo.

Limitações conhecidas e aceitas: a senha fica em texto puro e o id pode ser trocado
no navegador. Não "corrigir" isso sem o autor pedir — a simplicidade é proposital.

Regras que continuam valendo: consultas sempre com `?`; validar os dados no
controller com `if`; usuário e e-mail repetidos são verificados no servidor.

---

## 8. Catálogo de Pokémon

118 entradas: Geração VII (#722 a #809), 12 formas alternativas da Geração VII
(cada uma logo depois da sua espécie) e as 18 formas de Alola (ids 101 a 118).

- `numero` = número nacional (pode repetir entre formas); `id` = chave única.
- Descrições: tradução livre de **Pokémon Moon**; se a entrada não existe no Moon,
  Ultra Moon ou Let's Go. Formas de Alola usam a entrada da **forma de Alola**.
- Imagens em `public/images/pokemon/`, vindas da PokeAPI (artes oficiais).

**Não inventar dados.** Em caso de dúvida sobre qualquer campo, deixar `NULL` e avisar.

---

## 9. Testes

O projeto tem testes unitários em `tests/`, rodados com `npm test`. Devem ser
preservados e ampliados conforme o código evoluir.

**Atenção:** os testes unitários não tocam no banco (as funções do model são
substituídas por versões falsas). Por isso: **não afirmar que algo funciona só
porque o teste passou.** Dizer o que foi verificado e o que ainda precisa ser
testado no navegador com o banco rodando.
