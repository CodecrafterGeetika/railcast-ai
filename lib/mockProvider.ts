import {
  TrainStatus,
  TrainRoute,
  StationETA,
  ETAPrediction,
  ModelMetrics,
  OperationsSummary,
  PredictionFactor,
  StationStatus,
  NetworkTrainMarker,
  TrainSummary,
} from "./types";
import { addMinutes, diffMinutes, nowISO } from "./etaUtils";
import { allTrainDefinitions, findTrainDefinition, trainSummaries, TrainDefinition, StationScenario } from "@/data/mockTrains";
import { interpolateCoords } from "./stationCoords";

function scenarioFor(def: TrainDefinition, code: string): StationScenario {
  return (
    def.scenarios.find((s) => s.code === code) ?? {
      code,
      adjustmentMin: 0,
      confidencePercent: 80,
      historicalDeltaMin: 0,
    }
  );
}

function stationStatus(index: number, currentIndex: number, lastIndex: number): StationStatus {
  if (index === lastIndex) return "destination";
  if (index < currentIndex) return "departed";
  if (index === currentIndex) return "current";
  if (index === currentIndex + 1) return "next";
  return "upcoming";
}

export function buildTrainStatus(def: TrainDefinition): TrainStatus {
  const lastIndex = def.stations.length - 1;
  const current = def.stations[def.currentIndex];
  const next = def.stations[Math.min(def.currentIndex + 1, lastIndex)];
  const totalDistanceKm = def.stations[lastIndex].distanceFromSourceKm;
  const distanceTravelledKm = Math.min(
    current.distanceFromSourceKm + def.aheadOfCurrentKm,
    totalDistanceKm
  );

  let runningStatus: TrainStatus["runningStatus"] = "On Time";
  if (def.currentDelayMin > 5) runningStatus = "Delayed";
  else if (def.currentDelayMin < 0) runningStatus = "Ahead of Schedule";

  return {
    trainNumber: def.trainNumber,
    trainName: def.trainName,
    source: def.source,
    destination: def.destination,
    currentStation: current.name,
    nextStation: next.name,
    currentDelayMin: def.currentDelayMin,
    currentSpeedKmph: def.currentSpeedKmph,
    distanceTravelledKm,
    remainingDistanceKm: Math.max(totalDistanceKm - distanceTravelledKm, 0),
    totalDistanceKm,
    lastUpdated: nowISO(),
    runningStatus,
  };
}

export function buildTrainRoute(def: TrainDefinition): TrainRoute {
  return {
    trainNumber: def.trainNumber,
    stations: def.stations,
  };
}

export function buildStationETAs(def: TrainDefinition): StationETA[] {
  const lastIndex = def.stations.length - 1;
  return def.stations.map((station, index) => {
    const scenario = scenarioFor(def, station.code);
    const projectedDelay = scenario.actualDelayMin ?? def.currentDelayMin;
    const currentReportedETA = addMinutes(station.scheduledArrival, projectedDelay);
    const predictedETA = addMinutes(currentReportedETA, scenario.adjustmentMin);
    const status = stationStatus(index, def.currentIndex, lastIndex);

    return {
      stationCode: station.code,
      stationName: station.name,
      scheduledETA: station.scheduledArrival,
      currentReportedETA,
      predictedETA,
      differenceMin: diffMinutes(currentReportedETA, predictedETA),
      confidencePercent: scenario.confidencePercent,
      status,
      actualDelayMin: scenario.actualDelayMin,
      predictedDelayMin: diffMinutes(station.scheduledArrival, predictedETA),
    };
  });
}

