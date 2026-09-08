import type { RailRadarEnvelope, RailRadarErrorEnvelope } from "./railradarTypes";

export interface RailRadarStationLiveTrain {
  train: {
    number: string;
    name: string;
    type?: string;
    category?: string;
    source?: { code: string; name: string };
    destination?: { code: string; name: string };
  };

  stop: {
    sequence: number;
    arrival?: string | null;
    departure?: string | null;
    day?: number;
    distance?: number;
  };

  live: {
    type: "at-station" | "upcoming" | "departed" | "scheduled" | string;
    expectedDepartureTime?: string | null;
    expectedArrivalTime?: string | null;
    platform?: string | number | null;
    delayMinutes?: number | null;
  };
}

export interface RailRadarStationLiveData {
  station: {
    code: string;
    name: string;
  };

  window: {
    hours: number;
    from: string;
    to: string;
  };

  count: number;
  trains: RailRadarStationLiveTrain[];
}

export type RailRadarStationEnvelope =
  RailRadarEnvelope<RailRadarStationLiveData>;

export type RailRadarStationErrorEnvelope =
  RailRadarErrorEnvelope;

export interface NormalizedStationTrain {
  trainNumber: string;
  trainName: string;
  stationCode: string;
  stationName: string;
  liveType: string;
  expectedTime: string | null;
  platform: string | null;
  delayMinutes: number;
  scheduledArrival: string | null;
  scheduledDeparture: string | null;
  sourceName: string | null;
  destinationName: string | null;
}
