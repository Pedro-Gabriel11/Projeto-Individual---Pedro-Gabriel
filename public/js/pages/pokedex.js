(function () {
  "use strict";

  var app = window.PokemonApp;
  var items = [];
  var activeType = "Todos";
  var searchTerm = "";
  var grid = document.getElementById("pokemon-grid");

  function renderTypeTags(types) {
    return (types || []).map(function (type) {
      return '<span class="type-tag">' + app.escapeHtml(type) + '</span>';
    }).join("");
  }

  function renderPokedex() {
    if (!grid) return;
    var filtered = items.filter(function (item) {
      return (!searchTerm || item.name.toLocaleLowerCase("pt-BR").includes(searchTerm)) &&
        (activeType === "Todos" || item.types.includes(activeType));
    });
    grid.innerHTML = filtered.length ? filtered.map(function (item) {
      var label = item.unlocked ? item.name : "???";
      return '<article class="pokemon-card"><button class="pokemon-detail-trigger" data-pokemon-id="' +
        item.id + '" style="width:100%;padding:0;border:0;background:transparent;text-align:left;cursor:pointer">' +
        '<div class="pokemon-art ' + (item.unlocked ? "" : "locked") + '">' +
        '<span class="pokemon-number">#' + String(item.dexNumber).padStart(3, "0") + '</span>' +
        app.escapeHtml(item.unlocked ? app.typeSymbol(item.types) : "?") + '</div>' +
        '<h2>' + app.escapeHtml(label) + '</h2><div class="type-tags">' + renderTypeTags(item.types) +
        '</div></button>' +
        (item.unlocked ? '<button class="favorite-btn ' + (item.favorite ? "selected" : "") +
          '" data-favorite-id="' + item.id + '" aria-label="' +
          (item.favorite ? "Remover dos favoritos" : "Favoritar") + ' ' + app.escapeHtml(item.name) +
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
    if (count) count.textContent = items.filter(function (item) { return item.unlocked; }).length +
      " / " + items.length + " descobertos";
  }

  async function changeFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    var button = event.currentTarget;
    var item = items.find(function (pokemon) {
      return Number(pokemon.id) === Number(button.dataset.favoriteId);
    });
    if (!item) return;
    button.disabled = true;
    try {
      var result = await app.request("/treinadores/pokedex/" + item.id + "/favorito", {
        method: "PATCH",
        body: JSON.stringify({ favorite: !item.favorite })
      });
      item.favorite = result.favorite;
      renderPokedex();
    } catch (error) {
      app.setMessage("pokedex-message", error.message);
      button.disabled = false;
    }
  }

  function showPokemonDetails(event) {
    var item = items.find(function (pokemon) {
      return Number(pokemon.id) === Number(event.currentTarget.dataset.pokemonId);
    });
    if (!item) return;
    document.getElementById("pokemon-dialog-content").innerHTML =
      '<p class="eyebrow">Pokédex de Alola #' + String(item.dexNumber).padStart(3, "0") +
      '</p><h2>' + app.escapeHtml(item.unlocked ? item.name : "Pokémon não descoberto") + '</h2>' +
      (item.unlocked
        ? '<p class="muted">' + app.escapeHtml(item.category) + (item.height ? " · " + app.escapeHtml(item.height) : "") +
          '</p><p class="muted">' + app.escapeHtml(item.description) + '</p>'
        : '<p class="muted">Acerte uma pergunta sobre este Pokémon no quiz para revelá-lo e adicioná-lo à sua coleção.</p>');
    document.getElementById("pokemon-dialog").showModal();
  }

  async function init() {
    if (!app.requireSession()) return;
    try {
      items = await app.request("/treinadores/pokedex");
      var types = Array.from(new Set(items.reduce(function (all, item) {
        return all.concat(item.types);
      }, [])));
      var filters = document.getElementById("type-filters");
      filters.innerHTML = ["Todos"].concat(types).map(function (type) {
        return '<button class="filter-chip ' + (type === activeType ? "active" : "") +
          '" data-type="' + app.escapeHtml(type) + '">' + app.escapeHtml(type) + '</button>';
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
      app.setMessage("pokedex-message", error.message);
    }
  }

  if (grid) init();
}());
