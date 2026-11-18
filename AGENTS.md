# Diretrizes arquiteturais definitivas — Pokémon Trainer Hub

## 1. Direção geral do projeto

O Pokémon Trainer Hub é uma aplicação independente, cujo domínio funcional é exclusivamente o universo Pokémon.

A API Aquatech fornecida como base acadêmica deve ser utilizada somente como referência técnica e estrutural. Seu objetivo é servir de modelo para a organização e implementação da API, não manter suas funcionalidades de negócio.

A aplicação ativa deve utilizar:
- Node.js;
- Express;
- MySQL;
- HTML5;
- CSS3;
- JavaScript.

A estrutura deve priorizar organização, separação de responsabilidades, segurança, legibilidade e facilidade de manutenção.

## 2. Uso da Aquatech como referência técnica

Podem ser aproveitados e adaptados:
- Organização da API em rotas, controllers e models.
- Inicialização e configuração do servidor Express.
- Uso de middlewares.
- Configuração da conexão MySQL.
- Uso de variáveis de ambiente.
- Separação entre requisições HTTP, regras de negócio e persistência.
- Consultas SQL parametrizadas.
- Tratamento padronizado de erros e validações.

A cópia original localizada em `Aquatech/` deve permanecer intacta e servir somente como material de consulta.

Não copiar automaticamente módulos de negócio da Aquatech. Reaproveitar apenas soluções técnicas que façam sentido para o domínio Pokémon.

## 3. Funcionalidades que não pertencem ao projeto

A aplicação ativa não deve implementar ou preservar funcionalidades específicas da Aquatech, incluindo:
- Empresas.
- Cadastro empresarial.
- Códigos de ativação empresarial.
- Aquários.
- Medidas de aquários.
- Avisos relacionados a aquários.
- Monitoramento de aquários.
- Rotas, controllers, models ou tabelas dedicados a essas funcionalidades.

Não criar endpoints como `/aquarios`, `/empresas`, `/medidas` ou `/avisos` na API Pokémon.

Não incorporar as tabelas `empresa`, `usuario`, `aviso`, `aquario` e `medida` ao banco do Pokémon Trainer Hub apenas para manter compatibilidade com a Aquatech.

## 4. Banco de dados

O banco de dados ativo deve ser `pokemon_trainer_hub`.

Não utilizar o banco `aquatech` como banco principal e não combinar os dois schemas.

A estrutura deve contemplar as necessidades do Pokémon Trainer Hub, incluindo:
- Contas e perfis de treinadores.
- Sessões de autenticação.
- Espécies Pokémon.
- Entradas do catálogo e formas regionais.
- Perguntas e alternativas dos quizzes.
- Tentativas e respostas individuais.
- Coleção e desbloqueios.
- Pokémon favoritos.

A estrutura atual do banco deve ser analisada antes de qualquer alteração. Não executar comandos destrutivos, apagar tabelas ou substituir dados sem autorização explícita.

Toda alteração estrutural deve ser documentada em migrações versionadas e testada em banco de desenvolvimento.

## 5. Cadastro e autenticação

A aplicação deve possuir autenticação própria para treinadores, independente da Aquatech.

A tabela `pokemon_treinador` deve ser a referência para as contas do projeto, mantendo os dados necessários ao cadastro e perfil.

Regras:
- Nunca armazenar senhas em texto puro.
- Utilizar hash seguro de senha.
- Preferir operações assíncronas para geração e verificação de hash.
- Armazenar somente o hash dos tokens de sessão.
- Validar expiração e revogação de sessões.
- Normalizar e validar e-mails e nomes de usuário no servidor.
- Garantir unicidade dos campos que identificam uma conta.
- Proteger rotas privadas com middleware de autenticação.
- Utilizar a identidade do treinador autenticado nas consultas, sem confiar em IDs de usuário enviados pelo cliente.

O fluxo atual de autenticação do Hub deve ser auditado e corrigido antes de ser substituído.

## 6. Organização da API

Manter um único servidor Express e um único prefixo `/api` para as funcionalidades do Pokémon Trainer Hub.

A organização pode evoluir a partir da estrutura existente:

- `src/routes/`: definição dos endpoints.
- `src/controllers/`: recebimento e tratamento das requisições.
- `src/models/`: acesso e persistência dos dados.
- `src/middleware/`: autenticação e validações compartilhadas.
- `src/database/`: conexão, scripts e migrações.

Os módulos existentes devem ser analisados antes de criar novos arquivos ou reorganizar responsabilidades.

Não criar endpoints novos sem verificar primeiro as páginas, scripts e funcionalidades que irão consumi-los.

Preservar os contratos atuais da API sempre que possível. Mudanças necessárias devem ser documentadas e acompanhadas dos ajustes correspondentes no front-end.

## 7. Catálogo Pokémon

O catálogo final deve conter exatamente 106 entradas, conforme o escopo definido:

- 88 espécies introduzidas na geração VII.
- 18 formas regionais de Alola de espécies introduzidas em gerações anteriores.

As formas originais das espécies antigas não devem aparecer como entradas elegíveis do catálogo.

As formas de Alola devem ser entradas independentes, relacionadas à espécie de origem.

Antes de inserir os dados:
- Validar a lista completa de espécies e formas.
- Conferir nomes oficiais, números nacionais, tipos e geração.
- Registrar a fonte utilizada para cada entrada.
- Verificar a procedência e a autorização de uso dos recursos visuais.
- Utilizar imagens e silhuetas locais.

Não considerar o catálogo concluído apenas pela quantidade de registros. A lista deve ser conferida individualmente.

## 8. Regras de desbloqueio e Pokédex

- O Pokémon deve ser desbloqueado automaticamente quando o treinador responder corretamente à pergunta relacionada a ele.
- Um mesmo Pokémon não pode ser desbloqueado duas vezes para o mesmo treinador.
- O treinador só pode favoritar Pokémon já desbloqueados.
- Pokémon bloqueados podem aparecer como silhuetas, sem revelar informações restritas.
- A API não deve enviar ao front