// Centraliza los elementos de presentación existentes en el HTML inicial.
const searchInput = document.querySelector("#city-search");
const statusRegion = document.querySelector(".status-region");
const statusText = statusRegion?.querySelector("span:last-child");
const errorMessage = document.querySelector(".error-message");
const resultsSection = document.querySelector(".results-section");
const resultsList = document.querySelector(".results-list");
const resultsEmptyNote = resultsSection?.querySelector(".empty-note");
const selectedLocationLabel = document.querySelector(".location-label");
const currentWeather = document.querySelector(".current-weather");
const currentWeatherEmptyNote = currentWeather?.querySelector(".empty-note");
const currentWeatherValues = currentWeather?.querySelectorAll(".weather-detail dd");
const forecastSection = document.querySelector(".forecast-section");
const forecastList = document.querySelector(".forecast-list");
const forecastEmptyNote = forecastSection?.querySelector(".empty-note");
const forecastIncompleteNote = forecastSection
  ? document.createElement("p")
  : null;
const favoritesSection = document.querySelector(".favorites-section");
const favoritesList = document.querySelector(".favorites-list");
const favoritesEmptyNote = favoritesSection?.querySelector(".empty-note");

// Prepara una región accesible para avisar que el pronóstico tiene datos faltantes.
if (forecastIncompleteNote) {
  forecastIncompleteNote.className = "forecast-incomplete-message";
  forecastIncompleteNote.setAttribute("role", "status");
  forecastIncompleteNote.setAttribute("aria-live", "polite");
  forecastIncompleteNote.hidden = true;
  forecastIncompleteNote.textContent = "El pronóstico está incompleto; se muestran los datos disponibles.";
  forecastSection.append(forecastIncompleteNote);
}

// Actualiza el mensaje de estado en una región que tecnologías de asistencia anuncian.
export function showMessage(message) {
  if (statusText) statusText.textContent = message;
  if (errorMessage) errorMessage.hidden = true;
}

// Expone visual y accesiblemente el estado de una operación pendiente.
export function setLoading(isLoading, message = "Cargando…") {
  if (statusRegion) statusRegion.setAttribute("aria-busy", String(isLoading));
  if (resultsSection) resultsSection.setAttribute("aria-busy", String(isLoading));
  if (isLoading) showMessage(message);
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

// Limpia resultados anteriores sin confundir la carga de una búsqueda con cero coincidencias.
export function clearResults() {
  resultsList?.replaceChildren();
  if (resultsEmptyNote) resultsEmptyNote.hidden = true;
}

// Renderiza como máximo cinco opciones accesibles sin cambiar el orden recibido.
export function showResults(results = []) {
  if (!resultsList) return;

  resultsList.replaceChildren();
  const visibleResults = Array.isArray(results) ? results.slice(0, 5) : [];
  const hasResults = visibleResults.length > 0;

  if (resultsEmptyNote) {
    resultsEmptyNote.hidden = hasResults;
    if (!hasResults) resultsEmptyNote.textContent = "No se encontraron ciudades.";
  }

  if (!hasResults) return;

  for (const [index, result] of visibleResults.entries()) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const name = document.createElement("strong");
    const location = document.createElement("span");
    const coordinates = document.createElement("span");
    const locationDetails = [result.admin1, result.admin2, result.country]
      .filter(Boolean)
      .join(", ");

    button.type = "button";
    button.className = "city-result-button";
    button.dataset.resultIndex = String(index);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute(
      "aria-label",
      `Seleccionar ${result.name}${locationDetails ? `, ${locationDetails}` : ""}, coordenadas ${result.latitude}, ${result.longitude}`,
    );

    name.className = "city-result-name";
    name.textContent = result.name;
    location.className = "city-result-location";
    location.textContent = locationDetails || "Región o país no disponible";
    coordinates.className = "city-result-coordinates";
    coordinates.textContent = `Coordenadas: ${result.latitude}, ${result.longitude}`;

    button.append(name, location, coordinates);
    item.append(button);
    resultsList.append(item);
  }
}

// Refleja qué resultado está seleccionado tanto visualmente como para lectores de pantalla.
export function setSelectedResult(selectedIndex) {
  resultsList?.querySelectorAll("[data-result-index]").forEach((button) => {
    const isSelected = Number(button.dataset.resultIndex) === selectedIndex;
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

// Actualiza la etiqueta de ubicación sin solicitar ni presentar datos meteorológicos.
export function showSelectedCity(city) {
  if (!selectedLocationLabel) return;

  if (!city) {
    selectedLocationLabel.textContent = "Selecciona una ciudad";
    return;
  }

  selectedLocationLabel.textContent = [city.name, city.admin1, city.country]
    .filter(Boolean)
    .join(", ");
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
  currentWeatherValues.forEach((element, index) => {
    const value = fields[index];
    element.textContent = value === undefined || value === null || value === ""
      ? "No disponible"
      : String(value);
  });

  if (currentWeatherEmptyNote) currentWeatherEmptyNote.hidden = true;
}

// Renderiza tarjetas de pronóstico; recibe datos ya preparados por la lógica de aplicación.
export function showForecast(days = [], isIncomplete = false) {
  if (!forecastList) return;

  forecastList.replaceChildren();
  const hasDays = Array.isArray(days) && days.length > 0;
  if (forecastEmptyNote) forecastEmptyNote.hidden = hasDays;
  if (forecastEmptyNote && !hasDays) {
    forecastEmptyNote.textContent = "No hay datos disponibles para el pronóstico.";
  }
  if (forecastIncompleteNote) forecastIncompleteNote.hidden = !isIncomplete;
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
