import type {
  RouteStation,
  CongestionLevel,
  TrainSummary,
} from "@/lib/types";
import { addMinutes } from "@/lib/etaUtils";

// ---------------------------------------------------------------------------
// Static route + scenario definitions for the demo train fleet.
// Each train has a fixed timetable (RouteStation[]) plus a "scenario" that
// describes where the train currently is and how the model's per-station
// adjustments evolve along the remaining route. mockProvider.ts turns this
// static data into the same shape a real backend/ML engine would return.
// ---------------------------------------------------------------------------

export interface StationScenario {
  code: string;
  /** Minutes the AI model adjusts the railway-reported ETA at this station (can be negative). */
  adjustmentMin: number;
  /** Model confidence for this station's prediction. */
  confidencePercent: number;
  /** Historical section travel time delta vs scheduled (minutes), used for the model-factors card. */
  historicalDeltaMin: number;
  /** Actual delay recorded once the train has departed this station (demo realism). */
  actualDelayMin?: number;
}

export interface TrainDefinition {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  stations: RouteStation[];
  scenarios: StationScenario[];
  /** Index into `stations` for the station the train has most recently departed / is currently at. */
  currentIndex: number;
  /** Extra km travelled beyond the current station (simulates being mid-section). */
  aheadOfCurrentKm: number;
  currentDelayMin: number;
  currentSpeedKmph: number;
  previousStationDelayMin: number;
  headway: CongestionLevel;
  weather: "Normal" | "Rain" | "Fog" | "Extreme Heat";
}

function stationsWithArrivalOffset(
  base: { code: string; name: string; distanceFromSourceKm: number; arrival: number; halt: number; platform?: string }[]
): RouteStation[] {
  return base.map((s) => ({
    code: s.code,
    name: s.name,
    distanceFromSourceKm: s.distanceFromSourceKm,
    scheduledArrival: addMinutes("00:00", s.arrival),
    scheduledDeparture: addMinutes("00:00", s.arrival + s.halt),
    haltMinutes: s.halt,
    platform: s.platform,
  }));
}

// --- 12919 Malwa SF Express: Indore Jn -> Hazrat Nizamuddin -----------------
const malwaStations = stationsWithArrivalOffset([
  { code: "INDB", name: "Indore Jn", distanceFromSourceKm: 0, arrival: 19 * 60 + 45, halt: 0, platform: "3" },
  { code: "UJN", name: "Ujjain Jn", distanceFromSourceKm: 58, arrival: 20 * 60 + 55, halt: 5, platform: "1" },
  { code: "NAD", name: "Nagda Jn", distanceFromSourceKm: 108, arrival: 21 * 60 + 50, halt: 5, platform: "2" },
  { code: "RTM", name: "Ratlam Jn", distanceFromSourceKm: 141, arrival: 22 * 60 + 35, halt: 10, platform: "1" },
  { code: "KOTA", name: "Kota Jn", distanceFromSourceKm: 341, arrival: 25 * 60 + 35, halt: 10, platform: "4" },
  { code: "SWM", name: "Sawai Madhopur", distanceFromSourceKm: 451, arrival: 27 * 60 + 5, halt: 5, platform: "2" },
  { code: "BTE", name: "Bharatpur Jn", distanceFromSourceKm: 561, arrival: 28 * 60 + 35, halt: 5, platform: "1" },
  { code: "MTJ", name: "Mathura Jn", distanceFromSourceKm: 601, arrival: 29 * 60 + 20, halt: 5, platform: "3" },
  { code: "NZM", name: "Hazrat Nizamuddin", distanceFromSourceKm: 731, arrival: 31 * 60 + 40, halt: 0, platform: "2" },
]);

