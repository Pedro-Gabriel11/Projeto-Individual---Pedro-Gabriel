(function () {
  "use strict";

  var app = window.PokemonApp;
  var form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var button = form.querySelector('[type="submit"]');
    button.disabled = true;
    app.setMessage("login-message", "");
    try {
      var data = await app.request("/treinadores/autenticar", {
        method: "POST",
        body: JSON.stringify({
          conta: form.elements.conta.value.trim(),
          senha: form.elements.senha.value
        })
      });
      app.saveSession(data);
      window.location.href = "/dashboard.html";
    } catch (error) {
      app.setMessage("login-message", error.message);
    } finally {
      button.disabled = false;
    }
  });
}());
