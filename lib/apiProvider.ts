import {
  TrainStatus,
  TrainRoute,
  StationETA,
  ETAPrediction,
  ModelMetrics,
  OperationsSummary,
  TrainSummary,
  ProviderError,
} from "./types";
import type { ControlOfficeSummary } from "./controlOfficeTypes";
// ---------------------------------------------------------------------------
// Live API provider. This is the ONLY file that needs to change once the
// real Railway Live API -> Backend -> ML ETA Engine pipeline exists.
// It talks to NEXT_PUBLIC_API_BASE_URL and never embeds secrets — any
// private API keys belong on the backend, never in frontend code.
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const REQUEST_TIMEOUT_MS = 5000;

async function apiFetch<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new ProviderError("NETWORK", "NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ProviderError("TIMEOUT", `Request to ${path} timed out`);
    }
    throw new ProviderError("NETWORK", `Network error calling ${path}`);
  }
  clearTimeout(timeout);

  if (response.status === 401) throw new ProviderError("UNAUTHORIZED", "Unauthorized");
  if (response.status === 404) throw new ProviderError("NOT_FOUND", "Not found");
  if (response.status === 429) throw new ProviderError("RATE_LIMITED", "Rate limited");
  if (response.status >= 500) throw new ProviderError("SERVER_ERROR", "Backend server error");
  if (!response.ok) throw new ProviderError("SERVER_ERROR", `Unexpected status ${response.status}`);

  try {
    return (await response.json()) as T;
  } catch {
    throw new ProviderError("MALFORMED", "Malformed JSON response");
  }
}

export async function apiGetTrainStatus(trainNumber: string): Promise<TrainStatus> {
  return apiFetch<TrainStatus>(`/api/train/${trainNumber}`);
}

export async function apiGetTrainRoute(trainNumber: string): Promise<TrainRoute> {
  return apiFetch<TrainRoute>(`/api/train/${trainNumber}/route`);
}

export async function apiGetStationETA(trainNumber: string): Promise<StationETA[]> {
  return apiFetch<StationETA[]>(`/api/train/${trainNumber}/eta`);
}

export async function apiGetPrediction(trainNumber: string): Promise<ETAPrediction> {
  return apiFetch<ETAPrediction>(`/api/train/${trainNumber}/eta`);
}

export async function apiGetOperationsSummary(): Promise<OperationsSummary> {
  return apiFetch<OperationsSummary>(`/api/operations`);
}

export async function apiGetModelMetrics(): Promise<ModelMetrics> {
  return apiFetch<ModelMetrics>(`/api/metrics`);
}

export async function apiListTrains(): Promise<TrainSummary[]> {
  return apiFetch<TrainSummary[]>(`/api/trains`);
}
// ---------------------------------------------------------------------------
// Control Office dashboard — future live endpoint. Uses the same apiFetch
// helper and error handling as every other function in this file. Until a
// real backend exists, this will simply throw and dataProvider.ts falls
// back to the Control Office demo data automatically.
// ---------------------------------------------------------------------------
export async function apiGetControlOfficeSummary(): Promise<ControlOfficeSummary> {
  return apiFetch<ControlOfficeSummary>(`/api/operations/control-office`);
}
