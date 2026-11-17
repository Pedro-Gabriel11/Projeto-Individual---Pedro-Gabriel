(function () {
  "use strict";

  var app = window.PokemonApp;
  var questions = [];
  var questionIndex = 0;
  var answer = null;
  var submissions = [];
  var card = document.getElementById("quiz-card");

  function paintQuestion() {
    var question = questions[questionIndex];
    var percent = Math.round(((questionIndex + 1) / questions.length) * 100);
    card.innerHTML =
      '<div class="quiz-progress"><div class="quiz-progress-row"><span>Questão ' +
      (questionIndex + 1) + ' de ' + questions.length + '</span><span>' + percent +
      '%</span></div><div class="progress-track"><div class="progress-fill" style="width:' +
      percent + '%"></div></div></div><div class="quiz-content"><div class="quiz-art"><div class="pokemon-art ' +
      (question.mode === "silhouette" ? "silhouette silhouette-" + app.escapeHtml(question.silhouetteKey) : "") + '">' +
      (question.mode === "trivia" ? "?" : "") +
      '</div></div><div class="quiz-question"><p class="eyebrow">' +
      (question.mode === "silhouette" ? "Silhueta" : question.mode === "trivia" ? "Curiosidade" : "Imagem") +
      '</p><h2>' + app.escapeHtml(question.prompt) + '</h2><div class="quiz-options">' +
      question.options.map(function (option, index) {
        return '<button class="quiz-option" data-answer="' + app.escapeHtml(option) +
          '"><span class="quiz-option-letter">' + String.fromCharCode(65 + index) +
          '</span>' + app.escapeHtml(option) + '</button>';
      }).join("") +
      '</div><div class="quiz-actions"><button class="btn btn-dark" id="quiz-next" disabled>' +
      (questionIndex === questions.length - 1 ? "Finalizar partida" : "Próxima pergunta") +
      '</button></div><p class="form-note" id="quiz-error" role="status"></p></div></div>';

    card.querySelectorAll("[data-answer]").forEach(function (button) {
      button.addEventListener("click", function () {
        answer = button.dataset.answer;
        card.querySelectorAll("[data-answer]").forEach(function (option) {
          option.classList.toggle("selected", option === button);
        });
        document.getElementById("quiz-next").disabled = false;
      });
    });
    document.getElementById("quiz-next").addEventListener("click", nextQuestion);
  }

  async function nextQuestion() {
    if (answer === null) return;
    submissions.push({ questionID: questions[questionIndex].id, answer: answer });
    questionIndex += 1;
    answer = null;
    if (questionIndex < questions.length) {
      paintQuestion();
      return;
    }

    card.innerHTML = '<div class="empty-state">Salvando seu resultado...</div>';
    try {
      paintResult(await app.request("/quiz/tentativas", {
        method: "POST",
        body: JSON.stringify({ submissions: submissions })
      }));
    } catch (error) {
      card.innerHTML = '<div class="empty-state">' + app.escapeHtml(error.message) +
        '<p><button class="btn btn-small btn-dark" id="quiz-retry">Tentar novamente</button></p></div>';
      document.getElementById("quiz-retry").addEventListener("click", resetQuiz);
    }
  }

  function paintResult(result) {
    var unlocked = (result.newlyUnlocked || []).map(function (pokemon) {
      return '<div class="mini-pokemon"><span class="pokemon-art">' +
        app.escapeHtml(app.typeSymbol(pokemon.types)) + '</span><strong>' + app.escapeHtml(pokemon.name) +
        '</strong></div>';
    }).join("");
    card.innerHTML =
      '<div class="result-banner"><p class="eyebrow">Partida concluída</p><h2>' +
      app.escapeHtml(result.score) + ' pontos</h2><p>Seu resultado foi registrado no painel.</p></div>' +
      '<div class="result-stats"><div><strong>' + app.escapeHtml(result.correct) +
      '</strong><small>Acertos</small></div><div><strong>' + app.escapeHtml(result.wrong) +
      '</strong><small>Erros</small></div><div><strong>' + app.escapeHtml(result.accuracy) +
      '%</strong><small>Precisão</small></div></div><div class="result-content">' +
      (unlocked ? '<p class="eyebrow">Novas descobertas</p><div class="recent-grid">' + unlocked + '</div>' :
        '<p class="muted">Continue jogando para encontrar novos Pokémon.</p>') +
      '<p style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin:22px 0 0">' +
      '<a class="btn btn-dark" href="/pokedex.html">Ver minha Pokédex</a>' +
      '<button class="btn btn-yellow" id="quiz-again">Jogar novamente</button></p></div>';
    document.getElementById("quiz-again").addEventListener("click", resetQuiz);
  }

  function resetQuiz() {
    questionIndex = 0;
    answer = null;
    submissions = [];
    paintQuestion();
  }

  async function init() {
    if (!app.requireSession()) return;
    try {
      questions = await app.request("/quiz/perguntas");
      if (!questions.length) {
        app.setMessage("quiz-message", "Ainda não há perguntas disponíveis.");
        return;
      }
      paintQuestion();
    } catch (error) {
      app.setMessage("quiz-message", error.message);
    }
  }

  if (card) init();
}());
