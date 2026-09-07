import { allTrainDefinitions } from "@/data/mockTrains";
import { buildTrainStatus, buildPrediction } from "@/lib/mockProvider";
import { addMinutes } from "@/lib/etaUtils";
import type {
  ControlOfficeSummary,
  LiveTrainRow,
  OperationalPriority,
  LiveTrainOperationalStatus,
  CongestionPrediction,
  PlatformConflict,
  OperationalAlert,
  OperationalRecommendation,
  TimelineEvent,
} from "@/lib/controlOfficeTypes";

// ---------------------------------------------------------------------------
// Mock data layer for the Control Office dashboard ONLY.
//
// This does NOT duplicate the existing passenger data architecture:
//  - The 4 existing demo trains are reused directly via buildTrainStatus()
//    and buildPrediction() from lib/mockProvider.ts (same source of truth
//    as the passenger ETA pages and the existing Operations Control page).
//  - A small set of additional named trains is added below purely to give a
//    realistic divisional-scale picture (congestion + platform conflicts
//    spanning a section, e.g. BBS → CTC) since the existing demo fleet runs
//    on routes that don't share a section together.
//
// All figures here are illustrative demo/simulation data, clearly labeled as
// such in the UI, exactly like the existing Model Performance demo metrics.
// ---------------------------------------------------------------------------

function classifyPriority(trainName: string): OperationalPriority {
  const name = trainName.toLowerCase();
  if (name.includes("rajdhani") || name.includes("shatabdi") || name.includes("vande bharat") || name.includes("duronto")) {
    return "HIGH";
  }
  if (name.includes("express") || name.includes("sf express") || name.includes("superfast") || name.includes("mail")) {
    return "MEDIUM";
  }
  return "NORMAL";
}

