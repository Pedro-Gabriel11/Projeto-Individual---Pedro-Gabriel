(function () {
  "use strict";

  var API = "/api";
  var TOKEN_KEY = "pokemon_trainer_token";
  var USER_KEY = "pokemon_trainer_user";

  function getTrainer() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function saveSession(data) {
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.treinador));
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
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
    var page = document.body.dataset.page;
    if (response.status === 401 && page !== "login" && page !== "cadastro") {
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

  function requireSession() {
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      window.location.replace("/login.html");
      return false;
    }
    return true;
  }

  function renderHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    var trainer = getTrainer();
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

  function statCard(icon, label, value, helper) {
    return '<article class="stat-card"><span class="stat-icon">' + icon + '</span><small>' +
      escapeHtml(label) + '</small><strong>' + escapeHtml(value) + '</strong>' +
      (helper ? '<small>' + escapeHtml(helper) + '</small>' : '') + '</article>';
  }

  function typeSymbol(types) {
    var type = Array.isArray(types) ? types[0] : "";
    return { Grama: "✿", Fogo: "♨", Água: "≈", Elétrico: "ϟ", Voador: "⌁" }[type] || "✦";
  }

  window.PokemonApp = {
    clearSession: clearSession,
    escapeHtml: escapeHtml,
    getTrainer: getTrainer,
    request: request,
    requireSession: requireSession,
    saveSession: saveSession,
    setMessage: setMessage,
    statCard: statCard,
    typeSymbol: typeSymbol
  };

  document.addEventListener("DOMContentLoaded", renderHeader);
}());
