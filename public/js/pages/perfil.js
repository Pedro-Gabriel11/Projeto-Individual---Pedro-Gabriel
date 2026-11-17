(function () {
  "use strict";

  var app = window.PokemonApp;
  var content = document.getElementById("profile-content");

  async function logout() {
    try {
      await app.request("/treinadores/sair", { method: "POST" });
      app.clearSession();
      window.location.href = "/";
    } catch (error) {
      app.setMessage("profile-message", error.message);
    }
  }

  async function init() {
    if (!app.requireSession()) return;
    try {
      var overview = await app.request("/treinadores/visao-geral");
      var trainer = app.getTrainer();
      var favorites = overview.collection.filter(function (item) { return item.favorite; });
      var attempts = overview.attempts.map(function (attempt) {
        return '<div class="history-item"><div><strong>' + app.escapeHtml(attempt.score) +
          ' pontos</strong><br><small>' + app.escapeHtml(new Date(attempt.completedAt).toLocaleDateString("pt-BR")) +
          '</small></div><span class="history-badge">' + app.escapeHtml(attempt.accuracy) + '%</span></div>';
      }).join("");

      content.innerHTML =
        '<section class="profile-banner"><span class="profile-avatar">' +
        app.escapeHtml(trainer.nome.slice(0, 1).toUpperCase()) + '</span><div><p>Treinador Pokémon</p><h1>' +
        app.escapeHtml(trainer.nome) + '</h1><span>@' + app.escapeHtml(trainer.usuario) + ' · ' +
        app.escapeHtml(trainer.email) + '</span></div><button class="btn btn-outline btn-small" id="logout-button">Encerrar sessão</button></section>' +
        '<section class="stats-grid">' +
        app.statCard("✦", "Pokémon", overview.stats.unlocked, "desbloqueados") +
        app.statCard("◉", "Progresso", overview.stats.progress + "%", "da Pokédex") +
        app.statCard("♡", "Favoritos", overview.stats.favorites, "selecionados") +
        app.statCard("★", "Melhor pontuação", overview.stats.bestScore, "pontos") +
        '</section><div class="profile-grid"><section class="panel"><h2>Pokémon favoritos</h2>' +
        (favorites.length
          ? '<div class="recent-grid">' + favorites.slice(0, 8).map(function (item) {
            return '<div class="mini-pokemon"><span class="pokemon-art">' +
              app.escapeHtml(app.typeSymbol(item.types)) + '</span><strong>' + app.escapeHtml(item.name) +
              '</strong></div>';
          }).join("") + '</div>'
          : '<div class="empty-state">Marque Pokémon desbloqueados como favoritos na sua Pokédex.</div>') +
        '</section><section class="panel"><h2>Histórico de quizzes</h2>' +
        (attempts || '<div class="empty-state">Seu histórico aparecerá após a primeira partida.</div>') +
        '</section></div>';
      document.getElementById("logout-button").addEventListener("click", logout);
    } catch (error) {
      content.innerHTML = '<div class="empty-state">' + app.escapeHtml(error.message) + '</div>';
    }
  }

  if (content) init();
}());