export const malwaExpress: TrainDefinition = {
  trainNumber: "12919",
  trainName: "Malwa SF Express",
  source: "Indore Jn (INDB)",
  destination: "Hazrat Nizamuddin (NZM)",
  stations: malwaStations,
  currentIndex: 3, // departed Ratlam Jn, heading to Kota
  aheadOfCurrentKm: 62,
  currentDelayMin: 24,
  currentSpeedKmph: 71,
  previousStationDelayMin: 18,
  headway: "Moderate",
  weather: "Normal",
  scenarios: [
    { code: "INDB", adjustmentMin: 0, confidencePercent: 97, historicalDeltaMin: 0, actualDelayMin: 0 },
    { code: "UJN", adjustmentMin: 0, confidencePercent: 95, historicalDeltaMin: 2, actualDelayMin: 12 },
    { code: "NAD", adjustmentMin: 0, confidencePercent: 94, historicalDeltaMin: 3, actualDelayMin: 18 },
    { code: "RTM", adjustmentMin: 0, confidencePercent: 93, historicalDeltaMin: 2, actualDelayMin: 24 },
    { code: "KOTA", adjustmentMin: -5, confidencePercent: 87, historicalDeltaMin: -4 },
    { code: "SWM", adjustmentMin: -7, confidencePercent: 83, historicalDeltaMin: -3 },
    { code: "BTE", adjustmentMin: -6, confidencePercent: 79, historicalDeltaMin: 1 },
    { code: "MTJ", adjustmentMin: -8, confidencePercent: 76, historicalDeltaMin: -2 },
    { code: "NZM", adjustmentMin: -9, confidencePercent: 72, historicalDeltaMin: -1 },
  ],
};

// --- 12952 Mumbai Rajdhani Express: Mumbai Central -> New Delhi ------------
const rajdhaniStations = stationsWithArrivalOffset([
  { code: "BCT", name: "Mumbai Central", distanceFromSourceKm: 0, arrival: 17 * 60 + 0, halt: 0, platform: "1" },
  { code: "BVI", name: "Borivali", distanceFromSourceKm: 33, arrival: 17 * 60 + 32, halt: 2, platform: "5" },
  { code: "BRC", name: "Vadodara Jn", distanceFromSourceKm: 392, arrival: 21 * 60 + 25, halt: 7, platform: "3" },
  { code: "RTM", name: "Ratlam Jn", distanceFromSourceKm: 550, arrival: 23 * 60 + 40, halt: 5, platform: "2" },
  { code: "KOTA", name: "Kota Jn", distanceFromSourceKm: 700, arrival: 25 * 60 + 55, halt: 5, platform: "1" },
  { code: "SWM", name: "Sawai Madhopur", distanceFromSourceKm: 810, arrival: 27 * 60 + 5, halt: 2, platform: "3" },
  { code: "NDLS", name: "New Delhi", distanceFromSourceKm: 1384, arrival: 32 * 60 + 35, halt: 0, platform: "1" },
]);

export const mumbaiRajdhani: TrainDefinition = {
  trainNumber: "12952",
  trainName: "Mumbai Rajdhani Express",
  source: "Mumbai Central (BCT)",
  destination: "New Delhi (NDLS)",
  stations: rajdhaniStations,
  currentIndex: 2, // departed Vadodara Jn, heading to Ratlam
  aheadOfCurrentKm: 88,
  currentDelayMin: 6,
  currentSpeedKmph: 118,
  previousStationDelayMin: 4,
  headway: "Low",
  weather: "Normal",
  scenarios: [
    { code: "BCT", adjustmentMin: 0, confidencePercent: 98, historicalDeltaMin: 0, actualDelayMin: 0 },
    { code: "BVI", adjustmentMin: 0, confidencePercent: 97, historicalDeltaMin: 0, actualDelayMin: 2 },
    { code: "BRC", adjustmentMin: 0, confidencePercent: 96, historicalDeltaMin: -1, actualDelayMin: 6 },
    { code: "RTM", adjustmentMin: -2, confidencePercent: 92, historicalDeltaMin: -2 },
    { code: "KOTA", adjustmentMin: -3, confidencePercent: 90, historicalDeltaMin: -2 },
    { code: "SWM", adjustmentMin: -3, confidencePercent: 88, historicalDeltaMin: -1 },
    { code: "NDLS", adjustmentMin: -4, confidencePercent: 85, historicalDeltaMin: -2 },
  ],
};

