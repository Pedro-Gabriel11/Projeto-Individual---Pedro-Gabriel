-- Script do banco do Pokémon Trainer Hub.
-- ATENÇÃO: este script APAGA o banco e cria tudo de novo.
-- Execute o arquivo inteiro no MySQL Workbench.

DROP DATABASE IF EXISTS pokemon_trainer_hub;
CREATE DATABASE pokemon_trainer_hub;
USE pokemon_trainer_hub;

-- Cada pessoa que cria uma conta no site.
-- "usuario" é o nome de treinador (o @) e não pode se repetir.
CREATE TABLE treinador (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    usuario VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(50) NOT NULL,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- O catálogo da Pokédex: os 106 Pokémon do site.
-- tipo2 fica NULL quando o Pokémon tem um tipo só.
-- altura em metros. imagem = nome do arquivo em public/images/pokemon/.
CREATE TABLE pokemon (
    id INT PRIMARY KEY,
    numero INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    tipo1 VARCHAR(20) NOT NULL,
    tipo2 VARCHAR(20) NULL,
    categoria VARCHAR(60),
    descricao VARCHAR(400),
    altura DECIMAL(4,1),
    imagem VARCHAR(60)
);

-- Quais Pokémon cada treinador já desbloqueou (tabela associativa).
-- A chave primária composta impede o mesmo Pokémon duas vezes para o mesmo treinador.
-- favorito: 0 = não, 1 = sim.
CREATE TABLE colecao (
    fk_treinador INT,
    fk_pokemon INT,
    favorito INT DEFAULT 0,
    dt_desbloqueio DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fk_treinador, fk_pokemon),
    FOREIGN KEY (fk_treinador) REFERENCES treinador(id),
    FOREIGN KEY (fk_pokemon) REFERENCES pokemon(id)
);

-- Cada partida de quiz jogada. A precisão é calculada: acertos / (acertos + erros).
CREATE TABLE tentativa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_treinador INT,
    acertos INT NOT NULL,
    erros INT NOT NULL,
    pontos INT NOT NULL,
    dt_tentativa DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_treinador) REFERENCES treinador(id)
);

-- =====================================================================
-- CATÁLOGO: LOTE 1 (ids 1 a 27)
-- =====================================================================

-- =====================================================================
-- CATÁLOGO: LOTE 2 (ids 28 a 54)
-- =====================================================================

-- =====================================================================
-- CATÁLOGO: LOTE 3 (ids 55 a 88)
-- =====================================================================

-- =====================================================================
-- CATÁLOGO: LOTE 4 (ids 89 a 106 — formas de Alola)
-- =====================================================================
