import { Target, Percent, TrendingDown, Sigma } from "lucide-react";
import { getModelMetrics } from "@/lib/dataProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorTrendChart, StationErrorBarChart } from "@/components/MetricsChart";

export const dynamic = "force-dynamic";

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
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
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PerformancePage() {
  const result = await getModelMetrics();
  const m = result.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Model Performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prototype evaluation of predicted vs. actual arrival times.
          </p>
        </div>
        <StatusBadge source={result.source} />
      </div>

      {m.isDemoMetrics && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-rail-amber/30 bg-rail-amber/10 px-4 py-2.5 text-xs text-rail-amber">
          <Badge variant="warning">Demo metrics</Badge>
          These numbers are demonstration values until connected to real evaluation data from a
          trained model.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Sigma} label="Model MAE" value={`${m.modelMAEMin} min`} hint={`Baseline: ${m.baselineMAEMin} min`} />
        <MetricCard icon={TrendingDown} label="Model RMSE" value={`${m.modelRMSEMin} min`} hint={`Baseline: ${m.baselineRMSEMin} min`} />
        <MetricCard icon={Target} label="Accuracy within ±5 min" value={`${m.accuracyWithin5MinPercent}%`} />
        <MetricCard icon={Percent} label="Accuracy within ±10 min" value={`${m.accuracyWithin10MinPercent}%`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Baseline vs. Model Error Trend</CardTitle>
            <CardDescription>Weekly mean absolute error across the demo evaluation window.</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorTrendChart data={m.errorTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Station-wise Errors</CardTitle>
            <CardDescription>Mean absolute error at key stations along the demo routes.</CardDescription>
          </CardHeader>
          <CardContent>
            <StationErrorBarChart data={m.stationWiseErrors} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-foreground">Improvement over baseline</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Baseline MAE {m.baselineMAEMin} min → Our Model MAE {m.modelMAEMin} min
            </p>
          </div>
          <p className="text-3xl font-bold text-rail-signal">{m.improvementPercent}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
