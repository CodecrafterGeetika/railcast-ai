import type { WeatherRisk, WeatherResult } from "./weatherTypes";

function isSevereConditionId(id: number): boolean {
  return (
    (id >= 200 && id < 300) ||
    id === 771 ||
    id === 781 ||
    id === 602 ||
    id === 622
  );
}

export function computeWeatherRisk(params: {
  rainfallMm: number;
  windSpeedKmph: number;
  visibilityMeters: number;
  conditionId: number;
}): WeatherRisk {
  const {
    rainfallMm,
    windSpeedKmph,
    visibilityMeters,
    conditionId,
  } = params;

  if (isSevereConditionId(conditionId)) return "HIGH";
  if (visibilityMeters < 1000) return "HIGH";
  if (windSpeedKmph > 60) return "HIGH";
  if (rainfallMm > 15) return "HIGH";

  if (visibilityMeters < 4000) return "MEDIUM";
  if (windSpeedKmph > 35) return "MEDIUM";
  if (rainfallMm > 4) return "MEDIUM";

  return "LOW";
}

export function mapOpenWeatherResponse(
  payload: unknown
): WeatherResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Weather payload is not an object");
  }

  const data = payload as Record<string, any>;

  const main = data.main;
  const weather = data.weather?.[0];

  if (
    !main ||
    typeof main.temp !== "number" ||
    !weather
  ) {
    throw new Error("Weather payload is missing required fields");
  }

  const conditionId =
    typeof weather.id === "number" ? weather.id : 800;

  const condition =
    typeof weather.main === "string"
      ? weather.main
      : "Unknown";

  const windSpeedMs =
    typeof data.wind?.speed === "number"
      ? data.wind.speed
      : 0;

  const windSpeedKmph =
    Math.round(windSpeedMs * 3.6 * 10) / 10;

  const visibility =
    typeof data.visibility === "number"
      ? data.visibility
      : 10000;

  let rainfall = 0;

  if (typeof data.rain?.["1h"] === "number") {
    rainfall = data.rain["1h"];
  } else if (typeof data.rain?.["3h"] === "number") {
    rainfall =
      Math.round((data.rain["3h"] / 3) * 10) / 10;
  }

  const temperature =
    Math.round(main.temp * 10) / 10;

  const weatherRisk = computeWeatherRisk({
    rainfallMm: rainfall,
    windSpeedKmph,
    visibilityMeters: visibility,
    conditionId,
  });

  return {
    temperature,
    rainfall,
    windSpeed: windSpeedKmph,
    visibility,
    condition,
    weatherRisk,
  };
}