export function buildPrediction(def: TrainDefinition): ETAPrediction {
  const lastIndex = def.stations.length - 1;
  const targetIndex = Math.min(def.currentIndex + 1, lastIndex);
  const targetStation = def.stations[targetIndex];
  const scenario = scenarioFor(def, targetStation.code);

  const currentReportedETA = addMinutes(targetStation.scheduledArrival, def.currentDelayMin);
  const predictedETA = addMinutes(currentReportedETA, scenario.adjustmentMin);
  const rangeSpread = Math.max(3, Math.round((100 - scenario.confidencePercent) / 3));

  const sectionPerformanceImpact = def.currentDelayMin - def.previousStationDelayMin;
  const headwayImpactMin =
    def.headway === "Low" ? -1 : def.headway === "Moderate" ? 1 : def.headway === "High" ? 4 : 7;
  const weatherImpactMin =
    def.weather === "Normal" ? 0 : def.weather === "Rain" ? 4 : def.weather === "Fog" ? 6 : 2;

  const factors: PredictionFactor[] = [
    {
      label: "Current delay",
      impactMin: def.currentDelayMin,
      description: `Train is currently running ${Math.abs(def.currentDelayMin)} min ${
        def.currentDelayMin >= 0 ? "behind" : "ahead of"
      } schedule at the last reporting point.`,
    },
    {
      label: "Current speed",
      impactMin: 0,
      displayValue: `${def.currentSpeedKmph} km/h`,
      description: "Instantaneous speed feeds the section-time re-estimation model.",
    },
    {
      label: "Previous section performance",
      impactMin: sectionPerformanceImpact,
      description:
        sectionPerformanceImpact < 0
          ? "Train recovered time on the last completed section versus its running delay trend."
          : sectionPerformanceImpact > 0
          ? "Train lost additional time on the last completed section."
          : "Last completed section matched the running delay trend.",
    },
    {
      label: "Train density / headway",
      impactMin: headwayImpactMin,
      displayValue: def.headway,
      description: "Congestion on the upcoming section based on following/crossing traffic.",
    },
    {
      label: "Historical section time",
      impactMin: scenario.historicalDeltaMin,
      description: "Deviation from scheduled time this section has historically shown across past trips.",
    },
    {
      label: "Weather",
      impactMin: weatherImpactMin,
      displayValue: def.weather,
      description: "Optional signal; only material during fog, heavy rain or extreme heat advisories.",
    },
  ];

  return {
    trainNumber: def.trainNumber,
    stationCode: targetStation.code,
    scheduledETA: targetStation.scheduledArrival,
    currentReportedETA,
    predictedETA,
    predictionRangeStart: addMinutes(predictedETA, -rangeSpread),
    predictionRangeEnd: addMinutes(predictedETA, rangeSpread),
    confidencePercent: scenario.confidencePercent,
    differenceMin: diffMinutes(currentReportedETA, predictedETA),
    factors,
    previousStationDelayMin: def.previousStationDelayMin,
    historicalSectionTravelMinDelta: scenario.historicalDeltaMin,
    headway: def.headway,
    weather: def.weather,
  };
}

export function buildNetworkMarker(def: TrainDefinition): NetworkTrainMarker {
  const current = def.stations[def.currentIndex];
  const next = def.stations[Math.min(def.currentIndex + 1, def.stations.length - 1)];
  const sectionLenKm = Math.max(next.distanceFromSourceKm - current.distanceFromSourceKm, 1);
  const fraction = def.aheadOfCurrentKm / sectionLenKm;
  const [lat, lng] = interpolateCoords(current.code, next.code, fraction);

  const status: NetworkTrainMarker["status"] =
    def.currentDelayMin > 15 ? "delayed" : scenarioFor(def, next.code).adjustmentMin > 0 ? "at-risk" : "on-time";

  return {
    trainNumber: def.trainNumber,
    trainName: def.trainName,
    lat,
    lng,
    delayMin: def.currentDelayMin,
    status,
  };
}

export function buildOperationsSummary(): OperationsSummary {
  const defs = allTrainDefinitions;
  const trainsDelayed = defs.filter((d) => d.currentDelayMin > 10).length;
  const atRiskDefs = defs.filter((d) => {
    const next = d.stations[Math.min(d.currentIndex + 1, d.stations.length - 1)];
    return scenarioFor(d, next.code).adjustmentMin > 0;
  });

  const avgDelay = Math.round(defs.reduce((sum, d) => sum + d.currentDelayMin, 0) / defs.length);
  const avgConfidence = Math.round(
    defs.reduce((sum, d) => {
      const next = d.stations[Math.min(d.currentIndex + 1, d.stations.length - 1)];
      return sum + scenarioFor(d, next.code).confidencePercent;
    }, 0) / defs.length
  );

  const alerts = defs.map((d) => {
    const next = d.stations[Math.min(d.currentIndex + 1, d.stations.length - 1)];
    const scenario = scenarioFor(d, next.code);
    if (scenario.adjustmentMin > 0) {
      return {
        id: `${d.trainNumber}-risk`,
        severity: "warning" as const,
        trainNumber: d.trainNumber,
        trainName: d.trainName,
        message: `High probability of additional delay approaching ${next.name} — historical section time and headway trending unfavorable.`,
        timestamp: nowISO(),
      };
    }
    if (d.currentDelayMin > 15) {
      return {
        id: `${d.trainNumber}-delay`,
        severity: "critical" as const,
        trainNumber: d.trainNumber,
        trainName: d.trainName,
        message: `Running ${d.currentDelayMin} min behind schedule. Monitoring recovery on upcoming sections.`,
        timestamp: nowISO(),
      };
    }
    return {
      id: `${d.trainNumber}-ontrack`,
      severity: "info" as const,
      trainNumber: d.trainNumber,
      trainName: d.trainName,
      message: `Running close to predicted trajectory toward ${next.name}.`,
      timestamp: nowISO(),
    };
  });

  const stationWiseETAErrors = [
    { stationCode: "RTM", stationName: "Ratlam Jn", avgErrorMin: 4.1 },
    { stationCode: "KOTA", stationName: "Kota Jn", avgErrorMin: 3.4 },
    { stationCode: "NDLS", stationName: "New Delhi", avgErrorMin: 5.2 },
    { stationCode: "BPL", stationName: "Bhopal Jn", avgErrorMin: 2.9 },
    { stationCode: "BSB", stationName: "Varanasi Jn", avgErrorMin: 6.0 },
  ];

  return {
    trainsRunning: defs.length,
    trainsDelayed,
    trainsAtRisk: atRiskDefs.length,
    averageNetworkDelayMin: avgDelay,
    averagePredictionConfidencePercent: avgConfidence,
    networkCongestion: "Moderate",
    alerts,
    stationWiseETAErrors,
    networkTrains: defs.map(buildNetworkMarker),
  };
}

