// ---------------------------------------------------------------------------
// Types for the RailRadar integration.
//
// The "Raw*" interfaces below list ONLY the fields we actually consume from
// https://railradar.in/docs/live-train-status — verified against RailRadar's
// real published response example, not guessed. RailRadar's response has
// more fields (coach layout, full diversion detail, etc.) that we simply
// don't type here since we don't use them yet.
// ---------------------------------------------------------------------------

export interface RailRadarEnvelope<T> {
  success: true;
  data: T;
  meta: {
    traceId: string;
    timestamp: string;
    executionTime: number;
    source: string;
  };
}

export interface RailRadarErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta?: {
    traceId: string;
    timestamp: string;
  };
}

export interface RailRadarRouteStop {
  sequence: number;
  stationCode: string;
  stationName: string;
  isHalt: boolean;
  lat?: number;
  lng?: number;
  status: "departed" | "current" | "upcoming" | string;
  distance: number;
  platform: string | null;
}

export interface RailRadarLiveTrainData {
  trainNumber: string;
  trainName: string;
  startDate: string;
  lastUpdatedAt: string;
  status: string; // e.g. "running", "scheduled", "terminated"
  delayMinutes: number;
  train: {
    number: string;
    name: string;
    type: string;
    category: string;
    source: { code: string; name: string };
    destination: { code: string; name: string };
    distance: number; // total route distance, km
  };
  currentLocation: {
    stationCode: string;
    sequence: number;
    status: string;
    isHalt: boolean;
    segmentProgress: number; // 0.0–1.0
    speedKmh: number;
  };
  previousHalt: {
    stationCode: string;
    stationName: string;
    sequence: number;
    distance: number;
  } | null;
  nextHalt: {
    stationCode: string;
    stationName: string;
    sequence: number;
    distance: number;
  } | null;
  exceptions?: { type: string; message: string }[];
  route?: RailRadarRouteStop[];
  isLive: boolean;
}

// ---------------------------------------------------------------------------
// Our own clean internal structure (per the integration spec), independent
// of RailRadar's raw shape. app/api/railradar/train/[trainNumber]/route.ts
// returns exactly this to the frontend.
// ---------------------------------------------------------------------------

export interface NormalizedLiveTrain {
  trainNumber: string;
  trainName: string;
  trainType: string;
  category: string;

  status: string;

  currentLocation: {
    stationCode: string;
    stationName: string;
    latitude: number | null;
    longitude: number | null;
    segmentProgress: number;
    speedKmh: number;
    status: string;
  };

  delayMinutes: number;

  previousStation: {
    code: string;
    name: string;
  } | null;

  nextStation: {
    code: string;
    name: string;
    distance: number;
  } | null;

  platform: string | null;

  hasException: boolean;
  exceptionMessage: string | null;

  lastUpdatedAt: string;

  isLive: true;
  source: "railradar";
}
