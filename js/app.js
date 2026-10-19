import * as ui from "./ui.js";
import { searchCities } from "./api.js";

// Conecta el envío del formulario con la búsqueda y coordina los estados de la interfaz.
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#city-search");
const resultsList = document.querySelector(".results-list");
let isSearching = false;
let currentResults = [];
let selectedCity = null;

// Traduce las categorías de error del servicio en mensajes útiles para el usuario.
function getSearchErrorMessage(error) {
  if (error?.kind === "network") return error.message;
  if (error?.kind === "http") return error.message;
  if (error?.kind === "format") return error.message;

  return "No se pudo completar la búsqueda de ciudades. Inténtalo de nuevo.";
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSearching) return;

    const query = searchInput.value.trim();
    if (!query) {
      ui.setSearchInvalid(true);
      ui.showMessage("Ingresa el nombre de una ciudad para buscar.");
      searchInput.focus();
      return;
    }

    isSearching = true;
    currentResults = [];
    selectedCity = null;
    ui.clearResults();
    ui.showSelectedCity(null);
    ui.setSearchInvalid(false);
    ui.setLoading(true, "Buscando ciudades…");

    try {
      currentResults = (await searchCities(query)).slice(0, 5);
      ui.showResults(currentResults);

      if (currentResults.length === 0) {
        ui.showMessage("No se encontraron ciudades con ese nombre.");
      } else {
        ui.showMessage(
          `Se encontraron ${currentResults.length} coincidencia${currentResults.length === 1 ? "" : "s"}. Selecciona una ciudad de la lista.`,
        );
      }
    } catch (error) {
      ui.showError(getSearchErrorMessage(error));
    } finally {
      isSearching = false;
      ui.setLoading(false);
    }
  });

  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim()) ui.setSearchInvalid(false);
  });

  // Resuelve el índice de la opción pulsada contra los objetos originales de la API.
  resultsList?.addEventListener("click", (event) => {
    const resultButton = event.target.closest("[data-result-index]");
    if (!resultButton) return;

    const resultIndex = Number(resultButton.dataset.resultIndex);
    if (!Number.isInteger(resultIndex) || !currentResults[resultIndex]) return;

    selectedCity = currentResults[resultIndex];
    ui.setSelectedResult(resultIndex);
    ui.showSelectedCity(selectedCity);
    ui.showMessage(
      `Ciudad seleccionada: ${[selectedCity.name, selectedCity.admin1, selectedCity.country]
        .filter(Boolean)
        .join(", ")}.`,
    );
  });
} else {
  ui.showError("No se encontró el formulario de búsqueda en la página.");
}
