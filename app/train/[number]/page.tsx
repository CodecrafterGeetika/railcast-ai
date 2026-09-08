
import Link from "next/link";
import {
  Clock,
  Gauge,
  MapPin,
  TimerReset,
  AlertTriangle,
  CloudRain,
  Wind,
  Eye,
  Thermometer,
} from "lucide-react";

import { getFullTrainDashboard, getModelMetrics } from "@/lib/dataProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { ETAComparison } from "@/components/ETAComparison";
import { ConfidenceRange } from "@/components/ConfidenceRange";
import { StationETATable } from "@/components/StationETATable";
import { StationTimeline } from "@/components/StationTimeline";
import { PredictionFactors } from "@/components/PredictionFactors";
import { BaselineVsModelSummaryChart } from "@/components/MetricsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainSearch } from "@/components/TrainSearch";
import { trainSummaries } from "@/data/mockTrains";
import { formatClock } from "@/lib/etaUtils";
import { interpolateCoords } from "@/lib/stationCoords";
import type { WeatherResult } from "@/lib/weatherTypes";

export const dynamic = "force-dynamic";

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-900 text-rail-accent2">
        <Icon className="h-4.5 w-4.5" />
      </span>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className={`text-sm font-semibold ${accent ?? "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function TrainDashboardPage({
  params,
}: {
  params: { number: string };
}) {
  const trainNumber = params.number;

  let dashboard: Awaited<ReturnType<typeof getFullTrainDashboard>> | null =
    null;

  try {
    dashboard = await getFullTrainDashboard(trainNumber);
  } catch {
    dashboard = null;
  }

  const metricsResult = await getModelMetrics();

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-rail-amber" />

            <h1 className="mt-4 text-xl font-semibold text-foreground">
              No data available for train {trainNumber}
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We couldn&apos;t retrieve live or demo data for this train
              number. Try one of the demo trains below.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {trainSummaries.map((t) => (
                <Link
                  key={t.trainNumber}
                  href={`/train/${t.trainNumber}`}
                  className="rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-sm font-medium hover:bg-secondary"
                >
                  {t.trainNumber} — {t.trainName}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { status, route, stationETAs, prediction, source } = dashboard;

  const metrics = metricsResult.data;

  /*
   * ---------------------------------------------------------
   * FIND CURRENT + NEXT STATION
   * ---------------------------------------------------------
   */

  const currentStationData = stationETAs.find(
    (station) => station.status === "current"
  );

  const nextStationData = stationETAs.find(
    (station) => station.status === "next"
  );

  const currentStationCode =
    currentStationData?.stationCode ?? prediction.stationCode;

  const nextStationCode =
    nextStationData?.stationCode ?? currentStationCode;

  /*
   * ---------------------------------------------------------
   * CALCULATE TRAIN POSITION BETWEEN CURRENT + NEXT STATION
   * ---------------------------------------------------------
   */

  const currentRouteStation = route.stations.find(
    (station) => station.code === currentStationCode
  );

  const nextRouteStation = route.stations.find(
    (station) => station.code === nextStationCode
  );

  /*
   * ---------------------------------------------------------
   * FETCH LIVE WEATHER
   * ---------------------------------------------------------
   */

  let weather: WeatherResult | null = null;

  if (currentRouteStation && nextRouteStation) {
    const sectionLength = Math.max(
      nextRouteStation.distanceFromSourceKm -
        currentRouteStation.distanceFromSourceKm,
      1
    );

    const travelledInSection =
      status.distanceTravelledKm -
      currentRouteStation.distanceFromSourceKm;

    const fraction = Math.max(
      0,
      Math.min(1, travelledInSection / sectionLength)
    );

    const [lat, lon] = interpolateCoords(
      currentStationCode,
      nextStationCode,
      fraction
    );

    try {
      /*
       * Server-side page -> our own weather API.
       *
       * In production this uses the Vercel URL.
       * In local development it uses localhost.
       */

      const origin =
        process.env.NEXT_PUBLIC_APP_URL ??
        (process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://railcast-ai.vercel.app");

      const weatherResponse = await fetch(
        `${origin}/api/weather?lat=${lat}&lon=${lon}`,
        {
          cache: "no-store",
        }
      );

      if (weatherResponse.ok) {
        weather = (await weatherResponse.json()) as WeatherResult;
      }
    } catch {
      weather = null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* =====================================================
          TOP SECTION
      ====================================================== */}

      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl font-bold text-foreground">
              {status.trainNumber}
            </span>

            <h1 className="text-2xl font-semibold text-foreground">
              {status.trainName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {status.source} → {status.destination}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge source={source} />

          <p className="text-xs text-muted-foreground">
            Last updated {formatClock(status.lastUpdated)}
          </p>
        </div>
      </div>

      {/* =====================================================
          DEMO DATA WARNING
      ====================================================== */}

      {source === "demo" && (
        <div className="mt-4 rounded-md border border-rail-amber/30 bg-rail-amber/10 px-4 py-2.5 text-xs text-rail-amber">
          Live railway data temporarily unavailable. Showing simulation data.
        </div>
      )}

      {/* =====================================================
          CURRENT STATUS TILES
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={MapPin}
          label="Current Location"
          value={status.currentStation}
        />

        <StatTile
          icon={Gauge}
          label="Current Speed"
          value={`${status.currentSpeedKmph} km/h`}
        />

        <StatTile
          icon={TimerReset}
          label="Current Delay"
          value={
            status.currentDelayMin <= 0
              ? "On time"
              : `${status.currentDelayMin} min`
          }
          accent={
            status.currentDelayMin > 15
              ? "text-rail-red"
              : status.currentDelayMin > 0
              ? "text-rail-amber"
              : "text-rail-signal"
          }
        />

        <StatTile
          icon={Clock}
          label="Next Station"
          value={status.nextStation}
        />
      </div>

      <div className="mt-3">
        <Badge
          variant={
            status.runningStatus === "Delayed" ? "warning" : "success"
          }
        >
          {status.runningStatus}
        </Badge>

        <span className="ml-3 text-xs text-muted-foreground">
          {status.distanceTravelledKm} km travelled ·{" "}
          {status.remainingDistanceKm} km remaining
        </span>
      </div>

      {/* =====================================================
          🌦️ LIVE WEATHER CARD
          
          THIS IS THE WEATHER CARD.
          IT APPEARS DIRECTLY BELOW THE CURRENT STATUS SECTION.
      ====================================================== */}

      {weather && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-rail-accent2" />

                <CardTitle>Live Weather Conditions</CardTitle>
              </div>

              <Badge
                variant={
                  weather.weatherRisk === "HIGH"
                    ? "danger"
                    : weather.weatherRisk === "MEDIUM"
                    ? "warning"
                    : "success"
                }
              >
                {weather.weatherRisk} RISK
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">

              <StatTile
                icon={Thermometer}
                label="Temperature"
                value={`${weather.temperature}°C`}
              />

              <StatTile
                icon={CloudRain}
                label="Rainfall"
                value={`${weather.rainfall} mm`}
              />

              <StatTile
                icon={Wind}
                label="Wind"
                value={`${weather.windSpeed} km/h`}
              />

              <StatTile
                icon={Eye}
                label="Visibility"
                value={`${(weather.visibility / 1000).toFixed(1)} km`}
              />

              <StatTile
                icon={CloudRain}
                label="Condition"
                value={weather.condition}
              />

            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Weather near the train&apos;s current section between{" "}
              <span className="font-medium text-foreground">
                {currentStationData?.stationName ?? status.currentStation}
              </span>{" "}
              and{" "}
              <span className="font-medium text-foreground">
                {nextStationData?.stationName ?? status.nextStation}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          MAIN GRID
      ====================================================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">

        {/* LEFT / MAIN COLUMN */}

        <div className="space-y-6 lg:col-span-2">

          <ETAComparison prediction={prediction} />

          <StationTimeline stations={stationETAs} />

          <StationETATable stations={stationETAs} />

        </div>

        {/* RIGHT COLUMN */}

        <div className="space-y-6">

          <ConfidenceRange prediction={prediction} />

          <PredictionFactors factors={prediction.factors} />

          {/* =================================================
              PROTOTYPE EVALUATION
          ================================================== */}

          <Card>
            <CardHeader>
              <CardTitle>Prototype Evaluation</CardTitle>
            </CardHeader>

            <CardContent>
              <Badge variant="warning" className="mb-3">
                Demo metrics
              </Badge>

              <BaselineVsModelSummaryChart
                baselineMAEMin={metrics.baselineMAEMin}
                modelMAEMin={metrics.modelMAEMin}
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Improvement:{" "}
                <span className="font-medium text-foreground">
                  {metrics.improvementPercent}%
                </span>{" "}
                — demo metrics until connected to the actual trained model.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* =====================================================
          TRAIN SEARCH
      ====================================================== */}

      <div className="mt-10">
        <TrainSearch />
      </div>

    </div>
  );
}

