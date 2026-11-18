# AGENTS.md — Pokémon Trainer Hub

## 1. Sobre o projeto

O **Pokémon Trainer Hub** é um projeto individual desenvolvido para o curso de Análise e Desenvolvimento de Sistemas (ADS).

O objetivo é desenvolver uma aplicação web funcional inspirada no universo Pokémon, especialmente na região de **Alola**, pertencente à sétima geração da franquia.

A aplicação permitirá que usuários criem suas contas, respondam a quizzes sobre Pokémon, desbloqueiem registros na Pokédex, acompanhem seu progresso e visualizem estatísticas pessoais em um dashboard.

O projeto deve priorizar uma experiência intuitiva, uma identidade visual inspirada no ambiente tropical de Alola e uma estrutura de código organizada, funcional e de fácil manutenção.

## 2. Objetivos principais

O desenvolvimento deve contemplar:

- Criar uma aplicação web funcional, não apenas um protótipo visual.
- Implementar cadastro e autenticação de usuários.
- Desenvolver uma Pokédex regional com sistema de desbloqueio.
- Implementar quizzes interativos sobre Pokémon.
- Registrar pontuações, respostas e progresso dos usuários.
- Desenvolver um dashboard com informações individuais.
- Armazenar os dados em um banco de dados MySQL.
- Integrar o front-end à API desenvolvida em Node.js e Express.
- Manter o código organizado, documentado e preparado para futuras melhorias.

## 3. Tecnologias

As tecnologias principais previstas para o projeto são:

### Front-end

- **HTML5:** estruturação das páginas e componentes.
- **CSS3:** estilização, identidade visual, responsividade e animações.
- **JavaScript:** interatividade, validações, manipulação do DOM e comunicação com a API.

Não introduzir frameworks ou bibliotecas adicionais sem necessidade e sem autorização.

### Back-end

- **Node.js:** ambiente responsável pela execução do JavaScript no servidor.
- **Express.js:** estruturação das rotas e disponibilização dos endpoints da API.

O back-end deve receber as requisições do front-end, processar as regras de negócio, consultar ou atualizar o banco de dados e retornar respostas adequadas.

### Banco de dados

- **MySQL:** armazenamento persistente das informações da aplicação.

O banco deverá armazenar informações como usuários, Pokémon desbloqueados, favoritos, quizzes, perguntas, respostas e histórico de pontuações.

### Ferramentas de desenvolvimento

- **Visual Studio Code:** editor de código.
- **OpenCode:** agente de IA utilizado como apoio na análise, implementação, revisão e manutenção do código.
- **Git e GitHub:** controle de versão e armazenamento do código-fonte, quando configurados.

## 4. Identidade visual

A interface deve ser inspirada na região de Alola, transmitindo uma sensação tropical, leve e descontraída.

A identidade visual deve considerar:

- Elementos visuais inspirados no universo Pokémon.
- Referências à natureza, ao oceano e às ilhas de Alola.
- Componentes com cantos arredondados e boa hierarquia visual.
- Ícones e ilustrações relacionados à franquia.
- Tipografia legível e consistente.
- Animações discretas para melhorar a experiência do usuário.

### Paleta de cores de referência

- Verde escuro: `#153F3D`
- Verde oceânico: `#2E746A`
- Verde claro: `#EAF5EE`
- Amarelo tropical: `#F9CF4B`
- Coral: `#F36B50`
- Creme: utilizar tons claros próximos ao branco para fundos e áreas de conteúdo.

As cores podem ser ajustadas durante o desenvolvimento, desde que a identidade visual permaneça consistente.

## 5. Estrutura e funcionalidades

A aplicação deverá possuir as seguintes áreas principais:

### 5.1. Página inicial

- Apresentar o Pokémon Trainer Hub.
- Explicar brevemente a proposta da aplicação.
- Apresentar elementos visuais relacionados ao universo Pokémon.
- Disponibilizar acesso ao cadastro e ao login.
- Apresentar uma seção de introdução e uma seção sobre a proposta do projeto.

### 5.2. Cadastro de usuários

O formulário deverá contemplar:

- Nome do treinador.
- Nome de usuário.
- E-mail.
- Senha.
- Confirmação de senha.

Regras:

- Validar os campos obrigatórios.
- Verificar se as senhas coincidem.
- Verificar a existência de e-mails e nomes de usuário duplicados.
- Enviar os dados para a API.
- Exibir mensagens claras de sucesso e erro.
- Não armazenar senhas em texto puro.

### 5.3. Login

O sistema deverá permitir autenticação utilizando e-mail ou nome de usuário e senha.

Regras:

