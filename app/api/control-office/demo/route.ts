
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    source: "DEMO",
    location: "Bhubaneswar",
    division: "Bhubaneswar Division",

    weather: {
      condition: "Light Rain",
      temperature_c: 27,
      rainfall_mm: 4.2,
      wind_speed_kmh: 18,
      visibility_km: 6.5,
      weather_risk: "MEDIUM"
    },

    congestion: {
      score: 68,
      level: "MODERATE",
      reason: "Multiple trains approaching during a weather-affected operating window"
    },

    platformConflicts: [
      {
        train: "12801",
        platform: "Platform 4",
        expectedArrival: "16:48",
        conflictWith: "18477",
        conflictArrival: "16:52",
        risk: "HIGH",
        reason: "Arrival windows overlap by approximately 4 minutes"
      },
      {
        train: "12074",
        platform: "Platform 2",
        expectedArrival: "17:05",
        conflictWith: "12815",
        conflictArrival: "17:09",
        risk: "MEDIUM",
        reason: "Tight platform turnaround window"
      }
    ],

    recommendations: [
      {
        priority: "HIGH",
        title: "Prepare Platform 4",
        message:
          "Train 12801 is approaching with a predicted platform conflict. Prepare Platform 4 staff and verify alternate platform availability.",
        reason: "Overlapping arrival windows"
      },
      {
        priority: "MEDIUM",
        title: "Increase Platform Monitoring",
        message:
          "Moderate congestion detected. Monitor approaching trains and platform occupancy closely.",
        reason: "Congestion score 68/100"
      },
      {
        priority: "MEDIUM",
        title: "Weather Precaution",
        message:
          "Light rain and reduced visibility may affect operational conditions. Consider additional monitoring of approaching trains.",
        reason: "Weather risk: MEDIUM"
      }
    ],

    alerts: [
      {
        severity: "HIGH",
        message: "Potential platform conflict detected on Platform 4"
      },
      {
        severity: "MEDIUM",
        message: "Moderate congestion expected around the next operating window"
      },
      {
        severity: "MEDIUM",
        message: "Weather conditions may increase operational risk"
      }
    ]
  });
}

