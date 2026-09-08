import { NextRequest, NextResponse } from "next/server";
import { mapOpenWeatherResponse } from "@/lib/weatherUtils";
import type { WeatherResult, WeatherErrorResponse } from "@/lib/weatherTypes";

// ---------------------------------------------------------------------------
// GET /api/weather?lat={number}&lon={number}
//
// Server-side only. Calls OpenWeather using OPENWEATHER_API_KEY (never
// NEXT_PUBLIC_-prefixed, so it is never bundled into client JS and never
// visible in the browser). Always returns JSON — never throws an unhandled
// error — so callers can safely render a fallback if weatherRisk data is
// unavailable, the same fallback-friendly spirit as lib/dataProvider.ts.
// ---------------------------------------------------------------------------

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const REQUEST_TIMEOUT_MS = 6000;

function errorResponse(message: string, status: number) {
  const body: WeatherErrorResponse = { error: message };
  return NextResponse.json(body, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  if (!latParam || !lonParam) {
    return errorResponse("Missing required query parameters: lat and lon.", 400);
  }

  const lat = Number(latParam);
  const lon = Number(lonParam);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return errorResponse("Invalid lat/lon values.", 400);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    // Server misconfiguration — never expose this detail to the client beyond a generic message.
    console.error("/api/weather: OPENWEATHER_API_KEY is not set");
    return errorResponse("Weather service is not configured.", 500);
  }

  const url = `${OPENWEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      return errorResponse("Weather service request timed out.", 504);
    }
    return errorResponse("Unable to reach the weather service.", 502);
  }
  clearTimeout(timeout);

  if (response.status === 401) {
    console.error("/api/weather: OpenWeather rejected the API key (401)");
    return errorResponse("Weather service authentication failed.", 502);
  }
  if (response.status === 404) {
    return errorResponse("No weather data found for the given coordinates.", 404);
  }
  if (response.status === 429) {
    return errorResponse("Weather service rate limit exceeded. Try again shortly.", 429);
  }
  if (!response.ok) {
    return errorResponse(`Weather service returned an unexpected status (${response.status}).`, 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return errorResponse("Received malformed weather data.", 502);
  }

 try {
  const result: WeatherResult = mapOpenWeatherResponse(payload);
  return NextResponse.json(result, { status: 200 });
} catch (err) {
  console.error("Weather mapping error:", err);
  console.error("OpenWeather payload:", payload);

  return NextResponse.json(
    {
      error: "Weather data mapping failed.",
      details: err instanceof Error ? err.message : "Unknown error",
      payload,
    },
    { status: 502 }
  );
}
}