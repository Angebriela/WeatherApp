const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const MAX_RESULTS = 5;

// Distingue los fallos de red, HTTP, respuesta malformada y error del servicio.
export class GeocodingError extends Error {
  constructor(kind, message, status = null) {
    super(message);
    this.name = "GeocodingError";
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
