# AGENTS.md — Pokémon Trainer Hub

## 1. Direção e objetivo do projeto

O Pokémon Trainer Hub é um projeto individual de desenvolvimento web, inspirado no universo Pokémon, com foco especial na região de Alola e na Geração VII.

O objetivo é desenvolver uma aplicação web funcional na qual os usuários possam criar suas contas como treinadores, acessar uma Pokédex, responder a quizzes, desbloquear Pokémon e acompanhar seu progresso.

### Tecnologias utilizadas

- **Frontend:** HTML5, CSS3 e JavaScript.
- **Backend:** Node.js e Express.
- **Banco de dados:** MySQL.
- **Comunicação:** API REST desenvolvida com Express.

A aplicação deve manter uma arquitetura simples, organizada e compatível com o nível e os objetivos acadêmicos do projeto.

Não introduzir frameworks ou tecnologias adicionais, como React, Next.js ou similares, sem autorização prévia.

O desenvolvimento deve priorizar a manutenção e a evolução do código existente, evitando reescritas desnecessárias.

---

## 2. Aquatech como referência exclusivamente técnica

O projeto Aquatech foi fornecido como referência acadêmica para auxiliar na organização e implementação da estrutura técnica do Pokémon Trainer Hub.

Entretanto, o Aquatech não faz parte do produto final e não deve ser incorporado funcionalmente ao Pokémon Trainer Hub.

Sua utilização deve ser limitada à consulta de padrões técnicos e boas práticas, como:

- Inicialização e configuração do Express.
- Organização de rotas, controllers e models.
- Configuração e conexão com o MySQL.
- Utilização de variáveis de ambiente com dotenv.
- Implementação de middlewares.
- Organização das consultas SQL.
- Utilização de consultas parametrizadas.
- Validação de dados recebidos pela API.
- Tratamento de erros.
- Organização e separação de responsabilidades.

O código existente do Pokémon Trainer Hub deve ser priorizado sempre que já apresentar uma solução adequada.

O Aquatech deve ser consultado apenas quando houver necessidade de compreender ou comparar algum padrão técnico.

---

## 3. Funcionalidades do Aquatech que não devem ser incorporadas

Não incorporar funcionalidades, regras de negócio, tabelas ou módulos específicos do Aquatech.

Os seguintes elementos não fazem parte do Pokémon Trainer Hub:

- Cadastro de empresas.
- Cadastro de usuários do Aquatech.
- Cadastro e gerenciamento de aquários.
- Monitoramento de aquários.
- Registro de medidas.
- Registro de avisos.
- Códigos de ativação.
- Funcionalidades relacionadas ao monitoramento de sensores.
- Regras de negócio específicas da plataforma Aquatech.

Não criar, importar ou manter módulos relacionados a essas funcionalidades.

Também não utilizar nomes de endpoints, tabelas ou entidades do Aquatech como parte da API do Pokémon Trainer Hub.

A aplicação deve possuir sua própria estrutura de dados, autenticação, regras de negócio e identidade.

---

## 4. Banco de dados próprio: pokemon_trainer_hub

O Pokémon Trainer Hub deve utilizar seu próprio banco de dados MySQL, denominado:

`pokemon_trainer_hub`

A configuração da conexão deve utilizar variáveis de ambiente, mantendo as credenciais fora do código-fonte.

A variável `DB_DATABASE` deve apontar para o banco de dados próprio do projeto.

Não utilizar tabelas ou estruturas do banco de dados do Aquatech.

O banco deve armazenar informações relacionadas exclusivamente às funcionalidades do Pokémon Trainer Hub.

### Entidades previstas

A estrutura deve considerar as seguintes entidades:

- `pokemon_treinador`: informações dos treinadores cadastrados.
- `pokemon_sessao`: sessões de autenticação dos treinadores.
- `pokemon_especie`: informações das espécies de Pokémon.
- `pokemon_catalogo`: registros das entradas disponíveis na Pokédex, incluindo formas regionais.
- `pokemon_pergunta`: perguntas utilizadas nos quizzes.
- `pokemon_alternativa`: alternativas das perguntas, caso a separação seja necessária.
- `pokemon_tentativa`: histórico das tentativas realizadas pelos treinadores.
- `pokemon_resposta`: respostas individuais dos treinadores, quando necessário.
- `pokemon_colecao`: Pokémon desbloqueados e informações relacionadas aos favoritos.