- Validar os campos.
- Enviar as credenciais à API.
- Tratar erros de autenticação.
- Manter o estado de autenticação de maneira segura.
- Redirecionar o usuário após o login bem-sucedido.
- Disponibilizar a funcionalidade de encerramento da sessão.

### 5.4. Dashboard

O dashboard deverá apresentar informações relacionadas ao progresso individual do treinador.

Indicadores previstos:

- Quantidade de Pokémon desbloqueados.
- Progresso geral da Pokédex.
- Quantidade de Pokémon favoritos.
- Quizzes realizados.
- Taxa de acertos.
- Melhor pontuação.
- Atividades e desbloqueios recentes.

Também poderão existir atalhos para a Pokédex, os quizzes e o perfil.

Os indicadores devem utilizar dados reais do usuário autenticado, sempre que as funcionalidades correspondentes estiverem implementadas.

### 5.5. Pokédex de Alola

A Pokédex será uma das funcionalidades centrais da aplicação.

Características:

- Apresentar os registros dos Pokémon da região de Alola.
- Exibir número regional, imagem e nome dos Pokémon descobertos.
- Apresentar os Pokémon ainda não descobertos como silhuetas.
- Disponibilizar pesquisa por nome ou número.
- Permitir filtros por status de descoberta e tipo.
- Permitir favoritar Pokémon já descobertos.
- Apresentar detalhes dos registros desbloqueados.
- Exibir o progresso de conclusão da Pokédex.

Regra fundamental de desbloqueio:

**Um Pokémon deve ser desbloqueado automaticamente quando o usuário acertar uma pergunta relacionada a ele no quiz.**

Não implementar desbloqueio manual ou botão de captura.

Se o Pokémon já estiver desbloqueado, não criar registros duplicados.

### 5.6. Sistema de quizzes

O sistema deverá apresentar perguntas relacionadas ao universo Pokémon.

Tipos de perguntas previstos:

- Identificação de Pokémon por silhueta.
- Identificação de Pokémon por imagem.
- Perguntas de curiosidades e características.
- Perguntas sobre habilidades, tipos e informações gerais.

Características:

- Apresentar uma pergunta por vez.
- Disponibilizar quatro alternativas de resposta.
- Exibir o progresso do quiz.
- Informar se a resposta está correta ou incorreta.
- Apresentar feedback ao usuário.
- Permitir avançar para a próxima pergunta.
- Apresentar o resultado ao final da sessão.

O sistema deverá registrar:

- Usuário participante.
- Pontuação obtida.
- Quantidade de respostas corretas.
- Quantidade de respostas incorretas.
- Data e horário da realização.
- Pokémon relacionado à pergunta, quando aplicável.

Uma resposta correta deverá desbloquear automaticamente o Pokémon relacionado à pergunta.

### 5.7. Perfil do treinador

O perfil deverá apresentar:

- Informações básicas da conta.
- Quantidade de Pokémon desbloqueados.
- Progresso da Pokédex.
- Pokémon favoritos.
- Histórico de quizzes.
- Melhor pontuação.
- Opção para encerrar a sessão.

As informações devem corresponder ao usuário autenticado.

## 6. Regras de arquitetura e organização

O código deverá ser organizado de maneira lógica, respeitando a separação entre responsabilidades.

### Front-end

Separar, sempre que possível:

- Estrutura HTML.
- Estilos CSS.
- Scripts JavaScript.
- Recursos estáticos, como imagens, ícones e fontes.

Evitar concentrar toda a lógica da aplicação em um único arquivo.

### Back-end

Respeitar a estrutura existente da API disponibilizada pela faculdade.

Sempre que aplicável, manter a separação entre:

- Rotas: definição dos endpoints.
- Controllers: recebimento e tratamento das requisições.
- Models: operações relacionadas aos dados.
- Configurações: conexão com o banco de dados e variáveis de ambiente.

Não reorganizar a arquitetura existente sem antes analisar suas dependências e justificar a necessidade da alteração.

## 7. Banco de dados

O banco de dados deverá utilizar MySQL.

A modelagem deverá contemplar, conforme a necessidade:

- Usuários.
- Pokémon.
- Pokémon desbloqueados por usuário.
- Pokémon favoritos.
- Quizzes.
- Perguntas.
- Alternativas de resposta.
- Histórico de tentativas.
- Respostas dos usuários.

Regras:

- Utilizar chaves primárias e estrangeiras adequadamente.
- Evitar duplicidade de registros.
- Definir relacionamentos coerentes.
- Utilizar consultas parametrizadas.
- Respeitar a integridade referencial.
- Manter a estrutura do banco consistente com os models e controllers da API.

Antes de criar ou alterar tabelas, verificar a estrutura atual do banco e os scripts existentes.

Não executar alterações destrutivas no banco sem autorização explícita.