export function buildModelMetrics(): ModelMetrics {
  return {
    generatedAt: nowISO(),
    baselineMAEMin: 7.8,
    modelMAEMin: 5.4,
    baselineRMSEMin: 9.6,
    modelRMSEMin: 6.9,
    accuracyWithin5MinPercent: 61,
    accuracyWithin10MinPercent: 84,
    improvementPercent: 30.8,
    isDemoMetrics: true,
    stationWiseErrors: [
      { stationCode: "RTM", stationName: "Ratlam Jn", baselineErrorMin: 8.1, modelErrorMin: 5.2 },
      { stationCode: "KOTA", stationName: "Kota Jn", baselineErrorMin: 7.4, modelErrorMin: 5.0 },
      { stationCode: "NDLS", stationName: "New Delhi", baselineErrorMin: 9.0, modelErrorMin: 6.4 },
      { stationCode: "BPL", stationName: "Bhopal Jn", baselineErrorMin: 6.2, modelErrorMin: 4.1 },
      { stationCode: "BSB", stationName: "Varanasi Jn", baselineErrorMin: 8.8, modelErrorMin: 6.6 },
      { stationCode: "GWL", stationName: "Gwalior Jn", baselineErrorMin: 6.9, modelErrorMin: 4.7 },
    ],
    errorTrend: [
      { label: "Week 1", baselineErrorMin: 8.4, modelErrorMin: 6.5 },
      { label: "Week 2", baselineErrorMin: 8.1, modelErrorMin: 6.0 },
      { label: "Week 3", baselineErrorMin: 7.9, modelErrorMin: 5.7 },
      { label: "Week 4", baselineErrorMin: 7.8, modelErrorMin: 5.4 },
    ],
  };
}

// ---------------------------------------------------------------------------
// Public mock provider surface — mirrors the shape apiProvider.ts will expose.
// ---------------------------------------------------------------------------

async function simulateNetworkDelay() {
  await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 180));
}

export async function mockGetTrainStatus(trainNumber: string): Promise<TrainStatus> {
  await simulateNetworkDelay();
  const def = findTrainDefinition(trainNumber);
  if (!def) throw new Error(`No demo data for train ${trainNumber}`);
  return buildTrainStatus(def);
}

export async function mockGetTrainRoute(trainNumber: string): Promise<TrainRoute> {
  await simulateNetworkDelay();
  const def = findTrainDefinition(trainNumber);
  if (!def) throw new Error(`No demo data for train ${trainNumber}`);
  return buildTrainRoute(def);
}

export async function mockGetStationETA(trainNumber: string): Promise<StationETA[]> {
  await simulateNetworkDelay();
  const def = findTrainDefinition(trainNumber);
  if (!def) throw new Error(`No demo data for train ${trainNumber}`);
  return buildStationETAs(def);
}

export async function mockGetPrediction(trainNumber: string): Promise<ETAPrediction> {
  await simulateNetworkDelay();
  const def = findTrainDefinition(trainNumber);
  if (!def) throw new Error(`No demo data for train ${trainNumber}`);
  return buildPrediction(def);
}

export async function mockGetOperationsSummary(): Promise<OperationsSummary> {
  await simulateNetworkDelay();
  return buildOperationsSummary();
}

export async function mockGetModelMetrics(): Promise<ModelMetrics> {
  await simulateNetworkDelay();
  return buildModelMetrics();
}

export async function mockListTrains(): Promise<TrainSummary[]> {
  await simulateNetworkDelay();
  return trainSummaries;
}
