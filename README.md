# Projeto-Individual---Pedro-Gabriel
Repositório dedicado ao projeto individual do aluno Pedro Gabriel para a instituição de ensino São Paulo Tech School.

## Aplicação Pokémon

O site público em `public/` usa HTML, CSS e JavaScript sem framework. As telas chamam a API Express local em `/api`; não dependem de PokeAPI, Payload ou de uma API de imagens externa.

### Banco de dados

1. Configure `APP_HOST`, `APP_PORT`, `DB_HOST`, `DB_DATABASE=pokemon_trainer_hub`, `DB_USER`, `DB_PASSWORD` e `DB_PORT` no arquivo de ambiente usado por `app.js`. Se `AMBIENTE_PROCESSO` não estiver definido, o servidor usa o ambiente indicado no início de `app.js`.
2. Execute `src/database/script-tabelas-pokemon.sql`; ele cria o banco Pokémon e as tabelas necessárias, além de cadastrar quatro registros demonstrativos e perguntas.
3. Inicie o servidor com `npm start` e acesse a aplicação pelo endereço configurado em `APP_HOST` e `APP_PORT`.

O catálogo e o quiz iniciais são dados locais de demonstração e podem ser editados no script SQL. Como os arquivos do Figma não incluíam as imagens referenciadas pelo Payload, as telas usam ilustrações CSS locais; substitua-as por arquivos locais próprios quando estiverem disponíveis. A página `public/historia.html` contém campos de texto orientativos para a história pessoal, pois o material recebido não especificava lembranças biográficas.

O script cria um banco separado e não apaga bancos de dados existentes. Contas e dados de sistemas anteriores não são migrados automaticamente.

### API local

- `POST /api/treinadores/cadastrar` e `POST /api/treinadores/autenticar` criam a conta e iniciam uma sessão.
- `POST /api/treinadores/sair` encerra a sessão autenticada.
- `GET /api/quiz/perguntas` e `POST /api/quiz/tentativas` disponibilizam perguntas e registram resultados calculados no servidor.
- `GET /api/treinadores/visao-geral` e `GET /api/treinadores/pokedex` consultam progresso, histórico e coleção.
- `PATCH /api/treinadores/pokedex/:pokemonId/favorito` atualiza favoritos de Pokémon já desbloqueados.

As rotas autenticadas recebem o token de sessão no cabeçalho `Authorization: Bearer <token>`. Senhas são armazenadas com `scrypt`; o token é aleatório, tem validade de sete dias e somente seu hash é persistido.