// --- 12002 Bhopal Shatabdi Express: New Delhi -> Bhopal ---------------------
const shatabdiStations = stationsWithArrivalOffset([
  { code: "NDLS", name: "New Delhi", distanceFromSourceKm: 0, arrival: 6 * 60 + 0, halt: 0, platform: "2" },
  { code: "AGC", name: "Agra Cantt", distanceFromSourceKm: 195, arrival: 7 * 60 + 58, halt: 2, platform: "1" },
  { code: "GWL", name: "Gwalior Jn", distanceFromSourceKm: 305, arrival: 9 * 60 + 3, halt: 2, platform: "1" },
  { code: "JHS", name: "Jhansi Jn", distanceFromSourceKm: 403, arrival: 10 * 60 + 3, halt: 5, platform: "3" },
  { code: "BPL", name: "Bhopal Jn", distanceFromSourceKm: 707, arrival: 13 * 60 + 20, halt: 0, platform: "1" },
]);

export const bhopalShatabdi: TrainDefinition = {
  trainNumber: "12002",
  trainName: "Bhopal Shatabdi Express",
  source: "New Delhi (NDLS)",
  destination: "Bhopal Jn (BPL)",
  stations: shatabdiStations,
  currentIndex: 1, // departed Agra Cantt, heading to Gwalior
  aheadOfCurrentKm: 41,
  currentDelayMin: 3,
  currentSpeedKmph: 132,
  previousStationDelayMin: 2,
  headway: "Low",
  weather: "Normal",
  scenarios: [
    { code: "NDLS", adjustmentMin: 0, confidencePercent: 98, historicalDeltaMin: 0, actualDelayMin: 0 },
    { code: "AGC", adjustmentMin: 0, confidencePercent: 97, historicalDeltaMin: -1, actualDelayMin: 3 },
    { code: "GWL", adjustmentMin: -1, confidencePercent: 95, historicalDeltaMin: -1 },
    { code: "JHS", adjustmentMin: -2, confidencePercent: 93, historicalDeltaMin: 0 },
    { code: "BPL", adjustmentMin: -2, confidencePercent: 90, historicalDeltaMin: -1 },
  ],
};

// --- 22436 Vande Bharat Express: New Delhi -> Varanasi ----------------------
const vandeBharatStations = stationsWithArrivalOffset([
  { code: "NDLS", name: "New Delhi", distanceFromSourceKm: 0, arrival: 6 * 60 + 0, halt: 0, platform: "16" },
  { code: "CNB", name: "Kanpur Central", distanceFromSourceKm: 440, arrival: 10 * 60 + 20, halt: 2, platform: "1" },
  { code: "PRYJ", name: "Prayagraj Jn", distanceFromSourceKm: 633, arrival: 12 * 60 + 20, halt: 2, platform: "5" },
  { code: "BSB", name: "Varanasi Jn", distanceFromSourceKm: 771, arrival: 14 * 60 + 0, halt: 0, platform: "1" },
]);

export const vandeBharat: TrainDefinition = {
  trainNumber: "22436",
  trainName: "Vande Bharat Express",
  source: "New Delhi (NDLS)",
  destination: "Varanasi Jn (BSB)",
  stations: vandeBharatStations,
  currentIndex: 1, // departed Kanpur Central, heading to Prayagraj
  aheadOfCurrentKm: 75,
  currentDelayMin: 11,
  currentSpeedKmph: 128,
  previousStationDelayMin: 9,
  headway: "Moderate",
  weather: "Fog",
  scenarios: [
    { code: "NDLS", adjustmentMin: 0, confidencePercent: 97, historicalDeltaMin: 0, actualDelayMin: 0 },
    { code: "CNB", adjustmentMin: 0, confidencePercent: 94, historicalDeltaMin: 4, actualDelayMin: 9 },
    { code: "PRYJ", adjustmentMin: 3, confidencePercent: 88, historicalDeltaMin: 5 },
    { code: "BSB", adjustmentMin: 4, confidencePercent: 84, historicalDeltaMin: 3 },
  ],
};

export const allTrainDefinitions: TrainDefinition[] = [
  malwaExpress,
  mumbaiRajdhani,
  bhopalShatabdi,
  vandeBharat,
];

export const trainSummaries: TrainSummary[] = allTrainDefinitions.map((t) => ({
  trainNumber: t.trainNumber,
  trainName: t.trainName,
  source: t.source,
  destination: t.destination,
}));

export function findTrainDefinition(trainNumber: string): TrainDefinition | undefined {
  return allTrainDefinitions.find((t) => t.trainNumber === trainNumber.trim());
}