A estrutura definitiva deve ser definida após a análise do banco existente, evitando tabelas redundantes ou informações duplicadas.

Não criar novas tabelas sem antes verificar se a estrutura atual já atende à necessidade.

---

## 5. Autenticação e gerenciamento de treinadores

O sistema deve possuir autenticação própria para os treinadores do Pokémon Trainer Hub.

As funcionalidades previstas são:

- Cadastro de treinadores.
- Login utilizando e-mail ou nome de usuário.
- Verificação de credenciais.
- Gerenciamento de sessões.
- Logout.
- Proteção de rotas privadas.

### Regras de segurança

- Nunca armazenar senhas em texto puro.
- Utilizar hash seguro para armazenamento de senhas.
- Verificar duplicidade de e-mail e nome de usuário.
- Validar os dados recebidos durante cadastro e login.
- Utilizar tokens de sessão seguros.
- Armazenar no banco somente o hash do token de sessão.
- Implementar expiração das sessões.
- Invalidar a sessão durante o logout.
- Garantir que cada treinador tenha acesso somente aos próprios dados.

O projeto já possui uma implementação de autenticação utilizando `scrypt`, tokens de sessão e middleware Bearer.

Antes de alterar essa implementação, analisar seu funcionamento completo e preservar as partes que já estiverem corretas.

Não modificar a estratégia de armazenamento de tokens no frontend sem avaliar previamente os impactos na arquitetura e na segurança.

---

## 6. Estrutura da API e organização do código

O projeto deve manter uma única aplicação Express, responsável por disponibilizar o frontend e a API.

Os endpoints da API devem utilizar o prefixo:

`/api`

A organização deve respeitar a separação de responsabilidades entre:

- Routes: definição dos endpoints.
- Controllers: tratamento das requisições e respostas.
- Models: comunicação com o banco de dados.
- Middlewares: autenticação, validações e outras responsabilidades compartilhadas.
- Database: configuração e conexão com o MySQL.

### Endpoints existentes

Os seguintes endpoints fazem parte do contrato atual da aplicação e devem ser preservados sempre que possível:

- `POST /api/treinadores/cadastrar`
- `POST /api/treinadores/autenticar`
- `POST /api/treinadores/sair`
- `GET /api/treinadores/visao-geral`
- `GET /api/treinadores/pokedex`
- `PATCH /api/treinadores/pokedex/:pokemonId/favorito`
- `GET /api/pokemon`
- `GET /api/quiz/perguntas`
- `POST /api/quiz/tentativas`

Antes de modificar qualquer endpoint:

1. Verificar sua implementação atual.
2. Identificar quais páginas e scripts do frontend utilizam esse endpoint.
3. Avaliar se a alteração é realmente necessária.
4. Atualizar os consumidores afetados, caso seja necessário.
5. Documentar mudanças no contrato da API.

Não criar endpoints duplicados ou desnecessários.

Não criar rotas relacionadas ao Aquatech.

---

## 7. Catálogo de Pokémon

A Pokédex do Pokémon Trainer Hub deve possuir um catálogo específico, limitado ao escopo definido para o projeto.

### Escopo confirmado

O catálogo deve conter:

**1. Pokémon introduzidos na Geração VII**

- National Pokédex #722 até #809.
- Total esperado: 88 espécies.

**2. Formas regionais de Alola de Pokémon de gerações anteriores**

- Total esperado: 18 formas regionais.

**Total esperado: 106 entradas no catálogo.**

### Regras importantes

- Não utilizar a Pokédex regional completa de Sun/Moon ou Ultra Sun/Ultra Moon.
- Não incluir espécies originais de gerações anteriores apenas porque aparecem na Pokédex regional de Alola.
- As formas de Alola devem ser entradas separadas no catálogo.
- Cada forma regional deve possuir relacionamento com sua espécie original.
- Não duplicar uma espécie sem justificativa relacionada à forma regional.
- O número nacional da Pokédex pertence à espécie, não deve ser confundido com uma numeração própria do catálogo.
- Caso o projeto utilize uma ordem própria, identificá-la claramente como ordem do catálogo do Hub.

Antes de inserir os dados definitivos, validar a lista completa das 106 entradas.

Não inventar nomes, tipos, descrições, imagens ou características.

### Imagens

As imagens utilizadas devem possuir origem identificável e condições de uso compatíveis com o projeto.

Não inventar caminhos de arquivos ou referências para imagens inexistentes.

