export type WeatherRisk = "LOW" | "MEDIUM" | "HIGH";

export type WeatherResult = {
  temperature: number;
  rainfall: number;
  windSpeed: number;
  visibility: number;
  condition: string;
  weatherRisk: WeatherRisk;
};

export type WeatherErrorResponse = {
  error: string;
  details?: string;
  payload?: unknown;
};
