(function () {
  "use strict";

  var API = "/api";
  var TOKEN_KEY = "pokemon_trainer_token";
  var USER_KEY = "pokemon_trainer_user";
  var RETURN_KEY = "pokemon_trainer_return_to";
  var PROTECTED_PAGES = ["/dashboard.html", "/pokedex.html", "/quiz.html", "/perfil.html"];

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
      var requestedPage = window.location.pathname;
      if (PROTECTED_PAGES.indexOf(requestedPage) !== -1) {
        sessionStorage.setItem(RETURN_KEY, requestedPage + window.location.search + window.location.hash);
      }
      clearSession();
      window.location.href = "/login.html";
    }
    if (response.status === 204) return null;
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.mensagem || "Não foi possível concluir a solicitação.");
    return payload;
  }

  function setMessage(id, message) {
    var elements = document.querySelectorAll("#" + id + ', [data-message-id="' + id + '"]');
    elements.forEach(function (element) { element.textContent = message || ""; });
  }

  function requireSession() {
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      var requestedPage = window.location.pathname;
      if (PROTECTED_PAGES.indexOf(requestedPage) !== -1) {
        sessionStorage.setItem(RETURN_KEY, requestedPage + window.location.search + window.location.hash);
      }
      window.location.replace("/login.html");
      return false;
    }
    return true;
  }

  function getPostLoginTarget() {
    var target = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    if (!target) return "/dashboard.html";

    try {
      var url = new URL(target, window.location.origin);
      if (url.origin === window.location.origin && PROTECTED_PAGES.indexOf(url.pathname) !== -1) {
        return url.pathname + url.search + url.hash;
      }
    } catch (error) {
      return "/dashboard.html";
    }
    return "/dashboard.html";
  }

  function renderHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;
    var trainer = getTrainer();
    var signedIn = Boolean(trainer && sessionStorage.getItem(TOKEN_KEY));
    var currentPage = document.body.dataset.page;
    function link(url, label, page) {
      var current = currentPage === page ? ' aria-current="page"' : "";
      return '<a href="' + url + '"' + current + '>' + label + '</a>';
    }

    var pageLinks =
      link("/", "Início", "inicio") + link("/#descobrir", "Descobrir", "descobrir") +
      link("/historia.html", "Minha história", "historia") +
      link("/dashboard.html", "Painel", "dashboard") + link("/pokedex.html", "Pokédex", "pokedex") +
      link("/quiz.html", "Quiz", "quiz") + link("/perfil.html", "Perfil", "perfil");
    var signupLink = '<a class="nav-cta' + (currentPage === "cadastro" ? " current" : "") +
      '" href="/cadastro.html"' + (currentPage === "cadastro" ? ' aria-current="page"' : "") +
      '>Começar</a>';
    var accountLinks = signedIn
      ? '<span class="nav-user"><span class="nav-avatar">' + escapeHtml(trainer.nome.slice(0, 1).toUpperCase()) +
        '</span>' + escapeHtml("@" + trainer.usuario) + '</span>' +
        '<button class="nav-logout" type="button" data-logout>Sair</button>'
      : link("/login.html", "Entrar", "login") + signupLink;
    var nav = '<nav class="site-nav" aria-label="Navegação principal">' + pageLinks + accountLinks +
      (signedIn ? '<span class="nav-message" id="nav-message" role="status" aria-live="polite"></span>' : "") +
      '</nav>';
    header.innerHTML =
      '<div class="site-header-inner"><a class="brand" href="/" aria-label="Pokémon Trainer Hub, página inicial">' +
      '<span class="brand-mark" aria-hidden="true"></span><span class="brand-name"><small>Pokémon</small>' +
      '<strong>Trainer Hub</strong></span></a>' + nav + '</div>' +
      '<nav class="mobile-nav" aria-label="Navegação móvel">' + pageLinks + accountLinks +
      (signedIn ? '<span class="nav-message" data-message-id="nav-message" role="status" aria-live="polite"></span>' : "") +
      '</nav>';
    header.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", logout);
    });
  }

  async function logout() {
    var buttons = document.querySelectorAll("[data-logout]");
    buttons.forEach(function (button) { button.disabled = true; });
    try {
      await request("/treinadores/sair", { method: "POST" });
      clearSession();
      window.location.href = "/";
    } catch (error) {
      setMessage("nav-message", error.message);
      buttons.forEach(function (button) { button.disabled = false; });
    }
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
    getPostLoginTarget: getPostLoginTarget,
    request: request,
    requireSession: requireSession,
    saveSession: saveSession,
    setMessage: setMessage,
    statCard: statCard,
    typeSymbol: typeSymbol
  };

  document.addEventListener("DOMContentLoaded", renderHeader);
}());
