import { ProviderError } from "./types";

import type {
  RailRadarStationLiveData,
  RailRadarStationEnvelope,
  RailRadarStationErrorEnvelope,
  RailRadarStationLiveTrain,
  NormalizedStationTrain,
} from "./railradarStationTypes";

const BASE_URL = "https://api.railradar.in/v1";

const REQUEST_TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 25_000;

const cache = new Map<
  string,
  {
    expiresAt: number;
    data: RailRadarStationLiveData;
  }
>();

export const STATION_CODE_PATTERN = /^[A-Z0-9]{2,6}$/i;

function getApiKey(): string {
  const key = process.env.RAILRADAR_API_KEY;

  if (!key) {
    throw new ProviderError(
      "NETWORK",
      "RAILRADAR_API_KEY is not configured"
    );
  }

  return key;
}

export async function fetchLiveStationBoard(
  stationCode: string,
  options: {
    hours?: 2 | 4 | 6 | 8;
    includeIntermediate?: boolean;
    authoritative?: boolean;
  } = {}
): Promise<RailRadarStationLiveData> {
  const code = stationCode.trim().toUpperCase();

  if (!STATION_CODE_PATTERN.test(code)) {
    throw new ProviderError(
      "MALFORMED",
      "Station code is invalid"
    );
  }

  const hours = options.hours ?? 2;

  const cacheKey = `${code}:${hours}:${options.includeIntermediate !== false}`;

  if (!options.authoritative) {
    const cached = cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  const params = new URLSearchParams({
    hours: String(hours),
    includeIntermediate: String(
      options.includeIntermediate ?? true
    ),
  });

  if (options.authoritative) {
    params.set("authoritative", "true");
  }

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  let response: Response;

  try {
    response = await fetch(
      `${BASE_URL}/stations/${encodeURIComponent(code)}/live?${params}`,
      {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          Accept: "application/json",
        },
      }
    );
  } catch (err) {
    clearTimeout(timeout);

    if (
      err instanceof DOMException &&
      err.name === "AbortError"
    ) {
      throw new ProviderError(
        "TIMEOUT",
        `RailRadar request for station ${code} timed out`
      );
    }

    throw new ProviderError(
      "NETWORK",
      `Network error calling RailRadar for station ${code}`
    );
  }

  clearTimeout(timeout);

  let payload:
    | RailRadarStationEnvelope
    | RailRadarStationErrorEnvelope;

  try {
    payload = await response.json();
  } catch {
    throw new ProviderError(
      "MALFORMED",
      "RailRadar returned malformed JSON"
    );
  }

  if (!response.ok || payload.success === false) {
    const errorCode =
      payload.success === false
        ? payload.error.code
        : undefined;

    if (response.status === 401) {
      throw new ProviderError(
        "UNAUTHORIZED",
        "RailRadar rejected the API key"
      );
    }

    if (
      response.status === 404 ||
      errorCode === "NOT_FOUND"
    ) {
      throw new ProviderError(
        "NOT_FOUND",
        `Station ${code} not found on RailRadar`
      );
    }

    if (response.status === 429) {
      throw new ProviderError(
        "RATE_LIMITED",
        "RailRadar rate limit exceeded"
      );
    }

    if (response.status === 503) {
      throw new ProviderError(
        "SERVER_ERROR",
        "RailRadar station feed is temporarily unavailable"
      );
    }

    throw new ProviderError(
      "SERVER_ERROR",
      `RailRadar returned status ${response.status}`
    );
  }

  cache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: payload.data,
  });

  return payload.data;
}

export function normalizeStationTrain(
  raw: RailRadarStationLiveTrain,
  station: RailRadarStationLiveData["station"]
): NormalizedStationTrain {
  const expectedTime =
    raw.live.expectedArrivalTime ??
    raw.live.expectedDepartureTime ??
    null;

  return {
    trainNumber: raw.train.number,
    trainName: raw.train.name,

    stationCode: station.code,
    stationName: station.name,

    liveType: raw.live.type,

    expectedTime,

    platform:
      raw.live.platform == null
        ? null
        : String(raw.live.platform),

    delayMinutes: Number(
      raw.live.delayMinutes ?? 0
    ),

    scheduledArrival:
      raw.stop.arrival ?? null,

    scheduledDeparture:
      raw.stop.departure ?? null,

    sourceName:
      raw.train.source?.name ?? null,

    destinationName:
      raw.train.destination?.name ?? null,
  };
}
