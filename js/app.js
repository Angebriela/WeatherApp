import * as ui from "./ui.js";
import { searchCities } from "./api.js";

// Conecta el envío del formulario con la búsqueda y coordina los estados de la interfaz.
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#city-search");
let isSearching = false;

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
    ui.setSearchInvalid(false);
    ui.setLoading(true, "Buscando ciudades…");

    try {
      const results = await searchCities(query);

      if (results.length === 0) {
        ui.showMessage("No se encontraron ciudades con ese nombre.");
      } else {
        ui.showMessage(
          `Búsqueda completada: ${results.length} coincidencia${results.length === 1 ? "" : "s"}. La presentación y selección estarán disponibles en la siguiente tarea.`,
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
} else {
  ui.showError("No se encontró el formulario de búsqueda en la página.");
}
