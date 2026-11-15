(function () {
  "use strict";

  var API = "/api";
  var TOKEN_KEY = "pokemon_trainer_token";
  var USER_KEY = "pokemon_trainer_user";
  var trainer = readUser();
  var currentQuestions = [];
  var currentQuestionIndex = 0;
  var currentAnswer = null;
  var submittedAnswers = [];
  var pokedexItems = [];
  var activeType = "Todos";
  var searchTerm = "";

  function readUser() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function saveSession(data) {
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.treinador));
    trainer = data.treinador;
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    trainer = null;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  async function request(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    var token = sessionStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = "Bearer " + token;
    var response = await fetch(API + path, Object.assign({}, options, { headers: headers }));
    if (response.status === 401 && document.body.dataset.page !== "login" &&
        document.body.dataset.page !== "cadastro") {
      clearSession();
      window.location.href = "/login.html";
    }
    if (response.status === 204) return null;
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.mensagem || "Não foi possível concluir a solicitação.");
    return payload;
  }

  function setMessage(id, message) {
    var element = document.getElementById(id);
    if (element) element.textContent = message || "";
  }

  function renderHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    var signedIn = Boolean(trainer && sessionStorage.getItem(TOKEN_KEY));
    var nav = signedIn
      ? '<nav class="site-nav" aria-label="Navegação principal">' +
        '<a href="/dashboard.html">Painel</a><a href="/pokedex.html">Pokédex</a>' +
        '<a href="/quiz.html">Quiz</a><a href="/perfil.html">Perfil</a>' +
        '<span class="nav-user"><span class="nav-avatar">' + escapeHtml(trainer.nome.slice(0, 1).toUpperCase()) +
        '</span>' + escapeHtml("@" + trainer.usuario) + '</span></nav>'
      : '<nav class="site-nav" aria-label="Navegação principal">' +
        '<a href="/#descobrir">Descobrir</a><a href="/historia.html">Minha história</a>' +
        '<a href="/login.html">Entrar</a><a class="nav-cta" href="/cadastro.html">Começar</a></nav>';
    header.innerHTML =
      '<div class="site-header-inner"><a class="brand" href="/" aria-label="Pokémon Trainer Hub, página inicial">' +
      '<span class="brand-mark" aria-hidden="true"></span><span class="brand-name"><small>Pokémon</small>' +
      '<strong>Trainer Hub</strong></span></a>' + nav + '</div>' +
      (signedIn
        ? '<nav class="mobile-nav" aria-label="Navegação móvel"><a href="/dashboard.html">Painel</a>' +
          '<a href="/pokedex.html">Pokédex</a><a href="/quiz.html">Quiz</a><a href="/perfil.html">Perfil</a></nav>'
        : "");
  }

  function requireSession() {
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      window.location.replace("/login.html");
      return false;
    }
    return true;
  }

  function saveTrainerFromResponse(data) {
    saveSession(data);
    window.location.href = "/dashboard.html";
  }

  function initCadastro() {
    var form = document.getElementById("signup-form");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      setMessage("signup-message", "");
      try {
        if (form.elements.senha.value !== form.elements.confirmacao.value) {
          throw new Error("As senhas não correspondem.");
        }
        var data = await request("/treinadores/cadastrar", {
          method: "POST",
          body: JSON.stringify({
            nome: form.elements.nome.value.trim(),
            usuario: form.elements.usuario.value.trim().toLowerCase(),
            email: form.elements.email.value.trim(),
            senha: form.elements.senha.value
          })
        });
        saveTrainerFromResponse(data);
      } catch (error) {
        setMessage("signup-message", error.message);
      } finally {
        button.disabled = false;
      }
    });
  }

  function initLogin() {
    var form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var button = form.querySelector('[type="submit"]');
      button.disabled = true;
      setMessage("login-message", "");
      try {
        var data = await request("/treinadores/autenticar", {
          method: "POST",
          body: JSON.stringify({
            conta: form.elements.conta.value.trim(),
            senha: form.elements.senha.value
          })
        });
        saveTrainerFromResponse(data);
      } catch (error) {
        setMessage("login-message", error.message);
      } finally {
        button.disabled = false;
      }
    });
  }

  function statCard(icon, label, value, helper) {
    return '<article class="stat-card"><span class="stat-icon">' + icon + '</span><small>' +
      escapeHtml(label) + '</small><strong>' + escapeHtml(value) + '</strong>' +
      (helper ? '<small>' + escapeHtml(helper) + '</small>' : '') + '</article>';
  }

  async function initDashboard() {
    if (!requireSession()) return;
    var content = document.getElementById("dashboard-content");
    try {
      var overview = await request("/treinadores/visao-geral");
      var stats = overview.stats;
      var recent = overview.collection.slice(0, 4);
      var chart = overview.attempts.slice().reverse().map(function (attempt) {
        return '<div class="chart-bar" style="height:' + Math.max(8, Number(attempt.accuracy)) +
          '%"><span>' + escapeHtml(attempt.accuracy) + '%</span></div>';
      }).join("");
      var types = overview.topTypes.map(function (item) {
        var width = stats.unlocked ? Math.max(12, Math.round(item.count / stats.unlocked * 100)) : 0;
        return '<div class="type-row"><div class="type-row-label"><span>' +
          escapeHtml(item.type) + '</span><span>' + escapeHtml(item.count) + '</span></div>' +
          '<div class="type-track"><div class="type-fill" style="width:' + width + '%"></div></div></div>';
      }).join("");
      var recentCards = recent.map(function (item) {
        return '<div class="mini-pokemon"><span class="pokemon-art">' +
          escapeHtml(typeSymbol(item.types)) + '</span><strong>' + escapeHtml(item.name) +
          '</strong></div>';
      }).join("");
      content.innerHTML =
        '<section class="page-intro"><div><p class="eyebrow">Painel do treinador</p><h1>Aloha, ' +
        escapeHtml(trainer.nome) + '!</h1><p class="muted">Veja como sua jornada pelas ilhas está evoluindo.</p></div>' +
        '<a class="btn" href="/quiz.html">✦ Iniciar novo quiz</a></section>' +
        '<section class="stats-grid">' +
        statCard("✦", "Desbloqueados", stats.unlocked, "de " + stats.catalogSize) +
        statCard("◉", "Progresso", stats.progress + "%", "da Pokédex") +
        statCard("♡", "Favoritos", stats.favorites, "selecionados") +
        statCard("✧", "Quizzes", stats.quizzes, "concluídos") +
        statCard("◎", "Taxa de acerto", stats.accuracy + "%", "geral") +
        statCard("★", "Melhor pontuação", stats.bestScore, "pontos") +
        '</section><div class="dashboard-grid"><section class="panel"><h2>Desempenho nos quizzes</h2>' +
        '<p>Precisão das últimas partidas</p>' +
        (chart ? '<div class="chart">' + chart + '</div>' :
          '<div class="empty-state">Conclua seu primeiro quiz para visualizar sua evolução.</div>') +
        '</section><section class="panel"><h2>Pokémon por tipo</h2><p>Distribuição da sua coleção</p>' +
        (types || '<div class="empty-state">Os tipos aparecem quando você desbloquear Pokémon.</div>') +
        '</section><section class="panel"><h2>Últimos desbloqueios</h2>' +
        (recentCards ? '<div class="recent-grid">' + recentCards + '</div>' :
          '<div class="empty-state">Seus novos companheiros aparecerão aqui.</div>') +
        '<p><a class="btn btn-small btn-dark" href="/pokedex.html">Ver Pokédex</a></p>' +
        '</section><section class="panel goal-panel"><p class="eyebrow">Próximo objetivo</p>' +
        '<h2>Descubra seu próximo companheiro.</h2><p>Cada resposta correta pode revelar um novo Pokémon para sua coleção.</p>' +
        '<a class="btn btn-yellow btn-small" href="/quiz.html">Aceitar desafio</a></section></div>';
    } catch (error) {
      content.innerHTML = '<div class="empty-state">' + escapeHtml(error.message) +
        ' <button class="btn btn-small btn-dark" data-retry>Recarregar</button></div>';
      content.querySelector("[data-retry]").addEventListener("click", initDashboard);
    }
  }

  function typeSymbol(types) {
    var type = Array.isArray(types) ? types[0] : "";
    return { Grama: "✿", Fogo: "♨", Água: "≈", Elétrico: "ϟ", Voador: "⌁" }[type] || "✦";
  }

  function renderTypeTags(types) {
    return (types || []).map(function (type) {
      return '<span class="type-tag">' + escapeHtml(type) + '</span>';
    }).join("");
  }

  function renderPokedex() {
    var grid = document.getElementById("pokemon-grid");
    if (!grid) return;
    var filtered = pokedexItems.filter(function (item) {
      return (!searchTerm || item.name.toLocaleLowerCase("pt-BR").includes(searchTerm)) &&
        (activeType === "Todos" || item.types.includes(activeType));
    });
    grid.innerHTML = filtered.length ? filtered.map(function (item) {
      var label = item.unlocked ? item.name : "???";
      return '<article class="pokemon-card"><button class="pokemon-detail-trigger" data-pokemon-id="' +
        item.id + '" style="width:100%;padding:0;border:0;background:transparent;text-align:left;cursor:pointer">' +
        '<div class="pokemon-art ' + (item.unlocked ? "" : "locked") + '">' +
        '<span class="pokemon-number">#' + String(item.dexNumber).padStart(3, "0") + '</span>' +
        escapeHtml(item.unlocked ? typeSymbol(item.types) : "?") + '</div>' +
        '<h2>' + escapeHtml(label) + '</h2><div class="type-tags">' + renderTypeTags(item.types) +
        '</div></button>' +
        (item.unlocked ? '<button class="favorite-btn ' + (item.favorite ? "selected" : "") +
          '" data-favorite-id="' + item.id + '" aria-label="' +
          (item.favorite ? "Remover dos favoritos" : "Favoritar") + ' ' + escapeHtml(item.name) +
          '">' + (item.favorite ? "♥" : "♡") + '</button>' :
          '<span class="pokemon-number" style="top:auto;bottom:15px;left:50%">Não descoberto</span>') +
        '</article>';
    }).join("") : '<div class="empty-state" style="grid-column:1/-1">Nenhum Pokémon encontrado. Tente outro nome ou tipo.</div>';
    grid.querySelectorAll("[data-favorite-id]").forEach(function (button) {
      button.addEventListener("click", changeFavorite);
    });
    grid.querySelectorAll("[data-pokemon-id]").forEach(function (button) {
      button.addEventListener("click", showPokemonDetails);
    });
    var count = document.getElementById("pokedex-count");
    if (count) count.textContent = pokedexItems.filter(function (item) { return item.unlocked; }).length +
      " / " + pokedexItems.length + " descobertos";
  }

  async function initPokedex() {
    if (!requireSession()) return;
    try {
      pokedexItems = await request("/treinadores/pokedex");
      var types = Array.from(new Set(pokedexItems.reduce(function (all, item) {
        return all.concat(item.types);
      }, [])));
      var filters = document.getElementById("type-filters");
      filters.innerHTML = ["Todos"].concat(types).map(function (type) {
        return '<button class="filter-chip ' + (type === activeType ? "active" : "") +
          '" data-type="' + escapeHtml(type) + '">' + escapeHtml(type) + '</button>';
      }).join("");
      filters.querySelectorAll("[data-type]").forEach(function (button) {
        button.addEventListener("click", function () {
          activeType = button.dataset.type;
          filters.querySelectorAll(".filter-chip").forEach(function (chip) {
            chip.classList.toggle("active", chip.dataset.type === activeType);
          });
          renderPokedex();
        });
      });
      document.getElementById("pokedex-search").addEventListener("input", function (event) {
        searchTerm = event.target.value.trim().toLocaleLowerCase("pt-BR");
        renderPokedex();
      });
      document.getElementById("pokemon-dialog-close").addEventListener("click", function () {
        document.getElementById("pokemon-dialog").close();
      });
      renderPokedex();
    } catch (error) {
      setMessage("pokedex-message", error.message);
    }
  }

  async function changeFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    var button = event.currentTarget;
    var item = pokedexItems.find(function (pokemon) {
      return Number(pokemon.id) === Number(button.dataset.favoriteId);
    });
    if (!item) return;
    button.disabled = true;
    try {
      var result = await request("/treinadores/pokedex/" + item.id + "/favorito", {
        method: "PATCH",
        body: JSON.stringify({ favorite: !item.favorite })
      });
      item.favorite = result.favorite;
      renderPokedex();
    } catch (error) {
      setMessage("pokedex-message", error.message);
      button.disabled = false;
    }
  }

  function showPokemonDetails(event) {
    var item = pokedexItems.find(function (pokemon) {
      return Number(pokemon.id) === Number(event.currentTarget.dataset.pokemonId);
    });
    if (!item) return;
    var title = item.unlocked ? item.name : "Pokémon não descoberto";
    document.getElementById("pokemon-dialog-content").innerHTML =
      '<p class="eyebrow">Pokédex de Alola #' + String(item.dexNumber).padStart(3, "0") +
      '</p><h2>' + escapeHtml(title) + '</h2>' +
      (item.unlocked
        ? '<p class="muted">' + escapeHtml(item.category) + (item.height ? " · " + escapeHtml(item.height) : "") +
          '</p><p class="muted">' + escapeHtml(item.description) + '</p>'
        : '<p class="muted">Acerte uma pergunta sobre este Pokémon no quiz para revelá-lo e adicioná-lo à sua coleção.</p>');
    document.getElementById("pokemon-dialog").showModal();
  }

  async function initQuiz() {
    if (!requireSession()) return;
    try {
      currentQuestions = await request("/quiz/perguntas");
      if (!currentQuestions.length) {
        setMessage("quiz-message", "Ainda não há perguntas disponíveis.");
        return;
      }
      paintQuestion();
    } catch (error) {
      setMessage("quiz-message", error.message);
    }
  }

  function paintQuestion() {
    var question = currentQuestions[currentQuestionIndex];
    var card = document.getElementById("quiz-card");
    var percent = Math.round(((currentQuestionIndex + 1) / currentQuestions.length) * 100);
    card.innerHTML =
      '<div class="quiz-progress"><div class="quiz-progress-row"><span>Questão ' +
      (currentQuestionIndex + 1) + ' de ' + currentQuestions.length + '</span><span>' + percent +
      '%</span></div><div class="progress-track"><div class="progress-fill" style="width:' +
      percent + '%"></div></div></div><div class="quiz-content"><div class="quiz-art"><div class="pokemon-art ' +
      (question.mode === "silhouette" ? "silhouette silhouette-" + escapeHtml(question.silhouetteKey) : "") + '">' +
      (question.mode === "trivia" ? "?" : "") +
      '</div></div><div class="quiz-question"><p class="eyebrow">' +
      (question.mode === "silhouette" ? "Silhueta" : question.mode === "trivia" ? "Curiosidade" : "Imagem") +
      '</p><h2>' + escapeHtml(question.prompt) + '</h2><div class="quiz-options">' +
      question.options.map(function (option, index) {
        return '<button class="quiz-option" data-answer="' + escapeHtml(option) +
          '"><span class="quiz-option-letter">' + String.fromCharCode(65 + index) +
          '</span>' + escapeHtml(option) + '</button>';
      }).join("") +
      '</div><div class="quiz-actions"><button class="btn btn-dark" id="quiz-next" disabled>' +
      (currentQuestionIndex === currentQuestions.length - 1 ? "Finalizar partida" : "Próxima pergunta") +
      '</button></div><p class="form-note" id="quiz-error" role="status"></p></div></div>';
    card.querySelectorAll("[data-answer]").forEach(function (button) {
      button.addEventListener("click", function () {
        currentAnswer = button.dataset.answer;
        card.querySelectorAll("[data-answer]").forEach(function (option) {
          option.classList.toggle("selected", option === button);
        });
        document.getElementById("quiz-next").disabled = false;
      });
    });
    document.getElementById("quiz-next").addEventListener("click", nextQuestion);
  }

  async function nextQuestion() {
    if (currentAnswer === null) return;
    var question = currentQuestions[currentQuestionIndex];
    submittedAnswers.push({ questionID: question.id, answer: currentAnswer });
    currentQuestionIndex += 1;
    currentAnswer = null;
    if (currentQuestionIndex < currentQuestions.length) {
      paintQuestion();
      return;
    }

    var card = document.getElementById("quiz-card");
    card.innerHTML = '<div class="empty-state">Salvando seu resultado...</div>';
    try {
      var result = await request("/quiz/tentativas", {
        method: "POST",
        body: JSON.stringify({ submissions: submittedAnswers })
      });
      paintResult(result);
    } catch (error) {
      card.innerHTML = '<div class="empty-state">' + escapeHtml(error.message) +
        '<p><button class="btn btn-small btn-dark" id="quiz-retry">Tentar novamente</button></p></div>';
      document.getElementById("quiz-retry").addEventListener("click", resetQuiz);
    }
  }

  function paintResult(result) {
    var unlocked = (result.newlyUnlocked || []).map(function (pokemon) {
      return '<div class="mini-pokemon"><span class="pokemon-art">' +
        escapeHtml(typeSymbol(pokemon.types)) + '</span><strong>' + escapeHtml(pokemon.name) +
        '</strong></div>';
    }).join("");
    document.getElementById("quiz-card").innerHTML =
      '<div class="result-banner"><p class="eyebrow">Partida concluída</p><h2>' +
      escapeHtml(result.score) + ' pontos</h2><p>Seu resultado foi registrado no painel.</p></div>' +
      '<div class="result-stats"><div><strong>' + escapeHtml(result.correct) +
      '</strong><small>Acertos</small></div><div><strong>' + escapeHtml(result.wrong) +
      '</strong><small>Erros</small></div><div><strong>' + escapeHtml(result.accuracy) +
      '%</strong><small>Precisão</small></div></div><div class="result-content">' +
      (unlocked ? '<p class="eyebrow">Novas descobertas</p><div class="recent-grid">' + unlocked + '</div>' :
        '<p class="muted">Continue jogando para encontrar novos Pokémon.</p>') +
      '<p style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin:22px 0 0">' +
      '<a class="btn btn-dark" href="/pokedex.html">Ver minha Pokédex</a>' +
      '<button class="btn btn-yellow" id="quiz-again">Jogar novamente</button></p></div>';
    document.getElementById("quiz-again").addEventListener("click", resetQuiz);
  }

  function resetQuiz() {
    currentQuestionIndex = 0;
    currentAnswer = null;
    submittedAnswers = [];
    paintQuestion();
  }

  async function initPerfil() {
    if (!requireSession()) return;
    var content = document.getElementById("profile-content");
    try {
      var overview = await request("/treinadores/visao-geral");
      var favorites = overview.collection.filter(function (item) { return item.favorite; });
      var attempts = overview.attempts.map(function (attempt) {
        var date = new Date(attempt.completedAt);
        return '<div class="history-item"><div><strong>' + escapeHtml(attempt.score) +
          ' pontos</strong><br><small>' + escapeHtml(date.toLocaleDateString("pt-BR")) +
          '</small></div><span class="history-badge">' + escapeHtml(attempt.accuracy) + '%</span></div>';
      }).join("");
      content.innerHTML =
        '<section class="profile-banner"><span class="profile-avatar">' +
        escapeHtml(trainer.nome.slice(0, 1).toUpperCase()) + '</span><div><p>Treinador Pokémon</p><h1>' +
        escapeHtml(trainer.nome) + '</h1><span>@' + escapeHtml(trainer.usuario) + ' · ' +
        escapeHtml(trainer.email) + '</span></div><button class="btn btn-outline btn-small" id="logout-button">Encerrar sessão</button></section>' +
        '<section class="stats-grid">' +
        statCard("✦", "Pokémon", overview.stats.unlocked, "desbloqueados") +
        statCard("◉", "Progresso", overview.stats.progress + "%", "da Pokédex") +
        statCard("♡", "Favoritos", overview.stats.favorites, "selecionados") +
        statCard("★", "Melhor pontuação", overview.stats.bestScore, "pontos") +
        '</section><div class="profile-grid"><section class="panel"><h2>Pokémon favoritos</h2>' +
        (favorites.length
          ? '<div class="recent-grid">' + favorites.slice(0, 8).map(function (item) {
            return '<div class="mini-pokemon"><span class="pokemon-art">' +
              escapeHtml(typeSymbol(item.types)) + '</span><strong>' + escapeHtml(item.name) +
              '</strong></div>';
          }).join("") + '</div>'
          : '<div class="empty-state">Marque Pokémon desbloqueados como favoritos na sua Pokédex.</div>') +
        '</section><section class="panel"><h2>Histórico de quizzes</h2>' +
        (attempts || '<div class="empty-state">Seu histórico aparecerá após a primeira partida.</div>') +
        '</section></div>';
      document.getElementById("logout-button").addEventListener("click", logout);
    } catch (error) {
      content.innerHTML = '<div class="empty-state">' + escapeHtml(error.message) + '</div>';
    }
  }

  async function logout() {
    try {
      await request("/treinadores/sair", { method: "POST" });
      clearSession();
      window.location.href = "/";
    } catch (error) {
      setMessage("profile-message", error.message);
    }
  }

  function init() {
    renderHeader();
    var page = document.body.dataset.page;
    if (page === "cadastro") initCadastro();
    if (page === "login") initLogin();
    if (page === "dashboard") initDashboard();
    if (page === "pokedex") initPokedex();
    if (page === "quiz") initQuiz();
    if (page === "perfil") initPerfil();
  }

  document.addEventListener("DOMContentLoaded", init);
}());
