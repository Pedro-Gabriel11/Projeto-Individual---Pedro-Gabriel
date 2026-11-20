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

O visitante cria uma conta como treinador, responde quizzes de silhueta e trivia,
desbloqueia Pokémon na própria Pokédex a cada acerto, e acompanha o progresso em
uma dashboard.

### Tecnologias

- **Front-end:** HTML, CSS e JavaScript puro — sem frameworks.
- **Back-end:** Node.js com Express.
- **Banco:** MySQL, base `pokemon_trainer_hub`.
- **Testes:** módulo nativo `node:test`.

Não introduzir React, Next.js, TypeScript, bibliotecas de CSS ou qualquer
tecnologia adicional sem autorização.

---

## 3. Estado atual

**Funciona e está validado de ponta a ponta:** cadastro, login, sessão, quiz,
desbloqueio de Pokémon, favoritos, dashboard e perfil.

**Pendente:**

| Item | Situação |
|---|---|
| Conteúdo da página `historia.html` | A ser escrito pelo autor — não gerar |
| Catálogo de Pokémon | 4 registros de demonstração; meta é 106 |
| Imagens | Nenhuma no projeto; hoje tudo é ilustração em CSS |
| Identidade visual | Paleta ainda é a genérica do template |
| HTML dentro de JavaScript | Precisa ser extraído (ver seção 6) |

---

## 4. Aquatech: referência técnica, fora do projeto

O Aquatech (`web-data-viz`) é o template fornecido pela faculdade. Ele **não está
dentro deste repositório** — fica numa pasta irmã, fora do projeto, e normalmente
não estará acessível durante o trabalho.

Dele vale a **organização**: Express servindo front e API, separação em
routes/controllers/models, conexão via `dotenv`.

Dele **não** vale nada de negócio: empresas, aquários, sensores, medidas, avisos,
códigos de ativação. Não criar tabelas, rotas, entidades ou arquivos com esses
nomes. O Pokémon Trainer Hub tem domínio, banco e API próprios.

---

## 5. Banco de dados

Base própria: `pokemon_trainer_hub`. Credenciais sempre por variáveis de ambiente,
nunca no código.

### Tabelas existentes

| Tabela | Guarda |
|---|---|
| `pokemon_treinador` | Contas (`senha_hash` em VARCHAR(255)) |
| `pokemon_sessao` | Sessões ativas, com hash do token e expiração |
| `pokemon_catalogo` | Entradas da Pokédex |
| `pokemon_pergunta` | Perguntas do quiz, alternativas e resposta correta |
| `pokemon_colecao` | Pokémon desbloqueados e favoritados por treinador |
| `pokemon_tentativa` | Histórico de partidas: pontos, acertos, erros, precisão |

Não criar tabela nova sem antes verificar se uma existente atende.

### Alterações no banco

- `CREATE TABLE IF NOT EXISTS` **não atualiza** tabela já existente. Mudanças
  estruturais exigem um `ALTER TABLE`, e ele deve ser informado explicitamente.
- Atualizar o script `src/database/script-tabelas-pokemon.sql` junto, para que
  uma instalação nova já saia correta.
- Preservar dados existentes. Nada de `DROP` sem autorização explícita.
- Sempre usar **consultas parametrizadas** (`?`), nunca concatenar valores vindos
  do usuário dentro do SQL.

---

## 6. Organização do código

Uma única aplicação Express serve o front estático e a API sob o prefixo `/api`.

```
app.js              servidor e variáveis de ambiente
src/routes/         quais endereços existem
src/controllers/    recebe a requisição, valida, responde
src/models/         únicos arquivos que escrevem SQL
src/database/       conexão e script das tabelas
public/             HTML, CSS e JS do navegador
tests/              testes unitários
```

### Endpoints atuais

```
POST   /api/treinadores/cadastrar
POST   /api/treinadores/autenticar
POST   /api/treinadores/sair                              🔒
GET    /api/treinadores/visao-geral                       🔒
GET    /api/treinadores/pokedex                           🔒
PATCH  /api/treinadores/pokedex/:pokemonId/favorito       🔒
GET    /api/quiz/perguntas                                🔒
POST   /api/quiz/tentativas                               🔒
GET    /api/pokemon
```

🔒 = exige `Authorization: Bearer <token>`.

Antes de alterar um endpoint: verificar quem o consome em `public/js/`, avaliar
se a mudança é necessária, e atualizar os consumidores junto.

### Regra de front-end a seguir daqui em diante

Hoje várias páginas montam HTML dentro de strings no JavaScript. **Isso deve ser
corrigido página por página**, quando solicitado: a estrutura vai para o arquivo
`.html`, e o JavaScript apenas preenche os valores com `textContent`.

Não criar código novo que gere HTML por concatenação de strings.

---

## 7. Autenticação e segurança

Já implementado e funcionando: senha com `scrypt` (sal + hash), token de sessão
aleatório do qual só o hash fica no banco, expiração de 7 dias, e middleware
`autenticarTreinador` protegendo as rotas privadas.

**Analisar antes de alterar.** Essa parte funciona; mudanças aqui exigem
justificativa e explicação.

Regras permanentes:

- Nunca armazenar senha em texto puro.
- Nunca enviar ao front dados que o treinador não deveria ver.
- Cada treinador acessa somente os próprios dados.
- As regras de acesso valem no **back-end**. Esconder algo com CSS ou JavaScript
  não é proteção.

### Pokémon bloqueados

A API não deve enviar ao navegador nome, tipos, descrição, categoria, slug ou
caminho de imagem de um Pokémon que o treinador ainda não desbloqueou — só o
necessário para mostrar a silhueta ou o estado bloqueado.

---

## 8. Catálogo de Pokémon

Escopo: Geração VII (nacional #722 a #809, 88 espécies) mais as 18 formas
regionais de Alola. Total de 106 entradas.

- Formas de Alola são entradas separadas, ligadas à espécie original.
- Não incluir espécies de gerações anteriores só porque aparecem na Pokédex
  regional de Alola.
- O número nacional pertence à espécie; não confundir com a ordem do catálogo.

**Não inventar dados.** Nome, tipos, categoria, descrição e altura precisam ser
corretos. Em caso de dúvida sobre qualquer campo, deixar `NULL` e avisar.

Inserir em lotes pequenos, para que eu consiga conferir antes do próximo.

### Imagens

Usar apenas imagens de origem identificável e com uso compatível com um trabalho
acadêmico. Não referenciar arquivos que não existem. Enquanto não houver imagem
definitiva, manter a ilustração em CSS como alternativa.

---

## 9. Testes

O projeto tem testes unitários em `tests/`, rodados com `npm test`. Devem ser
preservados e ampliados conforme o código evoluir.

**Atenção:** os testes unitários não tocam no banco. Já aconteceu de todos
passarem com um erro real de banco no caminho — a coluna `senha_hash` era pequena
demais para o hash gerado, e isso só apareceu no primeiro cadastro de verdade.

Por isso: **não afirmar que algo funciona só porque o teste unitário passou.**
Diga o que foi verificado e o que ainda precisa ser testado no navegador com o
banco rodando.