Priorizar arquivos locais organizados e documentados.

Caso ainda não existam imagens definitivas, manter uma solução visual provisória sem comprometer o funcionamento do sistema.

---

## 8. Regras da Pokédex e desbloqueios

A Pokédex deve representar o progresso individual de cada treinador.

Cada treinador deve possuir sua própria coleção de Pokémon desbloqueados.

### Regras de desbloqueio

- Pokémon podem ser desbloqueados por meio dos quizzes.
- Uma resposta correta pode desbloquear o Pokémon associado à pergunta.
- Uma resposta incorreta não deve desbloquear o Pokémon.
- Um Pokémon já desbloqueado não deve ser duplicado na coleção.
- O desbloqueio deve estar associado ao treinador autenticado.
- O sistema deve permitir favoritar e desfavoritar Pokémon desbloqueados.

### Privacidade dos Pokémon bloqueados

Informações de Pokémon bloqueados não devem ser disponibilizadas indevidamente ao frontend.

O backend deve controlar quais informações podem ser retornadas para cada treinador.

Não basta esconder visualmente o nome de um Pokémon utilizando CSS ou JavaScript.

A API não deve enviar ao frontend informações que revelem a identidade de Pokémon ainda bloqueados, incluindo:

- Nome.
- Tipos.
- Descrição.
- Categoria.
- Identificadores ou slugs reveladores.
- Caminhos de imagens identificáveis.
- Chaves de silhueta que permitam descobrir sua identidade.

A apresentação visual de um Pokémon bloqueado deve utilizar apenas informações estritamente necessárias para exibir sua silhueta ou estado bloqueado.

As regras de acesso devem ser aplicadas no backend, não somente na interface.

---

## 9. Segurança e persistência de dados

A segurança deve ser considerada em todas as etapas de desenvolvimento.

### Banco de dados

- Utilizar consultas parametrizadas.
- Evitar concatenação de valores fornecidos pelo usuário em consultas SQL.
- Utilizar transações quando uma operação envolver múltiplas alterações relacionadas.
- Garantir integridade dos relacionamentos.
- Evitar duplicidade de registros.
- Não expor credenciais do banco de dados.

### Autenticação

- Proteger rotas privadas por meio de middleware.
- Validar o token recebido nas requisições.
- Verificar expiração e revogação das sessões.
- Garantir isolamento dos dados entre treinadores.

### Backend

- Utilizar validações consistentes.
- Implementar limites adequados para o tamanho das requisições.
- Avaliar mecanismos de proteção contra tentativas excessivas de login.
- Padronizar respostas de erro.
- Evitar exposição de informações internas ou sensíveis.

### Transações

Operações relacionadas ao envio de respostas de quizzes, registro de tentativas e desbloqueio de Pokémon devem manter consistência.

Quando uma resposta correta resultar em um desbloqueio, as operações relacionadas devem ser realizadas em uma transação, evitando situações em que apenas parte dos dados seja persistida.

### Persistência

Informações importantes não devem existir somente no armazenamento local do navegador.

O progresso, os desbloqueios, os favoritos e o histórico de quizzes devem ser persistidos no MySQL.

---

## 10. Fluxo de trabalho e orientações para o OpenCode

O desenvolvimento deve ocorrer por etapas independentes e controladas.

Não executar todas as etapas de uma só vez.

Antes de qualquer alteração:

1. Ler este arquivo `AGENTS.md`.
2. Analisar a estrutura atual do projeto.
3. Identificar os arquivos envolvidos.
4. Verificar o estado do Git.
5. Identificar alterações existentes que precisam ser preservadas.
6. Apresentar um plano de execução compatível com o escopo solicitado.

### Regras obrigatórias

- Não reescrever arquivos inteiros sem necessidade.
- Não remover funcionalidades existentes sem autorização.
- Não sobrescrever alterações anteriores do usuário.
- Não modificar arquivos fora do escopo autorizado.
- Não instalar dependências sem justificativa e autorização.
- Não executar comandos SQL destrutivos sem autorização explícita.
- Não alterar o banco de dados real sem autorização.
- Não realizar commits automaticamente.
- Não alterar o conteúdo da pasta `Aquatech/`.
- Não incorporar funcionalidades de negócio do Aquatech.

### Execução por etapas

Cada etapa deve possuir:

- Objetivo definido.
- Escopo de arquivos autorizado.
- Análise prévia.
- Plano de implementação.
- Alterações realizadas.
- Testes executados.
- Resultado dos testes.
- Problemas encontrados.
- Pendências identificadas.

