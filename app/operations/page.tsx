import { AlertTriangle, Activity, Gauge, TrendingUp, Radio } from "lucide-react";
import { getOperationsSummary } from "@/lib/dataProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { NetworkMapLoader } from "@/components/NetworkMapLoader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { congestionColor, formatClock } from "@/lib/etaUtils";

export const dynamic = "force-dynamic";

const SEVERITY_STYLE = {
  info: "border-rail-signal/25 bg-rail-signal/10 text-rail-signal",
  warning: "border-rail-amber/25 bg-rail-amber/10 text-rail-amber",
  critical: "border-rail-red/25 bg-rail-red/10 text-rail-red",
};

const SEVERITY_ICON_COLOR = {
  info: "🟢",
  warning: "⚠️",
  critical: "⚠️",
};

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-rail-accent/10 text-rail-accent2">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function OperationsPage() {
  const result = await getOperationsSummary();
  const summary = result.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Operations Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Network-wide view of running trains, delay risk and prediction confidence.
          </p>
        </div>
        <StatusBadge source={result.source} />
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Activity} label="Trains Running" value={String(summary.trainsRunning)} />
        <KpiCard icon={AlertTriangle} label="Delayed" value={String(summary.trainsDelayed)} />
        <KpiCard icon={Radio} label="At Risk" value={String(summary.trainsAtRisk)} />
        <KpiCard
          icon={Gauge}
          label="Avg. Network Delay"
          value={`${summary.averageNetworkDelayMin} min`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg. Confidence"
          value={`${summary.averagePredictionConfidencePercent}%`}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Network congestion:</span>
        <span className={`font-semibold ${congestionColor(summary.networkCongestion)}`}>
          {summary.networkCongestion}
        </span>
      </div>

      {/* Map + alerts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Network Overview</CardTitle>
              <CardDescription>
                Selected demo corridors and current train positions. Falls back to a simplified
                overlay if map tiles are unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkMapLoader trains={summary.networkTrains} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Auto-generated from current delay and prediction trend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-md border px-3 py-2.5 text-xs leading-relaxed ${SEVERITY_STYLE[alert.severity]}`}
              >
                <p className="font-semibold">
                  {SEVERITY_ICON_COLOR[alert.severity]} Train {alert.trainNumber} — {alert.trainName}
                </p>
                <p className="mt-1 text-foreground/90">{alert.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{formatClock(alert.timestamp)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Station-wise ETA errors */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Station-wise ETA Errors</CardTitle>
            <CardDescription>Average absolute error between predicted and actual arrival, by station.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:px-2 sm:pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Avg. ETA Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.stationWiseETAErrors.map((row) => (
                  <TableRow key={row.stationCode}>
                    <TableCell className="font-medium text-foreground">{row.stationName}</TableCell>
                    <TableCell className="font-mono">{row.avgErrorMin.toFixed(1)} min</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