## 8. Segurança e validação

A segurança deve ser considerada durante todo o desenvolvimento.

Regras obrigatórias:

- Nunca armazenar senhas em texto puro.
- Utilizar hash seguro para armazenamento de senhas.
- Nunca inserir credenciais diretamente no código-fonte.
- Utilizar variáveis de ambiente para informações sensíveis.
- Não compartilhar arquivos `.env` em repositórios públicos.
- Utilizar consultas SQL parametrizadas.
- Validar os dados recebidos tanto no front-end quanto no back-end.
- Tratar erros sem expor informações internas ou credenciais.
- Verificar a autenticação e autorização nas rotas protegidas.
- Evitar confiar exclusivamente nas validações realizadas pelo navegador.

## 9. Responsividade e experiência do usuário

A aplicação deverá funcionar adequadamente em:

- Computadores.
- Tablets.
- Smartphones.

Regras de interface:

- Manter uma navegação intuitiva.
- Garantir boa legibilidade.
- Evitar elementos sobrepostos.
- Utilizar espaçamentos consistentes.
- Apresentar feedback visual para ações do usuário.
- Criar estados de carregamento, sucesso e erro quando necessário.
- Manter consistência entre as páginas.

## 10. Diretrizes obrigatórias para o OpenCode

Ao trabalhar neste projeto, siga rigorosamente as orientações abaixo.

### 10.1. Antes de modificar qualquer arquivo

1. Analise a estrutura atual do projeto.
2. Identifique as tecnologias e dependências utilizadas.
3. Leia os arquivos relacionados à tarefa solicitada.
4. Verifique como a funcionalidade atual está implementada.
5. Identifique possíveis impactos em outras partes do sistema.
6. Apresente um breve plano de execução quando a tarefa envolver alterações relevantes.

Não presumir que a estrutura do projeto corresponde a uma arquitetura genérica. A estrutura real dos arquivos deve ser sempre a referência principal.

### 10.2. Durante o desenvolvimento

- Priorizar soluções simples, claras e funcionais.
- Respeitar os padrões já utilizados no projeto.
- Reutilizar componentes, funções e estilos existentes.
- Evitar duplicação desnecessária de código.
- Utilizar nomes de variáveis, funções e arquivos descritivos.
- Manter o código organizado e legível.
- Comentar apenas trechos que realmente necessitem de explicação.
- Não adicionar dependências sem necessidade.
- Não criar funcionalidades fictícias apenas para preencher a interface.
- Não substituir integrações reais por dados simulados sem deixar isso explícito.

### 10.3. Proteção dos arquivos existentes

- Não excluir arquivos sem autorização.
- Não sobrescrever implementações funcionais sem necessidade.
- Não modificar arquivos de configuração de maneira desnecessária.
- Não alterar credenciais, tokens ou informações sensíveis.
- Não executar comandos destrutivos sem autorização.
- Não modificar funcionalidades fora do escopo solicitado.

Se uma alteração exigir uma mudança estrutural importante, explicar o motivo antes de executá-la.

### 10.4. Integração com a API

Antes de implementar uma integração:

1. Verificar os endpoints existentes.
2. Identificar os métodos HTTP utilizados.
3. Conferir os parâmetros esperados.
4. Verificar os formatos das respostas.
5. Identificar os códigos de status retornados.
6. Respeitar a estrutura de autenticação existente.

Não inventar endpoints, tabelas ou campos sem verificar se são compatíveis com a implementação atual.

Se uma rota necessária ainda não existir, informar isso e propor sua implementação.

### 10.5. Testes e validação

Após implementar uma funcionalidade:

- Verificar possíveis erros de sintaxe.
- Executar os testes existentes, quando disponíveis.
- Verificar se as funcionalidades relacionadas continuam funcionando.
- Testar os principais cenários de sucesso e erro.
- Verificar a comunicação entre front-end, API e banco de dados quando aplicável.

Não afirmar que uma funcionalidade foi testada se os testes não foram realmente executados.

### 10.6. Comunicação durante as tarefas

Ao finalizar uma tarefa, apresentar:

1. O que foi alterado.
2. Quais arquivos foram modificados ou criados.
3. Como a implementação funciona.
4. Quais testes foram executados.
5. Quais problemas ainda existem.
6. Se existe alguma ação que precisa ser realizada manualmente.

Explicar as alterações de maneira didática, considerando que o projeto também possui finalidade acadêmica e de aprendizagem.

## 11. Organização das tarefas

O desenvolvimento deverá ser realizado de maneira incremental.

Priorizar a seguinte sequência:

