-- Inicializa o banco e as tabelas usados pelo Pokémon Trainer Hub.

CREATE DATABASE IF NOT EXISTS pokemon_trainer_hub
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pokemon_trainer_hub;

CREATE TABLE IF NOT EXISTS pokemon_treinador (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    usuario VARCHAR(24) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pokemon_treinador_usuario (usuario),
    UNIQUE KEY uq_pokemon_treinador_email (email)
);

CREATE TABLE IF NOT EXISTS pokemon_sessao (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    treinador_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expira_em DATETIME NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pokemon_sessao_token (token_hash),
    KEY ix_pokemon_sessao_expira (expira_em),
    CONSTRAINT fk_pokemon_sessao_treinador
        FOREIGN KEY (treinador_id) REFERENCES pokemon_treinador(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pokemon_catalogo (
    id INT PRIMARY KEY,
    numero_pokedex SMALLINT NOT NULL,
    numero_nacional SMALLINT NOT NULL,
    nome VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL,
    tipos JSON NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    descricao TEXT NOT NULL,
    altura VARCHAR(20) NULL,
    imagem_url VARCHAR(500) NULL,
    UNIQUE KEY uq_pokemon_catalogo_numero (numero_pokedex),
    UNIQUE KEY uq_pokemon_catalogo_slug (slug)
);

CREATE TABLE IF NOT EXISTS pokemon_pergunta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enunciado VARCHAR(500) NOT NULL,
    modo ENUM('silhouette', 'image', 'trivia') NOT NULL,
    pokemon_id INT NOT NULL,
    opcoes JSON NOT NULL,
    resposta_correta VARCHAR(80) NOT NULL,
    ativa TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_pokemon_pergunta_pokemon
        FOREIGN KEY (pokemon_id) REFERENCES pokemon_catalogo(id)
);

CREATE TABLE IF NOT EXISTS pokemon_colecao (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    treinador_id INT NOT NULL,
    pokemon_id INT NOT NULL,
    favorito TINYINT(1) NOT NULL DEFAULT 0,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pokemon_colecao_treinador_pokemon (treinador_id, pokemon_id),
    CONSTRAINT fk_pokemon_colecao_treinador
        FOREIGN KEY (treinador_id) REFERENCES pokemon_treinador(id) ON DELETE CASCADE,
    CONSTRAINT fk_pokemon_colecao_pokemon
        FOREIGN KEY (pokemon_id) REFERENCES pokemon_catalogo(id)
);

CREATE TABLE IF NOT EXISTS pokemon_tentativa (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    treinador_id INT NOT NULL,
    pontos INT NOT NULL,
    acertos TINYINT UNSIGNED NOT NULL,
    erros TINYINT UNSIGNED NOT NULL,
    total TINYINT UNSIGNED NOT NULL,
    precisao TINYINT UNSIGNED NOT NULL,
    resultado ENUM('beginner', 'explorer', 'expert') NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY ix_pokemon_tentativa_treinador_criado (treinador_id, criado_em),
    CONSTRAINT fk_pokemon_tentativa_treinador
        FOREIGN KEY (treinador_id) REFERENCES pokemon_treinador(id) ON DELETE CASCADE
);

INSERT IGNORE INTO pokemon_catalogo
    (id, numero_pokedex, numero_nacional, nome, slug, tipos, categoria, descricao, altura, imagem_url)
VALUES
    (1, 1, 722, 'Rowlet', 'rowlet', JSON_ARRAY('Grama', 'Voador'), 'Pokémon Pena',
     'Um companheiro atento que voa silenciosamente e se orienta pela luz da lua.', '0,3 m', NULL),
    (2, 4, 725, 'Litten', 'litten', JSON_ARRAY('Fogo'), 'Pokémon Gato-Fogo',
     'Um Pokémon reservado que reúne energia antes de lançar suas chamas.', '0,4 m', NULL),
    (3, 7, 728, 'Popplio', 'popplio', JSON_ARRAY('Água'), 'Pokémon Leão-marinho',
     'Um acrobata aquático que transforma bolhas em parte de suas apresentações.', '0,4 m', NULL),
    (4, 25, 25, 'Pikachu', 'pikachu', JSON_ARRAY('Elétrico'), 'Pokémon Rato',
     'Um Pokémon elétrico conhecido por sua curiosidade e por guardar energia nas bochechas.', '0,4 m', NULL);

INSERT INTO pokemon_pergunta (id, enunciado, modo, pokemon_id, opcoes, resposta_correta)
VALUES
    (1, 'Qual Pokémon da região de Alola está representado por esta silhueta?', 'silhouette', 1,
     JSON_ARRAY('Rowlet', 'Litten', 'Popplio', 'Pikachu'), 'Rowlet'),
    (2, 'Qual Pokémon da região de Alola está representado por esta silhueta?', 'silhouette', 2,
     JSON_ARRAY('Popplio', 'Pikachu', 'Litten', 'Rowlet'), 'Litten'),
    (3, 'Qual Pokémon da região de Alola está representado por esta silhueta?', 'silhouette', 3,
     JSON_ARRAY('Litten', 'Popplio', 'Rowlet', 'Pikachu'), 'Popplio'),
    (4, 'Qual Pokémon é conhecido por armazenar eletricidade nas bochechas?', 'trivia', 4,
     JSON_ARRAY('Pikachu', 'Rowlet', 'Litten', 'Popplio'), 'Pikachu')
ON DUPLICATE KEY UPDATE enunciado = VALUES(enunciado);
