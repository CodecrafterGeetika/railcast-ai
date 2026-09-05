import type { CongestionLevel } from "./types";

/** Parses "HH:mm" into minutes since 00:00. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Converts minutes since 00:00 back into "HH:mm", wrapping across midnight. */
export function minutesToTime(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Adds (or subtracts) minutes from an "HH:mm" time string. */
export function addMinutes(time: string, delta: number): string {
  return minutesToTime(timeToMinutes(time) + delta);
}

/** Difference in minutes between two "HH:mm" times (b - a), handling day wrap heuristically. */
export function diffMinutes(a: string, b: string): number {
  let diff = timeToMinutes(b) - timeToMinutes(a);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}

export function formatDelay(min: number): string {
  if (min === 0) return "On time";
  const abs = Math.abs(min);
  return `${abs} min ${min > 0 ? "late" : "early"}`;
}

export function formatSignedMinutes(min: number): string {
  if (min === 0) return "0 min";
  return `${min > 0 ? "+" : "−"}${Math.abs(min)} min`;
}

export function formatDifferenceLabel(differenceMin: number): string {
  if (differenceMin === 0) return "Matches current ETA";
  const abs = Math.abs(differenceMin);
  return `${abs} minute${abs === 1 ? "" : "s"} ${differenceMin < 0 ? "earlier" : "later"}`;
}

export function congestionColor(level: CongestionLevel): string {
  switch (level) {
    case "Low":
      return "text-rail-signal";
    case "Moderate":
      return "text-rail-amber";
    case "High":
      return "text-orange-400";
    case "Severe":
      return "text-rail-red";
    default:
      return "text-rail-steel";
  }
}

export function delayColor(min: number): string {
  if (min <= 0) return "text-rail-signal";
  if (min <= 15) return "text-rail-amber";
  return "text-rail-red";
}

export function differenceColor(differenceMin: number): string {
  // negative = our prediction earlier than railway-reported ETA
  if (differenceMin < 0) return "text-rail-signal";
  if (differenceMin === 0) return "text-rail-steel";
  return "text-rail-amber";
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatClock(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "--:--";
  }
}
