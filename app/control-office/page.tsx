import { Radio } from "lucide-react";
import { getControlOfficeSummary } from "@/lib/dataProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { RefreshButton } from "@/components/control-office/RefreshButton";
import { NetworkStatusCards } from "@/components/control-office/NetworkStatusCards";
import { LiveTrainTable } from "@/components/control-office/LiveTrainTable";
import { CongestionPanel } from "@/components/control-office/CongestionPanel";
import { PlatformConflictPanel } from "@/components/control-office/PlatformConflictPanel";
import { AlertsPanel } from "@/components/control-office/AlertsPanel";
import { RecommendationsPanel } from "@/components/control-office/RecommendationsPanel";
import { EventsTimeline } from "@/components/control-office/EventsTimeline";
import { formatClock } from "@/lib/etaUtils";

export const dynamic = "force-dynamic";

export default async function ControlOfficePage() {
  const result = await getControlOfficeSummary();
  const summary = result.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Radio className="h-3.5 w-3.5" />
            {summary.divisionName} · {summary.networkName}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            DIVISIONAL CONTROL OFFICE
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-Powered Railway Operations &amp; Predictive ETA
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="flex items-center gap-2">
            <StatusBadge source={result.source} />
            <RefreshButton />
          </div>
          <p className="text-xs text-muted-foreground">Last updated {formatClock(summary.generatedAt)}</p>
        </div>
      </div>

      {result.source === "demo" && (
        <div className="mt-4 rounded-md border border-rail-amber/30 bg-rail-amber/10 px-4 py-2.5 text-xs text-rail-amber">
          Live operations feed temporarily unavailable. Showing simulation data.
        </div>
      )}

      {/* A. Network status cards */}
      <div className="mt-6">
        <NetworkStatusCards
          normal={summary.normalCount}
          delayed={summary.delayedCount}
          critical={summary.criticalCount}
          predictedConflicts={summary.predictedConflictsCount}
        />
      </div>

      {/* B. Live train movement table */}
      <div className="mt-6">
        <LiveTrainTable trains={summary.liveTrains} />
      </div>

      {/* C + D. Congestion and platform conflicts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CongestionPanel congestion={summary.congestion} />
        <PlatformConflictPanel conflicts={summary.platformConflicts} />
      </div>

      {/* F + G. Alerts and recommendations */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AlertsPanel alerts={summary.alerts} />
        <RecommendationsPanel recommendations={summary.recommendations} />
      </div>

      {/* H. Upcoming events timeline */}
      <div className="mt-6">
        <EventsTimeline events={summary.timeline} />
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Priority classification, congestion, platform-conflict and recommendation content on this
        page are prototype/demo outputs for decision support. They are not automatic control
        actions and are not an authoritative Indian Railways control rule.
      </p>
    </div>
  );
}
