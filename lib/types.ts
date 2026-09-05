// ---------------------------------------------------------------------------
// Core domain types shared by every data provider (mock + future live API).
// The UI is built entirely against these interfaces so that swapping the
// mock provider for a real backend/ML engine requires no frontend rewrite.
// ---------------------------------------------------------------------------

export type DataSourceMode = "live" | "demo";

export type CongestionLevel = "Low" | "Moderate" | "High" | "Severe";

export type StationStatus =
  | "departed"
  | "current"
  | "next"
  | "upcoming"
  | "destination";

export interface RouteStation {
  code: string;
  name: string;
  distanceFromSourceKm: number;
  scheduledArrival: string; // "HH:mm"
  scheduledDeparture: string; // "HH:mm"
  haltMinutes: number;
  platform?: string;
}

export interface TrainStatus {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  currentStation: string;
  nextStation: string;
  currentDelayMin: number;
  currentSpeedKmph: number;
  distanceTravelledKm: number;
  remainingDistanceKm: number;
  totalDistanceKm: number;
  lastUpdated: string; // ISO timestamp
  runningStatus: "On Time" | "Delayed" | "Ahead of Schedule";
}

export interface TrainRoute {
  trainNumber: string;
  stations: RouteStation[];
}

export interface PredictionFactor {
  label: string;
  impactMin: number; // signed minutes contribution to the ETA shift
  description: string;
  displayValue?: string; // for non-numeric factors like "Moderate" congestion
}

export interface ETAPrediction {
  trainNumber: string;
  stationCode: string;
  scheduledETA: string; // "HH:mm"
  currentReportedETA: string; // "HH:mm", railway-reported ETA
  predictedETA: string; // "HH:mm", our AI ETA
  predictionRangeStart: string; // "HH:mm"
  predictionRangeEnd: string; // "HH:mm"
  confidencePercent: number;
  differenceMin: number; // predictedETA - currentReportedETA (negative = earlier)
  factors: PredictionFactor[];
  previousStationDelayMin: number;
  historicalSectionTravelMinDelta: number; // vs scheduled section time
  headway: CongestionLevel;
  weather?: "Normal" | "Rain" | "Fog" | "Extreme Heat";
}

export interface StationETA {
  stationCode: string;
  stationName: string;
  scheduledETA: string;
  currentReportedETA: string;
  predictedETA: string;
  differenceMin: number;
  confidencePercent: number;
  status: StationStatus;
  actualDelayMin?: number; // for departed stations
  predictedDelayMin: number;
}

export interface ModelMetrics {
  generatedAt: string;
  baselineMAEMin: number;
  modelMAEMin: number;
  baselineRMSEMin: number;
  modelRMSEMin: number;
  accuracyWithin5MinPercent: number;
  accuracyWithin10MinPercent: number;
  improvementPercent: number;
  isDemoMetrics: boolean;
  stationWiseErrors: {
    stationCode: string;
    stationName: string;
    baselineErrorMin: number;
    modelErrorMin: number;
  }[];
  errorTrend: {
    label: string;
    baselineErrorMin: number;
    modelErrorMin: number;
  }[];
}

export interface NetworkTrainMarker {
  trainNumber: string;
  trainName: string;
  lat: number;
  lng: number;
  delayMin: number;
  status: "on-time" | "delayed" | "at-risk";
}

export interface OperationsAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  trainNumber: string;
  trainName: string;
  message: string;
  timestamp: string;
}

export interface OperationsSummary {
  trainsRunning: number;
  trainsDelayed: number;
  trainsAtRisk: number;
  averageNetworkDelayMin: number;
  averagePredictionConfidencePercent: number;
  networkCongestion: CongestionLevel;
  alerts: OperationsAlert[];
  stationWiseETAErrors: {
    stationCode: string;
    stationName: string;
    avgErrorMin: number;
  }[];
  networkTrains: NetworkTrainMarker[];
}

export interface TrainSummary {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
}

// Result wrapper used by the data provider so the UI always knows whether it
// is looking at live or simulated data, regardless of which provider served it.
export interface ProviderResult<T> {
  data: T;
  source: DataSourceMode;
  fetchedAt: string;
}

export class ProviderError extends Error {
  code: "TIMEOUT" | "UNAUTHORIZED" | "NOT_FOUND" | "RATE_LIMITED" | "SERVER_ERROR" | "NETWORK" | "MALFORMED";
  constructor(code: ProviderError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "ProviderError";
  }
}
