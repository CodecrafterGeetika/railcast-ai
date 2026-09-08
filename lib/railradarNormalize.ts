import type { TrainStatus } from "./types";
import type { NormalizedLiveTrain, RailRadarLiveTrainData, RailRadarRouteStop } from "./railradarTypes";

// ---------------------------------------------------------------------------
// Pure mapping functions — no fetching here, so they're easy to unit test
// against the real RailRadar response example independently of the network.
// ---------------------------------------------------------------------------

function findRouteStop(route: RailRadarRouteStop[] | undefined, stationCode: string): RailRadarRouteStop | undefined {
  return route?.find((s) => s.stationCode === stationCode);
}

/** Maps RailRadar's raw response into our own clean, stable structure. */
export function mapToNormalizedLiveTrain(raw: RailRadarLiveTrainData): NormalizedLiveTrain {
  const currentStop = findRouteStop(raw.route, raw.currentLocation.stationCode);

  return {
    trainNumber: raw.trainNumber,
    trainName: raw.trainName,
    trainType: raw.train.type,
    category: raw.train.category,

    status: raw.status,

    currentLocation: {
      stationCode: raw.currentLocation.stationCode,
      stationName: currentStop?.stationName ?? raw.previousHalt?.stationName ?? raw.currentLocation.stationCode,
      latitude: currentStop?.lat ?? null,
      longitude: currentStop?.lng ?? null,
      segmentProgress: raw.currentLocation.segmentProgress,
      speedKmh: raw.currentLocation.speedKmh,
      status: raw.currentLocation.status,
    },

    delayMinutes: raw.delayMinutes,

    previousStation: raw.previousHalt
      ? { code: raw.previousHalt.stationCode, name: raw.previousHalt.stationName }
      : null,

    nextStation: raw.nextHalt
      ? { code: raw.nextHalt.stationCode, name: raw.nextHalt.stationName, distance: raw.nextHalt.distance }
      : null,

    platform: currentStop?.platform ?? null,

    hasException: Boolean(raw.exceptions && raw.exceptions.length > 0),
    exceptionMessage: raw.exceptions?.[0]?.message ?? null,

    lastUpdatedAt: raw.lastUpdatedAt,

    isLive: true,
    source: "railradar",
  };
}

/**
 * Maps RailRadar's raw response into the EXISTING TrainStatus type
 * (lib/types.ts) so it can drop straight into the current passenger
 * dashboard (app/train/[number]/page.tsx) with no UI changes required.
 *
 * Note: TrainStatus.runningStatus only has 3 values (On Time / Delayed /
 * Ahead of Schedule). RailRadar's `status` field can also be "scheduled" or
 * "terminated" — those aren't representable in the existing type, so this
 * mapping falls back to a delay-based classification in that case. Widening
 * TrainStatus itself was intentionally avoided to keep this change minimal.
 */
export function mapToExistingTrainStatus(raw: RailRadarLiveTrainData): TrainStatus {
  const previousDistance = raw.previousHalt?.distance ?? 0;
  const nextDistance = raw.nextHalt?.distance ?? raw.train.distance;
  const distanceTravelledKm = Math.round(
    previousDistance + raw.currentLocation.segmentProgress * (nextDistance - previousDistance)
  );

  const currentStop = findRouteStop(raw.route, raw.currentLocation.stationCode);
  const currentStationName =
    currentStop?.stationName ?? raw.previousHalt?.stationName ?? raw.currentLocation.stationCode;

  let runningStatus: TrainStatus["runningStatus"] = "On Time";
  if (raw.delayMinutes > 5) runningStatus = "Delayed";
  else if (raw.delayMinutes < 0) runningStatus = "Ahead of Schedule";

  return {
    trainNumber: raw.trainNumber,
    trainName: raw.trainName,
    source: `${raw.train.source.name} (${raw.train.source.code})`,
    destination: `${raw.train.destination.name} (${raw.train.destination.code})`,
    currentStation: currentStationName,
    nextStation: raw.nextHalt?.stationName ?? "—",
    currentDelayMin: raw.delayMinutes,
    currentSpeedKmph: Math.round(raw.currentLocation.speedKmh),
    distanceTravelledKm,
    remainingDistanceKm: Math.max(raw.train.distance - distanceTravelledKm, 0),
    totalDistanceKm: raw.train.distance,
    lastUpdated: raw.lastUpdatedAt,
    runningStatus,
  };
}
