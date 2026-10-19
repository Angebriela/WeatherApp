import * as ui from "./ui.js";

// Conecta el envío del formulario y mantiene la búsqueda en su estado inicial, sin API.
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#city-search");

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) {
      ui.setSearchInvalid(true);
      ui.showMessage("Ingresa el nombre de una ciudad para buscar.");
      searchInput.focus();
      return;
    }

    ui.setSearchInvalid(false);
    ui.showMessage(
      `Búsqueda recibida para “${query}”. La consulta del clima estará disponible en una siguiente tarea.`,
    );
  });

  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim()) ui.setSearchInvalid(false);
  });
} else {
  ui.showError("No se encontró el formulario de búsqueda en la página.");
}
