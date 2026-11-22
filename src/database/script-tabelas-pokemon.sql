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
-- CATÁLOGO: LOTE 1 (ids 1 a 33: #722 Rowlet a #748 Toxapex, com formas)
-- Dados: PokeAPI. Descrições e categorias: tradução livre de Pokémon Moon
-- (formas que não existem no Moon usam a entrada de Ultra Moon).
-- =====================================================================
INSERT INTO pokemon (id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem) VALUES
(1, 722, 'Rowlet', 'Grama', 'Voador', 'Pokémon Pena de Grama', 'Plana em silêncio e se aproxima de seus alvos. Antes que eles percebam, começa a atacá-los com chutes ferozes.', 0.3, 'rowlet.png'),
(2, 723, 'Dartrix', 'Grama', 'Voador', 'Pokémon Pena Lâmina', 'Arremessa penas afiadas, chamadas penas-lâmina, contra inimigos ou presas. Raramente erra.', 0.7, 'dartrix.png'),
(3, 724, 'Decidueye', 'Grama', 'Fantasma', 'Pokémon Pena Flecha', 'Embora seja calmo e cauteloso, entra em pânico quando é pego de surpresa.', 1.6, 'decidueye.png'),
(4, 725, 'Litten', 'Fogo', NULL, 'Pokémon Gato de Fogo', 'Não deixa suas emoções transparecerem com facilidade. Conquistar sua confiança leva tempo. Prefere ficar sozinho.', 0.4, 'litten.png'),
(5, 726, 'Torracat', 'Fogo', NULL, 'Pokémon Gato de Fogo', 'Tem patas dianteiras poderosas. Com um único soco, consegue entortar uma barra de ferro.', 0.7, 'torracat.png'),
(6, 727, 'Incineroar', 'Fogo', 'Sombrio', 'Pokémon Vilão', 'Depois de desferir socos ferozes e chutes furiosos, finaliza os adversários cuspindo fogo da região do umbigo.', 1.8, 'incineroar.png'),
(7, 728, 'Popplio', 'Água', NULL, 'Pokémon Leão-Marinho', 'Este Pokémon consegue controlar bolhas de água. Treina com dedicação para aprender a fazer bolhas grandes.', 0.4, 'popplio.png'),
(8, 729, 'Brionne', 'Água', NULL, 'Pokémon Estrela Pop', 'Se importa muito com seus companheiros. Quando seu Treinador está triste, faz uma dança alegre para tentar animá-lo.', 0.6, 'brionne.png'),
(9, 730, 'Primarina', 'Água', 'Fada', 'Pokémon Solista', 'Sua voz é sua principal arma em batalha. O Treinador deste Pokémon precisa priorizar, acima de tudo, o cuidado diário com a garganta dele.', 1.8, 'primarina.png'),
(10, 731, 'Pikipek', 'Normal', 'Voador', 'Pokémon Pica-Pau', 'Alimenta-se de frutas silvestres, e as sementes que sobram viram munição para os ataques que dispara pela boca.', 0.3, 'pikipek.png'),
(11, 732, 'Trumbeak', 'Normal', 'Voador', 'Pokémon Bico Corneta', 'Dobrando o bico, consegue produzir vários tipos de cantos, o que o torna um vizinho barulhento e incômodo.', 0.6, 'trumbeak.png'),
(12, 733, 'Toucannon', 'Normal', 'Voador', 'Pokémon Canhão', 'Dentro do bico, um gás pega fogo e lança sementes de forma explosiva, com força suficiente para pulverizar rochas.', 1.1, 'toucannon.png'),
(13, 734, 'Yungoos', 'Normal', NULL, 'Pokémon Vadio', 'Vaga sem parar em busca de comida. Ao anoitecer, desaba de cansaço e adormece onde estiver.', 0.4, 'yungoos.png'),
(14, 735, 'Gumshoos', 'Normal', NULL, 'Pokémon Tocaia', 'Adora ter Rattata e Raticate como jantar, mas, como é diurno, nunca os encontra. Este Pokémon tem uma paciência incrível.', 0.7, 'gumshoos.png'),
(15, 736, 'Grubbin', 'Inseto', NULL, 'Pokémon Larva', 'Costumam se reunir perto de lugares frequentados por Pokémon elétricos, para evitar ataques de Pokémon pássaros.', 0.4, 'grubbin.png'),
(16, 737, 'Charjabug', 'Inseto', 'Elétrico', 'Pokémon Bateria', 'Gera eletricidade a partir da comida que digere e armazena essa energia em sua bolsa elétrica.', 0.5, 'charjabug.png'),
(17, 738, 'Vikavolt', 'Inseto', 'Elétrico', 'Pokémon Besouro-Veado', 'Produz eletricidade por meio de um órgão elétrico no abdômen. Domina Pokémon pássaros com raios de energia elétrica.', 1.5, 'vikavolt.png'),
(18, 739, 'Crabrawler', 'Lutador', NULL, 'Pokémon Boxeador', 'Soca tanto que suas pinças costumam cair pelo uso excessivo, mas crescem de volta rápido. A pouca carne que elas têm é saborosa e suculenta.', 0.6, 'crabrawler.png'),
(19, 740, 'Crabominable', 'Lutador', 'Gelo', 'Pokémon Caranguejo Peludo', 'Distribui socos sem critério. Em momentos de desespero, consegue soltar as próprias pinças e dispará-las como foguetes.', 1.7, 'crabominable.png'),
(20, 741, 'Oricorio Baile', 'Fogo', 'Voador', 'Pokémon Dançarino', 'Este Oricorio bebeu néctar vermelho. Seus passos de dança apaixonados fazem os inimigos entrarem em combustão, de corpo e mente.', 0.6, 'oricorio.png'),
(21, 741, 'Oricorio Pom-Pom', 'Elétrico', 'Voador', 'Pokémon Dançarino', 'Cria uma carga elétrica esfregando as penas umas nas outras. Dança até os inimigos e desfere socos elétricos chocantes.', 0.6, 'oricorio-pom-pom.png'),
(22, 741, 'Oricorio Pa''u', 'Psíquico', 'Voador', 'Pokémon Dançarino', 'Este Oricorio bebeu néctar rosa. O coração dos inimigos derrete ao ver o suave balançar de seus quadris.', 0.6, 'oricorio-pau.png'),
(23, 741, 'Oricorio Sensu', 'Fantasma', 'Voador', 'Pokémon Dançarino', 'Invoca os mortos com sua dança etérea. Da maldade deles, tira o poder para amaldiçoar os inimigos.', 0.6, 'oricorio-sensu.png'),
(24, 742, 'Cutiefly', 'Inseto', 'Fada', 'Pokémon Mosca-Abelha', 'Muitos Cutiefly voam sobre a cabeça de pessoas que têm auras parecidas com as das flores.', 0.1, 'cutiefly.png'),
(25, 743, 'Ribombee', 'Inseto', 'Fada', 'Pokémon Mosca-Abelha', 'Algumas das bolinhas de pólen de Ribombee são muito nutritivas. Às vezes, são vendidas como suplemento.', 0.2, 'ribombee.png'),
(26, 744, 'Rockruff', 'Pedra', NULL, 'Pokémon Filhote', 'Este Pokémon vive com as pessoas desde tempos antigos. Percebe quando seu Treinador está triste e fica bem ao seu lado.', 0.5, 'rockruff.png'),
(27, 745, 'Lycanroc Diurno', 'Pedra', NULL, 'Pokémon Lobo', 'Se for bem criado desde pequeno, vira um parceiro confiável que jamais trairá seu Treinador.', 0.8, 'lycanroc.png'),
(28, 745, 'Lycanroc Noturno', 'Pedra', NULL, 'Pokémon Lobo', 'Provoca os inimigos para que ataquem, aguenta os golpes e, em troca, dá uma cabeçada, esmagando seus ossos com a juba de pedra.', 1.1, 'lycanroc-midnight.png'),
(29, 745, 'Lycanroc Crepuscular', 'Pedra', NULL, 'Pokémon Lobo', 'Esta forma estranha é resultado de ter evoluído ao entardecer. É muito rara em Alola.', 0.8, 'lycanroc-dusk.png'),
(30, 746, 'Wishiwashi Solo', 'Água', NULL, 'Pokémon Peixinho', 'É muito fraco e especialmente saboroso, por isso todos estão sempre atrás dele. Só que quem tenta implicar com ele acaba recebendo uma lição dolorosa.', 0.2, 'wishiwashi.png'),
(31, 746, 'Wishiwashi Cardume', 'Água', NULL, 'Pokémon Peixinho', 'Quando aparecem, até Gyarados foge. Quando se unem para usar Jato d''Água, o poder supera o de Hidro Bomba.', 8.2, 'wishiwashi-school.png'),
(32, 747, 'Mareanie', 'Venenoso', 'Água', 'Pokémon Estrela Cruel', 'É encontrado rastejando por praias e pelo fundo do mar. Os corais que crescem na cabeça de Corsola são, para este Pokémon, um banquete cinco estrelas.', 0.4, 'mareanie.png'),
(33, 748, 'Toxapex', 'Venenoso', 'Água', 'Pokémon Estrela Cruel', 'Quem é atacado pelo veneno de Toxapex sofre dores intensas por três dias e três noites. Mesmo depois de se recuperar, ficam algumas sequelas.', 0.7, 'toxapex.png');

-- =====================================================================
-- CATÁLOGO: LOTE 2 (ids 28 a 54)
-- =====================================================================

-- =====================================================================
-- CATÁLOGO: LOTE 3 (ids 55 a 88)
-- =====================================================================

-- =====================================================================
-- CATÁLOGO: LOTE 4 (ids 89 a 106 — formas de Alola)
-- =====================================================================
