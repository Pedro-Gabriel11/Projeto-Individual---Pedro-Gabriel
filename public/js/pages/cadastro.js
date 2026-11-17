(function () {
  "use strict";

  var app = window.PokemonApp;
  var form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var button = form.querySelector('[type="submit"]');
    button.disabled = true;
    app.setMessage("signup-message", "");
    try {
      if (form.elements.senha.value !== form.elements.confirmacao.value) {
        throw new Error("As senhas não correspondem.");
      }
      var data = await app.request("/treinadores/cadastrar", {
        method: "POST",
        body: JSON.stringify({
          nome: form.elements.nome.value.trim(),
          usuario: form.elements.usuario.value.trim().toLowerCase(),
          email: form.elements.email.value.trim(),
          senha: form.elements.senha.value
        })
      });
      app.saveSession(data);
      window.location.href = "/dashboard.html";
    } catch (error) {
      app.setMessage("signup-message", error.message);
    } finally {
      button.disabled = false;
    }
  });
}());