function classifyStatus(delayMin: number): LiveTrainOperationalStatus {
  if (delayMin < 0) return "Recovering";
  if (delayMin <= 5) return "On Time";
  if (delayMin <= 20) return "Delayed";
  return "Critical";
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Live rows sourced from the existing 4 demo trains (real reuse, not duplicated data). */
function buildExistingFleetRows(): LiveTrainRow[] {
  return allTrainDefinitions.map((def) => {
    const status = buildTrainStatus(def);
    const prediction = buildPrediction(def);
    return {
      trainNumber: status.trainNumber,
      trainName: status.trainName,
      currentLocation: status.currentStation,
      eta: prediction.predictedETA,
      delayMin: status.currentDelayMin,
      speedKmph: status.currentSpeedKmph,
      priority: classifyPriority(status.trainName),
      status: classifyStatus(status.currentDelayMin),
    };
  });
}

/**
 * Additional named trains for the BBS ↔ CTC divisional-section narrative
 * (congestion + platform conflicts). Purely additive demo data — does not
 * replace or alter the existing mock train fleet in data/mockTrains.ts.
 */
function buildSectionFleetRows(): LiveTrainRow[] {
  return [
    {
      trainNumber: "12801",
      trainName: "Purushottam Express",
      currentLocation: "Approaching Bhubaneswar (BBS)",
      eta: addMinutes(nowHHMM(), 8),
      delayMin: 18,
      speedKmph: 84,
      priority: "HIGH",
      status: "Delayed",
    },
    {
      trainNumber: "12875",
      trainName: "Neelachal Express",
      currentLocation: "Cuttack (CTC) outer signal",
      eta: addMinutes(nowHHMM(), 12),
      delayMin: 8,
      speedKmph: 71,
      priority: "HIGH",
      status: "Delayed",
    },
    {
      trainNumber: "22801",
      trainName: "Puri–Howrah Vande Bharat Express",
      currentLocation: "Khurda Road Jn (KUR)",
      eta: addMinutes(nowHHMM(), 22),
      delayMin: -5,
      speedKmph: 118,
      priority: "HIGH",
      status: "Recovering",
    },
    {
      trainNumber: "18477",
      trainName: "Kalinga Utkal Express",
      currentLocation: "Approaching Cuttack (CTC)",
      eta: addMinutes(nowHHMM(), 36),
      delayMin: 25,
      speedKmph: 58,
      priority: "MEDIUM",
      status: "Critical",
    },
    {
      trainNumber: "58501",
      trainName: "Khurda Road–Puri Passenger",
      currentLocation: "Khurda Road Jn (KUR)",
      eta: addMinutes(nowHHMM(), 40),
      delayMin: 3,
      speedKmph: 42,
      priority: "NORMAL",
      status: "On Time",
    },
  ];
}

function buildCongestion(): CongestionPrediction[] {
  return [
    {
      id: "congestion-bbs-ctc",
      section: "BBS → CTC",
      level: "HIGH",
      predictedInMinutes: 20,
      affectedTrains: 6,
      reason: "Multiple delayed trains converging on the section from both directions.",
    },
    {
      id: "congestion-kur-bbs",
      section: "KUR → BBS",
      level: "MODERATE",
      predictedInMinutes: 35,
      affectedTrains: 3,
      reason: "Suburban and mail traffic overlapping during the peak arrival window.",
    },
    {
      id: "congestion-ctc-bhc",
      section: "CTC → BHC",
      level: "LOW",
      predictedInMinutes: 50,
      affectedTrains: 1,
      reason: "Minor headway compression caused by a single delayed freight path.",
    },
  ];
}

function buildPlatformConflicts(): PlatformConflict[] {
  return [
    {
      id: "conflict-bbs-p3",
      station: "Bhubaneswar (BBS)",
      platform: "3",
      trains: [
        { trainNumber: "12801", trainName: "Purushottam Express", eta: addMinutes(nowHHMM(), 8) },
        { trainNumber: "12875", trainName: "Neelachal Express", eta: addMinutes(nowHHMM(), 12) },
      ],
      conflictInMinutes: 24,
      severity: "HIGH",
    },
    {
      id: "conflict-ctc-p2",
      station: "Cuttack (CTC)",
      platform: "2",
      trains: [
        { trainNumber: "18477", trainName: "Kalinga Utkal Express", eta: addMinutes(nowHHMM(), 36) },
        { trainNumber: "58501", trainName: "Khurda Road–Puri Passenger", eta: addMinutes(nowHHMM(), 40) },
      ],
      conflictInMinutes: 38,
      severity: "MEDIUM",
    },
  ];
}

function buildAlerts(): OperationalAlert[] {
  return [
    {
      id: "alert-1",
      severity: "warning",
      trainNumber: "12801",
      message: "Train 12801 may arrive 18 minutes late at BBS.",
      predictedTime: addMinutes(nowHHMM(), 8),
    },
    {
      id: "alert-2",
      severity: "critical",
      section: "BBS → CTC",
      message: "High congestion predicted between BBS → CTC.",
      predictedTime: addMinutes(nowHHMM(), 20),
    },
    {
      id: "alert-3",
      severity: "warning",
      section: "Bhubaneswar (BBS), Platform 3",
      message: "Platform conflict predicted at BBS in 24 minutes.",
      predictedTime: addMinutes(nowHHMM(), 24),
    },
    {
      id: "alert-4",
      severity: "success",
      trainNumber: "22801",
      message: "Train 22801 expected to recover 5 minutes of delay.",
    },
    {
      id: "alert-5",
      severity: "critical",
      trainNumber: "18477",
      message: "Train 18477 running 25 minutes behind schedule approaching CTC.",
      predictedTime: addMinutes(nowHHMM(), 36),
    },
  ];
}

function buildRecommendations(): OperationalRecommendation[] {
  return [
    {
      id: "rec-1",
      relatedTo: "Train 12875",
      message: "Consider preparing an alternate platform for Train 12875 at Bhubaneswar (BBS).",
    },
    {
      id: "rec-2",
      relatedTo: "BBS → CTC",
      message: "High congestion is expected in the next 20 minutes. Monitor CTC approaches closely.",
    },
    {
      id: "rec-3",
      relatedTo: "Train 12801",
      message:
        "Cleaning and catering teams should be prepared approximately 10 minutes before the predicted arrival of Train 12801.",
    },
    {
      id: "rec-4",
      relatedTo: "Train 58501",
      message: "Consider a short hold for Train 58501 at Khurda Road Jn to ease platform pressure at Cuttack.",
    },
  ];
}

function buildTimeline(): TimelineEvent[] {
  return [
    { time: nowHHMM(), description: "Train 12801 enters BBS approach section", type: "section" },
    { time: addMinutes(nowHHMM(), 8), description: "Predicted arrival of Train 12801 at BBS, Platform 3", type: "arrival" },
    { time: addMinutes(nowHHMM(), 12), description: "Predicted arrival of Train 12875 at BBS, Platform 3", type: "arrival" },
    { time: addMinutes(nowHHMM(), 20), description: "Congestion expected to peak on BBS → CTC section", type: "section" },
    { time: addMinutes(nowHHMM(), 24), description: "Possible platform conflict at BBS, Platform 3", type: "conflict" },
    { time: addMinutes(nowHHMM(), 36), description: "Train 18477 predicted arrival approaching CTC, running critical", type: "arrival" },
    { time: addMinutes(nowHHMM(), 45), description: "Congestion on BBS → CTC expected to reduce", type: "resolution" },
  ];
}

export async function mockGetControlOfficeSummary(): Promise<ControlOfficeSummary> {
  await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 180));

  const liveTrains = [...buildExistingFleetRows(), ...buildSectionFleetRows()];
  const platformConflicts = buildPlatformConflicts();
  const congestion = buildCongestion();

  // Illustrative divisional-scale aggregate figures for the KPI cards. The
  // live table below lists the specific monitored trains in detail; these
  // totals represent a wider, unlisted division-scale demo network so the
  // dashboard reads at the scale a real Control Office would operate at.
  const normalCount = 28;
  const delayedCount = 12;
  const criticalCount = 6;
  const predictedConflictsCount =
    platformConflicts.length + congestion.filter((c) => c.level === "HIGH" || c.level === "SEVERE").length;

  return {
    divisionName: "Khurda Road Division",
    networkName: "East Coast Railway (Demo)",
    generatedAt: new Date().toISOString(),
    normalCount,
    delayedCount,
    criticalCount,
    predictedConflictsCount,
    liveTrains,
    congestion,
    platformConflicts,
    alerts: buildAlerts(),
    recommendations: buildRecommendations(),
    timeline: buildTimeline(),
  };
}
