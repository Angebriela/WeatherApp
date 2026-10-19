// Centraliza los elementos de presentación existentes en el HTML inicial.
const searchInput = document.querySelector("#city-search");
const statusRegion = document.querySelector(".status-region");
const statusText = statusRegion?.querySelector("span:last-child");
const errorMessage = document.querySelector(".error-message");
const resultsSection = document.querySelector(".results-section");
const resultsList = document.querySelector(".results-list");
const resultsEmptyNote = resultsSection?.querySelector(".empty-note");
const currentWeather = document.querySelector(".current-weather");
const currentWeatherEmptyNote = currentWeather?.querySelector(".empty-note");
const currentWeatherValues = currentWeather?.querySelectorAll(".weather-detail dd");
const forecastSection = document.querySelector(".forecast-section");
const forecastList = document.querySelector(".forecast-list");
const forecastEmptyNote = forecastSection?.querySelector(".empty-note");
const favoritesSection = document.querySelector(".favorites-section");
const favoritesList = document.querySelector(".favorites-list");
const favoritesEmptyNote = favoritesSection?.querySelector(".empty-note");

// Actualiza el mensaje de estado en una región que tecnologías de asistencia anuncian.
export function showMessage(message) {
  if (statusText) statusText.textContent = message;
  if (errorMessage) errorMessage.hidden = true;
}

// Expone visual y accesiblemente el estado de una operación pendiente.
export function setLoading(isLoading, message = "Cargando…") {
  if (statusRegion) statusRegion.setAttribute("aria-busy", String(isLoading));
  if (resultsSection) resultsSection.setAttribute("aria-busy", String(isLoading));
  showMessage(isLoading ? message : "Escribe una ciudad para comenzar.");
}

// Presenta errores en la región de alerta definida en el documento.
export function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }
  if (statusRegion) statusRegion.setAttribute("aria-busy", "false");
}

// Marca el campo de búsqueda como inválido sin decidir la regla de negocio.
export function setSearchInvalid(isInvalid) {
  if (!searchInput) return;

  if (isInvalid) {
    searchInput.setAttribute("aria-invalid", "true");
  } else {
    searchInput.removeAttribute("aria-invalid");
  }
}

// Renderiza opciones de ciudad como texto seguro, sin agregar selección ni eventos.
export function showResults(results = []) {
  if (!resultsList) return;

  resultsList.replaceChildren();
  const hasResults = Array.isArray(results) && results.length > 0;

  if (resultsEmptyNote) {
    resultsEmptyNote.hidden = hasResults;
    if (!hasResults) resultsEmptyNote.textContent = "No se encontraron ciudades.";
  }

  if (!hasResults) return;

  for (const result of results) {
    const item = document.createElement("li");
    const details = [result.name, result.admin1, result.country]
      .filter(Boolean)
      .join(", ");
    const coordinates = [result.latitude, result.longitude]
      .every((coordinate) => (
        coordinate !== undefined
        && coordinate !== null
        && coordinate !== ""
        && Number.isFinite(Number(coordinate))
      ))
      ? ` (${result.latitude}, ${result.longitude})`
      : "";

    item.textContent = `${details || "Ciudad"}${coordinates}`;
    resultsList.append(item);
  }
}

// Muestra los cinco datos meteorológicos actuales en el orden del HTML.
export function showWeather(weather = {}) {
  if (!currentWeatherValues) return;

  const fields = [
    weather.temperature,
    weather.apparentTemperature,
    weather.condition,
    weather.windSpeed,
    weather.humidity,
  ];
  const hasData = fields.some((value) => (
    value !== undefined && value !== null && value !== ""
  ));

  currentWeatherValues.forEach((element, index) => {
    const value = fields[index];
    element.textContent = value === undefined || value === null || value === ""
      ? "No disponible"
      : String(value);
  });

  if (currentWeatherEmptyNote) currentWeatherEmptyNote.hidden = hasData;
}

// Renderiza tarjetas de pronóstico; recibe datos ya preparados por la lógica de aplicación.
export function showForecast(days = []) {
  if (!forecastList) return;

  forecastList.replaceChildren();
  const hasDays = Array.isArray(days) && days.length > 0;
  if (forecastEmptyNote) forecastEmptyNote.hidden = hasDays;
  if (!hasDays) return;

  for (const [index, day] of days.entries()) {
    const item = document.createElement("li");
    const heading = document.createElement("h3");
    const temperatures = document.createElement("p");
    const date = day.date ?? day.time ?? `Día ${index + 1}`;
    const maximum = day.temperatureMax ?? day.max ?? "No disponible";
    const minimum = day.temperatureMin ?? day.min ?? "No disponible";

    heading.textContent = String(date);
    temperatures.textContent = `Máx.: ${maximum} · Mín.: ${minimum}`;
    item.append(heading, temperatures);
    forecastList.append(item);
  }
}

// Renderiza los nombres de favoritas sin gestionar su persistencia ni sus acciones.
export function showFavorites(favorites = []) {
  if (!favoritesList) return;

  favoritesList.replaceChildren();
  const hasFavorites = Array.isArray(favorites) && favorites.length > 0;
  if (favoritesEmptyNote) favoritesEmptyNote.hidden = hasFavorites;
  if (!hasFavorites) return;

  for (const favorite of favorites) {
    const item = document.createElement("li");
    item.textContent = String(favorite.name ?? "Ciudad favorita");
    favoritesList.append(item);
  }
}