1. Análise e organização dos arquivos existentes.
2. Configuração do ambiente de desenvolvimento.
3. Modelagem e configuração do banco de dados.
4. Análise e adaptação da API.
5. Implementação do cadastro e login.
6. Desenvolvimento das páginas principais.
7. Implementação da Pokédex.
8. Implementação do sistema de quizzes.
9. Integração do dashboard e do perfil.
10. Testes de integração e correções.
11. Documentação e preparação da entrega.

Não implementar todas as funcionalidades simultaneamente.

Priorizar uma tarefa por vez, garantindo que cada etapa esteja compreendida e validada antes de avançar.

## 12. Regras finais

O objetivo do OpenCode é atuar como um assistente de desenvolvimento, ajudando a construir o Pokémon Trainer Hub de maneira organizada, segura e funcional.

O agente deve:

- Respeitar

## 13. Decisões arquiteturais confirmadas

As decisões abaixo são requisitos obrigatórios do Pokémon Trainer Hub e devem ser respeitadas durante todo o desenvolvimento.

### 13.1. API Aquatech

- A API Aquatech fornecida pela faculdade deve ser preservada.
- O Pokémon Trainer Hub será desenvolvido como uma extensão da API original.
- As funcionalidades Pokémon deverão ser adicionadas à arquitetura existente.
- Os módulos originais da Aquatech não devem ser removidos, substituídos ou descaracterizados.
- A organização existente de routes, controllers, models e configurações deve ser respeitada.
- A autenticação original deve ser analisada antes de qualquer implementação de um sistema alternativo.
- Novas tabelas e relacionamentos devem ser adicionados sem comprometer a integridade das estruturas existentes.
- Não duplicar funcionalidades de autenticação ou gerenciamento de usuários sem justificativa técnica.
- Caso existam incompatibilidades entre o cadastro original e o cadastro de treinadores, apresentar alternativas antes de implementar alterações.

### 13.2. Catálogo de Pokémon

O catálogo do Pokémon Trainer Hub deve contemplar exclusivamente:

1. Espécies de Pokémon introduzidas originalmente na sétima geração.
2. Formas regionais de Alola pertencentes a espécies introduzidas em gerações anteriores.

Não incluir Pokémon de outras gerações em suas formas originais apenas porque aparecem na Pokédex Regional de Alola.

Exemplos de espécies da sétima geração:
- Rowlet.
- Litten.
- Popplio.
- Rockruff.
- Mimikyu.

Exemplos de formas regionais permitidas:
- Vulpix de Alola.
- Sandshrew de Alola.
- Raichu de Alola.
- Marowak de Alola.
- Meowth de Alola.

As formas regionais de Alola devem ser tratadas como entradas próprias no catálogo, com identificação clara de sua espécie de origem.

### 13.3. Critérios de organização do catálogo

- Não utilizar os 302 registros da Pokédex Regional de Sun/Moon como catálogo integral do projeto.
- Não utilizar a Pokédex expandida de Ultra Sun/Ultra Moon como referência de escopo.
- Não cadastrar formas originais de espécies antigas que não pertencem ao escopo definido.
- Diferenciar espécie introduzida na geração VII de forma regional de Alola.
- Preservar nomes oficiais, tipos e características correspondentes.
- Não inventar registros, imagens ou informações.
- Não misturar numeração regional e numeração nacional.
- Manter os dados do catálogo separados dos dados de coleção de cada treinador.
- Verificar a procedência e a consistência dos dados antes de inserir registros no MySQL.

### 13.4. Pokédex e desbloqueios

- Todos os registros válidos do catálogo devem estar disponíveis na Pokédex.
- Pokémon não descobertos devem aparecer como silhuetas.
- Informações restritas de Pokémon não descobertos não devem ser disponibilizadas indevidamente ao front-end.
- O desbloqueio deve acontecer automaticamente após uma resposta correta no quiz relacionada ao Pokémon.
- Não implementar captura ou desbloqueio manual.
- Não permitir registros duplicados na coleção de um treinador.
- Favoritos devem ser permitidos somente para Pokémon descobertos.

### 13.5. Diretrizes de implementação

Antes de modificar a arquitetura, o agente deverá analisar a API Aquatech original e apresentar um plano de integração.

Antes de popular ou alterar o catálogo, deverá validar os registros de acordo com os critérios desta seção.

Nenhuma funcionalidade original deve ser removida apenas para simplificar a implementação Pokémon.

Alterações estruturais importantes exigem justificativa e autorização do desenvolvedor.

### 13.6. Regra principal

O projeto deve preservar a base técnica fornecida pela faculdade, acrescentando as funcionalidades Pokémon sem comprometer a estrutura original.

O agente deve analisar antes de modificar, explicar antes de realizar alterações importantes e validar antes de considerar uma tarefa concluída.