const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const MAX_RESULTS = 5;

const CURRENT_VARIABLES = [
  "temperature_2m",
  "apparent_temperature",
  "weather_code",
  "wind_speed_10m",
  "relative_humidity_2m",
];
const DAILY_VARIABLES = ["temperature_2m_max", "temperature_2m_min"];

// Distingue los fallos de red, HTTP, respuesta malformada y error del servicio.
export class GeocodingError extends Error {
  constructor(kind, message, status = null) {
    super(message);
    this.name = "GeocodingError";
    this.kind = kind;
    this.status = status;
  }
}

// Conserva una categoría común para que app.js pueda presentar errores del pronóstico.
export class ForecastError extends Error {
  constructor(kind, message, status = null) {
    super(message);
    this.name = "ForecastError";
    this.kind = kind;
    this.status = status;
  }
}

// Busca ciudades y devuelve hasta cinco resultados validados de Open-Meteo.
export async function searchCities(query) {
  const name = typeof query === "string" ? query.trim() : "";
  if (!name) {
    throw new GeocodingError("input", "Ingresa el nombre de una ciudad para buscar.");
  }

  const url = new URL(GEOCODING_ENDPOINT);
  url.search = new URLSearchParams({
    name,
    count: String(MAX_RESULTS),
    language: "es",
  }).toString();

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new GeocodingError(
      "network",
      "No se pudo conectar con el servicio de búsqueda. Revisa tu conexión e inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    throw new GeocodingError(
      "http",
      `El servicio de búsqueda respondió con un error HTTP (${response.status}). Inténtalo más tarde.`,
      response.status,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new GeocodingError(
      "format",
      "El servicio de búsqueda devolvió una respuesta que no se pudo leer.",
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new GeocodingError(
      "format",
      "El servicio de búsqueda devolvió una respuesta inválida.",
    );
  }

  if (payload.error === true) {
    throw new GeocodingError(
      "service",
      "El servicio de búsqueda no pudo procesar la solicitud.",
    );
  }

  // Open-Meteo puede omitir `results` cuando no hay coincidencias.
  if (payload.results === undefined) {
    if (Number.isFinite(payload.generationtime_ms)) return [];

    throw new GeocodingError(
      "format",
      "El servicio de búsqueda devolvió una respuesta incompleta.",
    );
  }

  if (!Array.isArray(payload.results)) {
    throw new GeocodingError(
      "format",
      "El servicio de búsqueda devolvió resultados en un formato inesperado.",
    );
  }

  const results = payload.results.slice(0, MAX_RESULTS);
  const hasInvalidLocation = results.some((location) => (
    !location
    || typeof location !== "object"
    || typeof location.name !== "string"
    || !location.name.trim()
    || !Number.isFinite(location.latitude)
    || !Number.isFinite(location.longitude)
  ));

  if (hasInvalidLocation) {
    throw new GeocodingError(
      "format",
      "El servicio de búsqueda devolvió una ciudad con datos inválidos.",
    );
  }

  return results;
}

// Solicita el tiempo actual y cuatro días en la zona horaria de las coordenadas recibidas.
export async function getForecast(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ForecastError("input", "La ciudad seleccionada no tiene coordenadas válidas.");
  }

  const url = new URL(FORECAST_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_VARIABLES.join(","),
    daily: DAILY_VARIABLES.join(","),
    forecast_days: "4",
    timezone: "auto",
  }).toString();

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ForecastError(
      "network",
      "No se pudo conectar con el servicio meteorológico. Revisa tu conexión e inténtalo de nuevo.",
    );
  }

  if (!response.ok) {
    throw new ForecastError(
      "http",
      `El servicio meteorológico respondió con un error HTTP (${response.status}). Inténtalo más tarde.`,
      response.status,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ForecastError(
      "format",
      "El servicio meteorológico devolvió una respuesta que no se pudo leer.",
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ForecastError(
      "format",
      "El servicio meteorológico devolvió una respuesta inválida.",
    );
  }

  if (payload.error === true) {
    throw new ForecastError("service", "El servicio meteorológico no pudo completar la consulta.");
  }

  if (
    !payload.current
    || typeof payload.current !== "object"
    || Array.isArray(payload.current)
    || !payload.daily
    || typeof payload.daily !== "object"
    || Array.isArray(payload.daily)
  ) {
    throw new ForecastError(
      "format",
      "El servicio meteorológico devolvió datos incompletos o inesperados.",
    );
  }

  return {
    current: payload.current,
    currentUnits: payload.current_units ?? {},
    daily: payload.daily,
    dailyUnits: payload.daily_units ?? {},
  };
}
