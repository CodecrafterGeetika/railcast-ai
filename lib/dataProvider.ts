import {
  TrainStatus,
  TrainRoute,
  StationETA,
  ETAPrediction,
  ModelMetrics,
  OperationsSummary,
  TrainSummary,
  ProviderResult,
} from "./types";
import * as api from "./apiProvider";
import * as mock from "./mockProvider";
import { nowISO } from "./etaUtils";
import type { ControlOfficeSummary } from "./controlOfficeTypes";
import { mockGetControlOfficeSummary } from "./controlOfficeMock";

// ---------------------------------------------------------------------------
// CRITICAL FALLBACK LAYER
//
// Every function here first attempts the live API provider. If the backend
// is unavailable, times out, is unauthorized, rate-limited, errors, or
// returns malformed data, it automatically and silently falls back to the
// demo provider so the UI never crashes and never shows a blank screen.
//
// The UI always receives a `source` field ("live" | "demo") and must use it
// to render the 🟢 LIVE DATA / 🟡 DEMO SIMULATION indicator. Demo data must
// never be labeled as live.
// ---------------------------------------------------------------------------

const LIVE_MODE_ENABLED = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

async function withFallback<T>(
  liveCall: () => Promise<T>,
  demoCall: () => Promise<T>
): Promise<ProviderResult<T>> {
  if (LIVE_MODE_ENABLED) {
    try {
      const data = await liveCall();
      return { data, source: "live", fetchedAt: nowISO() };
    } catch {
      // Live backend unavailable, invalid, or erroring — fall back silently.
    }
  }
  const data = await demoCall();
  return { data, source: "demo", fetchedAt: nowISO() };
}

export async function getTrainStatus(trainNumber: string): Promise<ProviderResult<TrainStatus>> {
  return withFallback(
    () => api.apiGetTrainStatus(trainNumber),
    () => mock.mockGetTrainStatus(trainNumber)
  );
}

export async function getTrainRoute(trainNumber: string): Promise<ProviderResult<TrainRoute>> {
  return withFallback(
    () => api.apiGetTrainRoute(trainNumber),
    () => mock.mockGetTrainRoute(trainNumber)
  );
}

export async function getStationETA(trainNumber: string): Promise<ProviderResult<StationETA[]>> {
  return withFallback(
    () => api.apiGetStationETA(trainNumber),
    () => mock.mockGetStationETA(trainNumber)
  );
}

export async function getPrediction(trainNumber: string): Promise<ProviderResult<ETAPrediction>> {
  return withFallback(
    () => api.apiGetPrediction(trainNumber),
    () => mock.mockGetPrediction(trainNumber)
  );
}

export async function getOperationsSummary(): Promise<ProviderResult<OperationsSummary>> {
  return withFallback(
    () => api.apiGetOperationsSummary(),
    () => mock.mockGetOperationsSummary()
  );
}

export async function getModelMetrics(): Promise<ProviderResult<ModelMetrics>> {
  return withFallback(
    () => api.apiGetModelMetrics(),
    () => mock.mockGetModelMetrics()
  );
}

export async function listTrains(): Promise<ProviderResult<TrainSummary[]>> {
  return withFallback(
    () => api.apiListTrains(),
    () => mock.mockListTrains()
  );
}

export async function getControlOfficeSummary(): Promise<ProviderResult<ControlOfficeSummary>> {
  return withFallback(
    () => api.apiGetControlOfficeSummary(),
    () => mockGetControlOfficeSummary()
  );
}

/** Convenience helper for loading everything a train dashboard page needs in one call. */
export async function getFullTrainDashboard(trainNumber: string) {
  const [status, route, stationETAs, prediction] = await Promise.all([
    getTrainStatus(trainNumber),
    getTrainRoute(trainNumber),
    getStationETA(trainNumber),
    getPrediction(trainNumber),
  ]);

  // If any single call silently fell back to demo, treat the whole dashboard
  // as demo so the banner is consistent and never mixes live + simulated data.
  const anyDemo = [status, route, stationETAs, prediction].some((r) => r.source === "demo");

  return {
    status: status.data,
    route: route.data,
    stationETAs: stationETAs.data,
    prediction: prediction.data,
    source: anyDemo ? ("demo" as const) : ("live" as const),
    fetchedAt: nowISO(),
  };
}
