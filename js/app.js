import * as ui from "./ui.js";
import { getForecast, searchCities } from "./api.js";

// Conecta el envío del formulario con la búsqueda y coordina los estados de la interfaz.
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#city-search");
const resultsList = document.querySelector(".results-list");
let currentResults = [];
let selectedCity = null;
let geocodingRequestId = 0;
let geocodingController = null;
let forecastRequestId = 0;
let forecastController = null;

// Traduce las categorías de error del servicio en mensajes útiles para el usuario.
function getSearchErrorMessage(error) {
  if (error?.kind === "network") return error.message;
  if (error?.kind === "http") return error.message;
  if (error?.kind === "format") return error.message;

  return "No se pudo completar la búsqueda de ciudades. Inténtalo de nuevo.";
}

// Mantiene los fallos del pronóstico diferenciados de los errores de geocodificación.
function getForecastErrorMessage(error) {
  if (error?.kind === "network" || error?.kind === "http" || error?.kind === "format") {
    return error.message;
  }

  return error?.message || "No se pudo consultar el pronóstico. Inténtalo de nuevo.";
}

// Cancela el pronóstico anterior e invalida su permiso para actualizar la interfaz.
function invalidateForecastRequest() {
  forecastRequestId += 1;
  forecastController?.abort();
  forecastController = null;
}

// Traduce los códigos WMO recibidos por Open-Meteo a descripciones en español.
const WEATHER_DESCRIPTIONS = {
  0: "Cielo despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nevada ligera",
  73: "Nevada moderada",
  75: "Nevada intensa",
  77: "Granizo pequeño",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos intensos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta eléctrica",
  96: "Tormenta eléctrica con granizo ligero",
  97: "Tormenta eléctrica intensa",
  99: "Tormenta eléctrica con granizo intenso",
};

// Añade solo las unidades que entrega la API y conserva los campos ausentes como null.
function formatMeasurement(value, unit) {
  if (value === undefined || value === null || value === "") return null;
  return unit ? `${value} ${unit}` : String(value);
}

// Prepara el clima actual para la capa de presentación sin manipular el DOM.
function prepareCurrentWeather(forecast) {
  const { current, currentUnits } = forecast;
  const weatherCode = current.weather_code;

  return {
    temperature: formatMeasurement(current.temperature_2m, currentUnits.temperature_2m),
    apparentTemperature: formatMeasurement(
      current.apparent_temperature,
      currentUnits.apparent_temperature,
    ),
    condition: weatherCode === undefined || weatherCode === null
      ? null
      : WEATHER_DESCRIPTIONS[weatherCode] ?? "Condición meteorológica desconocida",
    windSpeed: formatMeasurement(current.wind_speed_10m, currentUnits.wind_speed_10m),
    humidity: formatMeasurement(
      current.relative_humidity_2m,
      currentUnits.relative_humidity_2m,
    ),
  };
}

// Selecciona tres fechas posteriores a la fecha local que devuelve Forecast API.
function prepareDailyForecast(forecast) {
  const { current, daily, dailyUnits } = forecast;
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const currentLocalDate = typeof current.time === "string"
    ? current.time.slice(0, 10)
    : dates[0];
  const isIsoDate = (date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const futureEntries = dates
    .map((date, index) => ({ date, index }))
    .filter(({ date }) => isIsoDate(date) && isIsoDate(currentLocalDate) && date > currentLocalDate)
    .slice(0, 3);
  const maximums = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const minimums = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
  const days = futureEntries.map(({ date, index }) => ({
    date,
    temperatureMax: formatMeasurement(
      maximums[index],
      dailyUnits.temperature_2m_max,
    ),
    temperatureMin: formatMeasurement(
      minimums[index],
      dailyUnits.temperature_2m_min,
    ),
  }));
  const isIncomplete = days.length < 3 || days.some((day) => (
    day.temperatureMax === null || day.temperatureMin === null
  ));

  return { days, isIncomplete };
}

// Solicita pronóstico para la ciudad elegida y presenta sus datos sin cambiar su selección.
async function loadSelectedCityForecast(city) {
  const requestId = ++forecastRequestId;
  forecastController?.abort();
  const controller = new AbortController();
  forecastController = controller;

  ui.clearWeather("Consultando condiciones para la ciudad seleccionada…");
  ui.clearForecast("Consultando el pronóstico para la ciudad seleccionada…");
  ui.setLoading(true, "Consultando el clima y el pronóstico…");

  try {
    const forecast = await getForecast(city.latitude, city.longitude, {
      signal: controller.signal,
    });
    if (requestId !== forecastRequestId || selectedCity !== city) return;

    const dailyForecast = prepareDailyForecast(forecast);

    ui.showWeather(prepareCurrentWeather(forecast));
    ui.showForecast(dailyForecast.days, dailyForecast.isIncomplete);

    if (dailyForecast.isIncomplete) {
      ui.showMessage("El pronóstico está incompleto; se muestran los datos disponibles.");
    } else {
      ui.showMessage(`Clima actualizado para ${city.name}.`);
    }
  } catch (error) {
    if (requestId !== forecastRequestId || error?.kind === "aborted") return;

    ui.clearWeather("Los datos actuales no están disponibles.");
    ui.clearForecast("El pronóstico no está disponible.");
    ui.showError(getForecastErrorMessage(error));
  } finally {
    if (requestId === forecastRequestId) {
      if (forecastController === controller) forecastController = null;
      ui.setLoading(false);
    }
  }
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) {
      ui.setSearchInvalid(true);
      ui.showMessage("Ingresa el nombre de una ciudad para buscar.");
      searchInput.focus();
      return;
    }

    const requestId = ++geocodingRequestId;
    geocodingController?.abort();
    const controller = new AbortController();
    geocodingController = controller;

    invalidateForecastRequest();
    currentResults = [];
    selectedCity = null;
    ui.clearResults();
    ui.clearWeather();
    ui.clearForecast();
    ui.showSelectedCity(null);
    ui.setSearchInvalid(false);
    ui.setLoading(true, "Buscando ciudades…");

    try {
      const results = await searchCities(query, { signal: controller.signal });
      if (requestId !== geocodingRequestId) return;

      currentResults = results.slice(0, 5);
      ui.showResults(currentResults);

      if (currentResults.length === 0) {
        ui.showMessage("No se encontraron ciudades con ese nombre.");
      } else {
        ui.showMessage(
          `Se encontraron ${currentResults.length} coincidencia${currentResults.length === 1 ? "" : "s"}. Selecciona una ciudad de la lista.`,
        );
      }
    } catch (error) {
      if (requestId !== geocodingRequestId || error?.kind === "aborted") return;

      ui.showError(getSearchErrorMessage(error));
    } finally {
      if (requestId === geocodingRequestId) {
        if (geocodingController === controller) geocodingController = null;
        ui.setLoading(false);
      }
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
    void loadSelectedCityForecast(selectedCity);
  });
} else {
  ui.showError("No se encontró el formulario de búsqueda en la página.");
}
