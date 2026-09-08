import { ProviderError } from "./types";
import type { RailRadarEnvelope, RailRadarErrorEnvelope, RailRadarLiveTrainData } from "./railradarTypes";

// ---------------------------------------------------------------------------
// Server-only RailRadar client.
//
// RAILRADAR_API_KEY is read here via process.env and is NEVER prefixed with
// NEXT_PUBLIC_, so it is never bundled into client JS. This module must only
// ever be imported from server-side code (route handlers, Server Components,
// lib/dataProvider.ts) — never from a "use client" component.
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.railradar.in/v1";
const REQUEST_TIMEOUT_MS = 6000;

// Quota-friendly short-lived cache. This is a single in-memory Map, so ALL
// callers within the same server process/request share one cached response
// per train instead of each issuing its own RailRadar call. Note: on
// serverless platforms (Vercel) each cold function instance gets its own
// empty cache — this reduces duplicate calls within a warm instance/request
// burst, but is not a substitute for a shared store (e.g. Vercel KV) if you
// later need cross-instance deduplication.
const CACHE_TTL_MS = 25_000;
const liveTrainCache = new Map<string, { expiresAt: number; data: RailRadarLiveTrainData }>();

export const TRAIN_NUMBER_PATTERN = /^\d{4,5}$/;

function getApiKey(): string {
  const key = process.env.RAILRADAR_API_KEY;
  if (!key) {
    throw new ProviderError("NETWORK", "RAILRADAR_API_KEY is not configured");
  }
  return key;
}

/**
 * Fetches live running status for a train from RailRadar.
 * `authoritative` bypasses RailRadar's own cache AND ours — only pass this
 * when a caller explicitly needs a forced-fresh read, to avoid burning
 * quota on every dashboard refresh.
 */
export async function fetchLiveTrainStatus(
  trainNumber: string,
  options: { authoritative?: boolean } = {}
): Promise<RailRadarLiveTrainData> {
  if (!TRAIN_NUMBER_PATTERN.test(trainNumber)) {
    throw new ProviderError("MALFORMED", "Train number must be 4-5 digits");
  }

  const cacheKey = trainNumber;
  if (!options.authoritative) {
    const cached = liveTrainCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  const apiKey = getApiKey();
  const params = new URLSearchParams({ includeCoordinates: "true" });
  if (options.authoritative) params.set("authoritative", "true");

  const url = `${BASE_URL}/trains/${encodeURIComponent(trainNumber)}/live?${params.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ProviderError("TIMEOUT", `RailRadar request for train ${trainNumber} timed out`);
    }
    throw new ProviderError("NETWORK", `Network error calling RailRadar for train ${trainNumber}`);
  }
  clearTimeout(timeout);

  let payload: RailRadarEnvelope<RailRadarLiveTrainData> | RailRadarErrorEnvelope;
  try {
    payload = await response.json();
  } catch {
    throw new ProviderError("MALFORMED", "RailRadar returned malformed JSON");
  }

  if (!response.ok || payload.success === false) {
    const errorCode = payload.success === false ? payload.error.code : undefined;
    if (response.status === 401) throw new ProviderError("UNAUTHORIZED", "RailRadar rejected the API key");
    if (response.status === 404 || errorCode === "NOT_FOUND") {
      throw new ProviderError("NOT_FOUND", `Train ${trainNumber} not found on RailRadar`);
    }
    if (response.status === 429) throw new ProviderError("RATE_LIMITED", "RailRadar rate limit exceeded");
    if (response.status === 503) throw new ProviderError("SERVER_ERROR", "RailRadar upstream telemetry degraded");
    throw new ProviderError("SERVER_ERROR", `RailRadar returned status ${response.status}`);
  }

  const data = payload.data;
  liveTrainCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
  return data;
}