Ao concluir uma etapa, apresentar um relatório claro e aguardar autorização antes de iniciar a próxima.

Se uma alteração necessária ultrapassar o escopo autorizado, interromper a execução e solicitar aprovação.

---

## 11. Dados, scripts SQL e migrações

Antes de modificar a estrutura do banco de dados, analisar os scripts SQL existentes e verificar o estado real do banco, quando houver autorização para acessá-lo.

O projeto possui um script inicial de criação das tabelas Pokémon.

Não presumir que executar novamente um script com `CREATE TABLE IF NOT EXISTS` atualizará tabelas já existentes.

### Regras para alterações no banco

- Identificar a estrutura atual antes de propor mudanças.
- Preservar os dados existentes.
- Evitar operações destrutivas.
- Não remover tabelas ou colunas sem justificativa e autorização.
- Criar scripts de migração quando houver mudanças estruturais.
- Documentar a finalidade de cada migração.
- Garantir compatibilidade entre o banco e os models.
- Validar relacionamentos e restrições de integridade.

### Catálogo e dados iniciais

A inserção definitiva dos 106 registros deve ocorrer somente após a validação da lista completa.

Não substituir dados existentes sem analisar previamente seus impactos.

Dados de demonstração devem ser identificados como provisórios e não devem ser tratados como catálogo definitivo.

---

## 12. Critérios de qualidade e testes

Toda alteração deve ser validada por testes compatíveis com o escopo modificado.

### Testes existentes

O projeto já possui testes unitários relacionados a funcionalidades como:

- Cadastro e hash de senha.
- Funcionamento do quiz.
- Validação de respostas.
- Favoritos.

Os testes existentes devem ser preservados e ampliados conforme necessário.

### Cobertura desejada

A evolução do projeto deve considerar:

**Autenticação**
- Cadastro válido.
- Cadastro com e-mail duplicado.
- Login válido.
- Login inválido.
- Sessão expirada.
- Logout.
- Acesso sem autenticação.

**Pokédex**
- Consulta da coleção.
- Separação entre Pokémon desbloqueados e bloqueados.
- Favoritar e desfavoritar.
- Isolamento de dados entre treinadores.
- Proteção de informações de Pokémon bloqueados.

**Quiz**
- Carregamento das perguntas.
- Validação das alternativas.
- Cálculo correto da pontuação.
- Registro das tentativas.
- Desbloqueio de Pokémon.
- Prevenção de duplicidade de desbloqueios.

**Banco de dados e API**
- Persistência real dos dados.
- Funcionamento dos relacionamentos.
- Validação das transações.
- Tratamento de erros.
- Testes de integração entre API e MySQL.

Os testes unitários existentes não devem ser considerados prova suficiente de que toda a aplicação está funcionando.

Quando possível, adicionar testes de integração e testes de interface.

Não afirmar que uma funcionalidade foi validada se apenas seus testes unitários isolados foram executados.

---

## 13. Decisão definitiva sobre o Aquatech

Esta decisão é definitiva e deve ser respeitada durante todo o desenvolvimento.

O Aquatech é exclusivamente uma referência técnica e acadêmica.

O Pokémon Trainer Hub é um projeto independente, com identidade visual, funcionalidades, API, autenticação e banco de dados próprios.

### O que pode ser aproveitado do Aquatech

- Organização técnica.
- Padrões de desenvolvimento.
- Estrutura de pastas como referência.
- Configurações e boas práticas de conexão.
- Padrões de rotas, controllers e models.
- Exemplos de validação e tratamento de erros.

### O que não pode ser aproveitado como funcionalidade

- Módulos de negócio.
- Tabelas específicas.
- Entidades do domínio Aquatech.
- Endpoints do Aquatech.
- Regras de negócio de monitoramento.
- Funcionalidades de empresas, aquários, sensores, medidas e avisos.

A pasta `Aquatech/` deve permanecer intacta e ser utilizada somente para consulta.

O projeto ativo deve continuar sendo o Pokémon Trainer Hub, com seu próprio servidor Express, sua própria API sob `/api` e seu próprio banco `pokemon_trainer_hub`.

**Em caso de conflito entre alguma orientação antiga, implementação anterior ou proposta de integração com o Aquatech e as regras deste documento, prevalecem as decisões estabelecidas neste arquivo.**