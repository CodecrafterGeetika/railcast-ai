// ---------------------------------------------------------------------------
// Types for the Control Office (Divisional) dashboard.
// Kept in a dedicated file so the existing lib/types.ts used by the
// passenger-facing pages is left completely untouched.
// ---------------------------------------------------------------------------

export type OperationalPriority = "HIGH" | "MEDIUM" | "NORMAL";

export type LiveTrainOperationalStatus = "On Time" | "Delayed" | "Critical" | "Recovering";

export interface LiveTrainRow {
  trainNumber: string;
  trainName: string;
  currentLocation: string;
  eta: string; // "HH:mm"
  delayMin: number; // negative = recovering / ahead
  speedKmph: number;
  priority: OperationalPriority;
  status: LiveTrainOperationalStatus;
}

export type CongestionLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

export interface CongestionPrediction {
  id: string;
  section: string; // e.g. "BBS → CTC"
  level: CongestionLevel;
  predictedInMinutes: number;
  affectedTrains: number;
  reason: string;
}

export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface PlatformConflictTrain {
  trainNumber: string;
  trainName: string;
  eta: string;
}

export interface PlatformConflict {
  id: string;
  station: string;
  platform: string;
  trains: PlatformConflictTrain[];
  conflictInMinutes: number;
  severity: ConflictSeverity;
}

export type AlertSeverity = "info" | "warning" | "critical" | "success";

export interface OperationalAlert {
  id: string;
  severity: AlertSeverity;
  trainNumber?: string;
  section?: string;
  message: string;
  predictedTime?: string; // "HH:mm"
}

export interface OperationalRecommendation {
  id: string;
  message: string;
  relatedTo?: string;
}

export type TimelineEventType = "arrival" | "conflict" | "section" | "resolution";

export interface TimelineEvent {
  time: string; // "HH:mm"
  description: string;
  type: TimelineEventType;
}

export interface ControlOfficeSummary {
  divisionName: string;
  networkName: string;
  generatedAt: string; // ISO timestamp
  normalCount: number;
  delayedCount: number;
  criticalCount: number;
  predictedConflictsCount: number;
  liveTrains: LiveTrainRow[];
  congestion: CongestionPrediction[];
  platformConflicts: PlatformConflict[];
  alerts: OperationalAlert[];
  recommendations: OperationalRecommendation[];
  timeline: TimelineEvent[];
}
