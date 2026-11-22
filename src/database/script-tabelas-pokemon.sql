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
-- CATÁLOGO: LOTE 2 (ids 34 a 61: #749 Mudbray a #775 Komala, com Minior Núcleo)
-- Dados: PokeAPI e PokémonDB. Descrições e categorias: tradução livre de Pokémon Moon.
-- =====================================================================
INSERT INTO pokemon (id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem) VALUES
(34, 749, 'Mudbray', 'Terra', NULL, 'Pokémon Burro', 'Tem temperamento teimoso e independente. Comer terra, fazer lama e brincar no lamaçal fazem parte da sua rotina diária.', 1, 'mudbray.png'),
(35, 750, 'Mudsdale', 'Terra', NULL, 'Pokémon Cavalo de Tração', 'Seus coices pesados e cobertos de lama são sua melhor forma de ataque. Consegue transformar caminhões grandes em sucata sem fazer esforço.', 2.5, 'mudsdale.png'),
(36, 751, 'Dewpider', 'Água', 'Inseto', 'Pokémon Bolha de Água', 'Quando encontra inimigos ou possíveis presas, este Pokémon bate neles com a cabeça coberta por uma bolha de água.', 0.3, 'dewpider.png'),
(37, 752, 'Araquanid', 'Água', 'Inseto', 'Pokémon Bolha de Água', 'Apesar da aparência, se preocupa com os outros. Se encontra Pokémon fracos e indefesos, coloca-os em sua bolha de água para protegê-los.', 1.8, 'araquanid.png'),
(38, 753, 'Fomantis', 'Grama', NULL, 'Pokémon Foice de Grama', 'Exalam um aroma doce e refrescante. Os Cutiefly costumam se reunir perto do mato alto onde os Fomantis se escondem.', 0.3, 'fomantis.png'),
(39, 754, 'Lurantis', 'Grama', NULL, 'Pokémon Foice Florida', 'Dispara raios de suas pétalas em forma de foice. Esses raios são fortes o bastante para cortar placas grossas de metal.', 0.9, 'lurantis.png'),
(40, 755, 'Morelull', 'Grama', 'Fada', 'Pokémon Iluminação', 'Enquanto cochila o dia todo, se alimenta sugando as raízes das árvores. Acorda ao cair da noite e sai vagando em busca de uma nova árvore.', 0.2, 'morelull.png'),
(41, 756, 'Shiinotic', 'Grama', 'Fada', 'Pokémon Iluminação', 'Solta esporos cintilantes que causam sonolência. Quando suas presas caem no sono, este Pokémon se alimenta sugando a energia delas.', 1, 'shiinotic.png'),
(42, 757, 'Salandit', 'Venenoso', 'Fogo', 'Pokémon Lagarto Tóxico', 'Vive em vulcões ou em lugares secos e rochosos. Solta um gás venenoso de cheiro doce que atrai Pokémon inseto, e então os ataca.', 0.6, 'salandit.png'),
(43, 758, 'Salazzle', 'Venenoso', 'Fogo', 'Pokémon Lagarto Tóxico', 'Cheio de feromônios, seu gás venenoso pode ser diluído e usado na produção de perfumes deliciosos.', 1.2, 'salazzle.png'),
(44, 759, 'Stufful', 'Normal', 'Lutador', 'Pokémon Esperneio', 'O toque de qualquer um que não seja um amigo conhecido o deixa num frenesi descontrolado. É um Pokémon extremamente perigoso.', 0.5, 'stufful.png'),
(45, 760, 'Bewear', 'Normal', 'Lutador', 'Pokémon Braço Forte', 'Este Pokémon tem o hábito de abraçar seus companheiros. Muitos Treinadores já deixaram este mundo depois de terem a coluna esmagada por seu abraço.', 2.1, 'bewear.png'),
(46, 761, 'Bounsweet', 'Grama', NULL, 'Pokémon Fruta', 'Embora seja doce demais para o consumo humano, o suor de Bounsweet pode ser diluído em água para virar um suco com a doçura na medida certa.', 0.3, 'bounsweet.png'),
(47, 762, 'Steenee', 'Grama', NULL, 'Pokémon Fruta', 'Este Pokémon vive pulando cheio de energia. Outros Pokémon são atraídos por sua aparência animada e seu aroma agradável.', 0.7, 'steenee.png'),
(48, 763, 'Tsareena', 'Grama', NULL, 'Pokémon Fruta', 'Conhecido pela beleza de suas pernas bem torneadas, às vezes aparece como mascote em propagandas de salões de beleza.', 1.2, 'tsareena.png'),
(49, 764, 'Comfey', 'Fada', NULL, 'Pokémon Colhe-Flor', 'Banhos preparados com as flores de seu cipó têm efeito relaxante, por isso este Pokémon faz sucesso com muitas pessoas.', 0.1, 'comfey.png'),
(50, 765, 'Oranguru', 'Normal', 'Psíquico', 'Pokémon Sábio', 'Vive no alto das copas das árvores, no fundo da floresta. Em raras ocasiões, aparece na praia para disputar inteligência com Slowking.', 1.5, 'oranguru.png'),
(51, 766, 'Passimian', 'Lutador', NULL, 'Pokémon Trabalho em Equipe', 'Batalham usando frutas duras como armas. Suas técnicas são passadas do chefe para o grupo, de geração em geração.', 2, 'passimian.png'),
(52, 767, 'Wimpod', 'Inseto', 'Água', 'Pokémon Fujão', 'Seu habitat vai das praias ao fundo do mar. Come restos por natureza e devora com alegria qualquer coisa comestível, não importa o quão podre esteja.', 0.5, 'wimpod.png'),
(53, 768, 'Golisopod', 'Inseto', 'Água', 'Pokémon Escama Dura', 'Batalha com habilidade usando seus seis braços, mas passa a maior parte do tempo meditando em paz em cavernas no fundo do mar.', 2, 'golisopod.png'),
(54, 769, 'Sandygast', 'Fantasma', 'Terra', 'Pokémon Monte de Areia', 'Controla qualquer um que coloque a mão em sua boca. Assim, aumenta o monte de areia que forma seu corpo.', 0.5, 'sandygast.png'),
(55, 770, 'Palossand', 'Fantasma', 'Terra', 'Pokémon Castelo de Areia', 'Enterrados sob o castelo, há montes de ossos secos daqueles cuja energia vital ele sugou.', 1.3, 'palossand.png'),
(56, 771, 'Pyukumuku', 'Água', NULL, 'Pokémon Pepino-do-Mar', 'Estes Pokémon se espalham pelas praias. O muco grudento que cobre seu corpo pode ser usado para aliviar a pele queimada de sol. Que prático!', 0.3, 'pyukumuku.png'),
(57, 772, 'Type: Null', 'Normal', NULL, 'Pokémon Sintético', 'Pelo risco de este Pokémon sintético perder o controle, ele usa uma máscara de controle que limita seu poder.', 1.9, 'type-null.png'),
(58, 773, 'Silvally', 'Normal', NULL, 'Pokémon Sintético', 'Embora no início seu nome fosse Type: Null, o garoto que o fez evoluir para esta forma lhe deu o nome pelo qual é conhecido hoje.', 2.3, 'silvally.png'),
(59, 774, 'Minior Meteoro', 'Pedra', 'Voador', 'Pokémon Meteoro', 'Impactos fortes podem tirá-lo de sua casca. Este Pokémon nasceu de nanopartículas que sofreram mutação.', 0.3, 'minior.png'),
(60, 774, 'Minior Núcleo', 'Pedra', 'Voador', 'Pokémon Meteoro', 'Se o núcleo ficar exposto, logo morre. É possível que sobreviva se for colocado numa Poké Bola rápido o bastante.', 0.3, 'minior-core.png'),
(61, 775, 'Komala', 'Normal', NULL, 'Pokémon Sonolento', 'O tronco que carrega foi dado por seus pais quando nasceu. Também é conhecido por se agarrar ao braço de Treinadores amigáveis.', 0.4, 'komala.png');

-- =====================================================================
-- CATÁLOGO: LOTE 3 (ids 62 a 100: #776 Turtonator a #809 Melmetal, com formas de Mimikyu, Necrozma e Magearna)
-- Poipole, Naganadel, Stakataka, Blacephalon, Zeraora e as formas de Necrozma: Ultra Moon.
-- Meltan e Melmetal: Pokémon Let's Go (não aparecem em Moon nem Ultra Moon).
-- Dados: PokeAPI e PokémonDB. Descrições e categorias: tradução livre de Pokémon Moon.
-- =====================================================================
INSERT INTO pokemon (id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem) VALUES
(62, 776, 'Turtonator', 'Fogo', 'Dragão', 'Pokémon Tartaruga Explosiva', 'Solta fogo e gases venenosos pelas narinas. Seu esterco é uma substância explosiva e pode ser usado de várias formas.', 2, 'turtonator.png'),
(63, 777, 'Togedemaru', 'Elétrico', 'Aço', 'Pokémon Bolinha', 'Os pelos longos das costas funcionam como para-raios. Os raios que atrai ficam armazenados como energia em sua bolsa elétrica.', 0.3, 'togedemaru.png'),
(64, 778, 'Mimikyu Disfarçado', 'Fantasma', 'Fada', 'Pokémon Disfarce', 'Um Pokémon solitário que esconde sua aparência assustadora debaixo de um pano velho para poder se aproximar de pessoas e de outros Pokémon.', 0.2, 'mimikyu.png'),
(65, 778, 'Mimikyu Desmascarado', 'Fantasma', 'Fada', 'Pokémon Disfarce', 'Se o pescoço quebrar ou o pano rasgar durante um ataque, passa a noite inteira consertando.', 0.2, 'mimikyu-busted.png'),
(66, 779, 'Bruxish', 'Água', 'Psíquico', 'Pokémon Range-Dentes', 'Atordoa suas presas com psicocinese e depois as tritura com seus dentes fortes. Nem a concha de Shellder resiste a ele.', 0.9, 'bruxish.png'),
(67, 780, 'Drampa', 'Normal', 'Dragão', 'Pokémon Plácido', 'Este Pokémon é amigável com as pessoas e adora, acima de tudo, as crianças. Desce do alto das montanhas para brincar na cidade com as crianças de que gosta.', 3, 'drampa.png'),
(68, 781, 'Dhelmise', 'Fantasma', 'Grama', 'Pokémon Trepadeira do Mar', 'A alma de uma alga que vagava pelas ondas renasceu como este Pokémon. Mantém-se absorvendo detritos do fundo do mar e algas novas.', 3.9, 'dhelmise.png'),
(69, 782, 'Jangmo-o', 'Dragão', NULL, 'Pokémon Escamoso', 'Vivem em montanhas onde não há nenhum sinal de seres humanos. Os Jangmo-o crescem pouco a pouco enquanto batalham entre si.', 0.6, 'jangmo-o.png'),
(70, 783, 'Hakamo-o', 'Dragão', 'Lutador', 'Pokémon Escamoso', 'Troca e regenera suas escamas sem parar. Cada vez que crescem de novo, as escamas ficam mais duras e afiadas.', 1.2, 'hakamo-o.png'),
(71, 784, 'Kommo-o', 'Dragão', 'Lutador', 'Pokémon Escamoso', 'Suas escamas rígidas servem para ataque e defesa. No passado, elas eram processadas e usadas para fazer armas e outros produtos.', 1.6, 'kommo-o.png'),
(72, 785, 'Tapu Koko', 'Elétrico', 'Fada', 'Pokémon Espírito da Terra', 'Confunde os inimigos voando rápido demais para os olhos acompanharem. Irrita-se com muita facilidade, mas um instante depois já esqueceu o motivo.', 1.8, 'tapu-koko.png'),
(73, 786, 'Tapu Lele', 'Psíquico', 'Fada', 'Pokémon Espírito da Terra', 'Enquanto esvoaça, espalha suas escamas de brilho estranho. Dizem que tocá-las restaura a saúde na mesma hora.', 1.2, 'tapu-lele.png'),
(74, 787, 'Tapu Bulu', 'Grama', 'Fada', 'Pokémon Espírito da Terra', 'A divindade guardiã de Ula''ula é um Pokémon preguiçoso. Ordena que as plantas imobilizem seus inimigos e depois os acerta com um golpe selvagem de seus chifres.', 1.9, 'tapu-bulu.png'),
(75, 788, 'Tapu Fini', 'Água', 'Fada', 'Pokémon Espírito da Terra', 'Divindade guardiã de Poni, consegue controlar a água. Dizem que cria uma água pura capaz de lavar qualquer impureza.', 1.3, 'tapu-fini.png'),
(76, 789, 'Cosmog', 'Psíquico', NULL, 'Pokémon Nebulosa', 'Em tempos antigos, era chamado de filho das estrelas. Dizem que é um Pokémon de outro mundo, mas nenhum detalhe concreto é conhecido.', 0.2, 'cosmog.png'),
(77, 790, 'Cosmoem', 'Psíquico', NULL, 'Pokémon Protoestrela', 'Há algo se acumulando em volta do núcleo negro dentro de sua casca dura. As pessoas acreditam que este Pokémon pode ter vindo de outro mundo.', 0.1, 'cosmoem.png'),
(78, 791, 'Solgaleo', 'Psíquico', 'Aço', 'Pokémon Sol', 'Dizem que este Pokémon é uma evolução macho de Cosmog. Quando seu terceiro olho é ativado, ele parte para outro mundo.', 3.4, 'solgaleo.png'),
(79, 792, 'Lunala', 'Psíquico', 'Fantasma', 'Pokémon Lua', 'Dizem que vive em outro mundo. Este Pokémon devora a luz, cobrindo o brilho do dia com o véu escuro de uma noite sem lua.', 4, 'lunala.png'),
(80, 793, 'Nihilego', 'Pedra', 'Venenoso', 'Pokémon Parasita', 'Uma das Ultracriaturas. Não se sabe se este Pokémon tem consciência, mas às vezes é visto se comportando como uma menina.', 1.2, 'nihilego.png'),
(81, 794, 'Buzzwole', 'Inseto', 'Lutador', 'Pokémon Inchado', 'Uma forma de vida misteriosa chamada Ultracriatura. Testemunhas o viram pulverizar um caminhão de lixo com um único soco.', 2.4, 'buzzwole.png'),
(82, 795, 'Pheromosa', 'Inseto', 'Lutador', 'Pokémon Esbelto', 'Uma das Ultracriaturas. Recusa-se a tocar em qualquer coisa, talvez porque sinta alguma impureza neste mundo.', 1.8, 'pheromosa.png'),
(83, 796, 'Xurkitree', 'Elétrico', NULL, 'Pokémon Brilhante', 'Surgiu de uma passagem para outro mundo. Atacou uma usina de energia, por isso as pessoas acreditam que ele se alimenta de eletricidade.', 3.8, 'xurkitree.png'),
(84, 797, 'Celesteela', 'Aço', 'Voador', 'Pokémon Lançamento', 'Um tipo de Ultracriatura. Testemunhas já o viram incendiar uma floresta expelindo gás pelos dois braços.', 9.2, 'celesteela.png'),
(85, 798, 'Kartana', 'Grama', 'Aço', 'Pokémon Espada Desembainhada', 'Uma das formas de vida chamadas Ultracriaturas. Foi visto derrubando uma gigantesca torre de aço com um só golpe de sua lâmina.', 0.3, 'kartana.png'),
(86, 799, 'Guzzlord', 'Sombrio', 'Dragão', 'Pokémon Come-Tudo', 'Uma Ultracriatura perigosa. Parece comer sem parar, mas, por algum motivo, suas fezes nunca foram encontradas.', 5.5, 'guzzlord.png'),
(87, 800, 'Necrozma', 'Psíquico', NULL, 'Pokémon Prisma', 'Aparentemente, a luz é sua fonte de energia. Tem um temperamento extremamente cruel e vive disparando raios laser.', 2.4, 'necrozma.png'),
(88, 800, 'Necrozma Juba Crepuscular', 'Psíquico', 'Aço', 'Pokémon Prisma', 'Esta é a forma de Necrozma enquanto absorve o poder de Solgaleo, o que o deixa extremamente feroz e impossível de controlar.', 3.8, 'necrozma-dusk-mane.png'),
(89, 800, 'Necrozma Asas da Alvorada', 'Psíquico', 'Fantasma', 'Pokémon Prisma', 'Esta é a sua forma enquanto devora a luz de Lunala.', 4.2, 'necrozma-dawn-wings.png'),
(90, 800, 'Ultra Necrozma', 'Psíquico', 'Dragão', 'Pokémon Prisma', 'A luz que jorra de todo o seu corpo afeta os seres vivos e a natureza, influenciando-os de várias maneiras.', 7.5, 'necrozma-ultra.png'),
(91, 801, 'Magearna', 'Aço', 'Fada', 'Pokémon Artificial', 'Seu corpo mecânico é apenas um recipiente. Seu verdadeiro eu é o Coração-Alma, uma alma artificial.', 1, 'magearna.png'),
(92, 801, 'Magearna Cor Original', 'Aço', 'Fada', 'Pokémon Artificial', 'Este belíssimo Magearna tem a aparência da época em que foi inventado. Sua decoração luxuosa agradou a filha do rei.', 1, 'magearna-original.png'),
(93, 802, 'Marshadow', 'Lutador', 'Fantasma', 'Pokémon Habitante das Sombras', 'Espreita nas sombras dos outros, copiando seus movimentos e poderes. Este Pokémon é covarde e medroso.', 0.7, 'marshadow.png'),
(94, 803, 'Poipole', 'Venenoso', NULL, 'Pokémon Ferrão Venenoso', 'Uma Ultracriatura que vive em outro mundo. Gargalha sem parar enquanto borrifa veneno nos adversários com as agulhas da cabeça.', 0.6, 'poipole.png'),
(95, 804, 'Naganadel', 'Venenoso', 'Dragão', 'Pokémon Ferrão Venenoso', 'Um tipo de Ultracriatura. Dispara de suas agulhas um líquido venenoso e brilhante, que também é extremamente grudento.', 3.6, 'naganadel.png'),
(96, 805, 'Stakataka', 'Pedra', 'Aço', 'Pokémon Muralha', 'Quando muros de pedra começaram a se mover e atacar, a verdadeira identidade do agressor era esta forma de vida misteriosa, que lembra uma Ultracriatura.', 5.5, 'stakataka.png'),
(97, 806, 'Blacephalon', 'Fogo', 'Fantasma', 'Pokémon Fogos de Artifício', 'Uma Ultracriatura que surgiu de uma passagem para outro mundo. Causa explosões e aproveita a surpresa dos adversários para roubar sua energia vital.', 1.8, 'blacephalon.png'),
(98, 807, 'Zeraora', 'Elétrico', NULL, 'Pokémon Trovão', 'Aproxima-se dos inimigos na velocidade de um raio e os despedaça com suas garras afiadas.', 1.5, 'zeraora.png'),
(99, 808, 'Meltan', 'Aço', NULL, 'Pokémon Porca Sextavada', 'Derrete partículas de ferro e de outros metais encontrados no subsolo para absorvê-las em seu corpo de aço derretido.', 0.2, 'meltan.png'),
(100, 809, 'Melmetal', 'Aço', NULL, 'Pokémon Porca Sextavada', 'Venerado há muito tempo por sua capacidade de criar ferro do nada, por algum motivo voltou à vida depois de 3.000 anos.', 2.5, 'melmetal.png');

-- =====================================================================
-- CATÁLOGO: LOTE 4 (ids 101 a 118 — formas de Alola)
-- "numero" é o número nacional da espécie original (ex.: Vulpix de Alola = 37).
-- Descrições: entrada de Pokémon Moon da FORMA DE ALOLA (fonte: PokémonDB).
-- Dados: PokeAPI e PokémonDB. Descrições e categorias: tradução livre de Pokémon Moon.
-- =====================================================================
INSERT INTO pokemon (id, numero, nome, tipo1, tipo2, categoria, descricao, altura, imagem) VALUES
(101, 19, 'Rattata de Alola', 'Sombrio', 'Normal', 'Pokémon Rato', 'Fica ativo quando o sol se põe. Corre pela cidade atrás de comida boa para o chefe do seu ninho, Raticate.', 0.3, 'rattata-alola.png'),
(102, 20, 'Raticate de Alola', 'Sombrio', 'Normal', 'Pokémon Rato', 'Este Pokémon gourmet é exigente com o sabor e o frescor da comida. Restaurantes onde vivem Raticate têm boa reputação.', 0.7, 'raticate-alola.png'),
(103, 26, 'Raichu de Alola', 'Elétrico', 'Psíquico', 'Pokémon Rato', 'Usa a psicocinese para controlar a eletricidade. Sobe na própria cauda e, com o poder psíquico, a faz flutuar para se locomover montado nela.', 0.7, 'raichu-alola.png'),
(104, 27, 'Sandshrew de Alola', 'Gelo', 'Aço', 'Pokémon Rato', 'Uma antiga tradição dos festivais de Alola, mantida até hoje, é uma competição para ver quem desliza um Sandshrew mais longe sobre o gelo.', 0.7, 'sandshrew-alola.png'),
(105, 28, 'Sandslash de Alola', 'Gelo', 'Aço', 'Pokémon Rato', 'Os espinhos de aço deste Pokémon são cobertos de gelo. Os golpes desses espinhos causam ferimentos profundos e queimaduras graves de frio.', 1.2, 'sandslash-alola.png'),
(106, 37, 'Vulpix de Alola', 'Gelo', NULL, 'Pokémon Raposa', 'No tempo quente, este Pokémon faz lascas de gelo com suas seis caudas e as espalha ao redor para se refrescar.', 0.6, 'vulpix-alola.png'),
(107, 38, 'Ninetales de Alola', 'Gelo', 'Fada', 'Pokémon Raposa', 'Com seu temperamento calmo, este Pokémon era venerado como uma divindade encarnada antes de ser identificado como uma variante regional de Ninetales.', 1.1, 'ninetales-alola.png'),
(108, 50, 'Diglett de Alola', 'Terra', 'Aço', 'Pokémon Toupeira', 'Seus fios dourados funcionam como sensores. Ele os põe para fora da toca para vigiar os arredores.', 0.2, 'diglett-alola.png'),
(109, 51, 'Dugtrio de Alola', 'Terra', 'Aço', 'Pokémon Toupeira', 'Estes Pokémon são muito queridos na região de Alola, onde se acredita que sejam divindades femininas da terra encarnadas.', 0.7, 'dugtrio-alola.png'),
(110, 52, 'Meowth de Alola', 'Sombrio', NULL, 'Pokémon Gato Arranhador', 'Quando seu orgulho delicado é ferido, ou quando a moeda de ouro da testa fica suja, tem um ataque de fúria histérica.', 0.4, 'meowth-alola.png'),
(111, 53, 'Persian de Alola', 'Sombrio', NULL, 'Pokémon Gato Elegante', 'Despreza todos, menos a si mesmo. Suas táticas preferidas são golpes traiçoeiros e ataques pelas costas.', 1.1, 'persian-alola.png'),
(112, 74, 'Geodude de Alola', 'Pedra', 'Elétrico', 'Pokémon Rocha', 'Se você pisar sem querer num Geodude dormindo no chão, vai ouvir um estalo e sentir um choque percorrer o corpo inteiro.', 0.4, 'geodude-alola.png'),
(113, 75, 'Graveler de Alola', 'Pedra', 'Elétrico', 'Pokémon Rocha', 'Comem pedras e vivem brigando por elas. O choque de Graveler batendo uns nos outros causa um clarão e um estrondo.', 1, 'graveler-alola.png'),
(114, 76, 'Golem de Alola', 'Pedra', 'Elétrico', 'Pokémon Megatonelada', 'Como não consegue disparar pedras em ritmo rápido, é conhecido por agarrar Geodude que estejam por perto e dispará-los pelas costas.', 1.7, 'golem-alola.png'),
(115, 88, 'Grimer de Alola', 'Venenoso', 'Sombrio', 'Pokémon Lodo', 'Os cristais no corpo de Grimer são aglomerados de toxinas. Se um deles cair, venenos mortais vazam.', 0.7, 'grimer-alola.png'),
(116, 89, 'Muk de Alola', 'Venenoso', 'Sombrio', 'Pokémon Lodo', 'Embora seja surpreendentemente quieto e amigável, se ficar um tempo sem comer lixo, quebra os móveis do seu Treinador e come os pedaços.', 1, 'muk-alola.png'),
(117, 103, 'Exeggutor de Alola', 'Grama', 'Dragão', 'Pokémon Coco', 'À medida que ficava cada vez mais alto, deixou de depender dos poderes psíquicos, e dentro dele despertou o poder do dragão adormecido.', 10.9, 'exeggutor-alola.png'),
(118, 105, 'Marowak de Alola', 'Fogo', 'Fantasma', 'Pokémon Guardião de Ossos', 'Tem o costume de chorar pelos companheiros perdidos. Montes de terra à beira da estrada marcam os túmulos dos Marowak.', 1, 'marowak-alola.png');
