(function () {
  "use strict";

  var app = window.PokemonApp;
  var content = document.getElementById("dashboard-content");

  async function loadDashboard() {
    if (!app.requireSession()) return;
    try {
      var overview = await app.request("/treinadores/visao-geral");
      var stats = overview.stats;
      var recent = overview.collection.slice(0, 4);
      var chart = overview.attempts.slice().reverse().map(function (attempt) {
        return '<div class="chart-bar" style="height:' + Math.max(8, Number(attempt.accuracy)) +
          '%"><span>' + app.escapeHtml(attempt.accuracy) + '%</span></div>';
      }).join("");
      var types = overview.topTypes.map(function (item) {
        var width = stats.unlocked ? Math.max(12, Math.round(item.count / stats.unlocked * 100)) : 0;
        return '<div class="type-row"><div class="type-row-label"><span>' +
          app.escapeHtml(item.type) + '</span><span>' + app.escapeHtml(item.count) + '</span></div>' +
          '<div class="type-track"><div class="type-fill" style="width:' + width + '%"></div></div></div>';
      }).join("");
      var recentCards = recent.map(function (item) {
        return '<div class="mini-pokemon"><span class="pokemon-art">' +
          app.escapeHtml(app.typeSymbol(item.types)) + '</span><strong>' + app.escapeHtml(item.name) +
          '</strong></div>';
      }).join("");
      content.innerHTML =
        '<section class="page-intro"><div><p class="eyebrow">Painel do treinador</p><h1>Aloha, ' +
        app.escapeHtml(app.getTrainer().nome) + '!</h1><p class="muted">Veja como sua jornada pelas ilhas está evoluindo.</p></div>' +
        '<a class="btn" href="/quiz.html">✦ Iniciar novo quiz</a></section>' +
        '<section class="stats-grid">' +
        app.statCard("✦", "Desbloqueados", stats.unlocked, "de " + stats.catalogSize) +
        app.statCard("◉", "Progresso", stats.progress + "%", "da Pokédex") +
        app.statCard("♡", "Favoritos", stats.favorites, "selecionados") +
        app.statCard("✧", "Quizzes", stats.quizzes, "concluídos") +
        app.statCard("◎", "Taxa de acerto", stats.accuracy + "%", "geral") +
        app.statCard("★", "Melhor pontuação", stats.bestScore, "pontos") +
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
      content.innerHTML = '<div class="empty-state">' + app.escapeHtml(error.message) +
        ' <button class="btn btn-small btn-dark" data-retry>Recarregar</button></div>';
      content.querySelector("[data-retry]").addEventListener("click", loadDashboard);
    }
  }

  if (content) loadDashboard();
}());
