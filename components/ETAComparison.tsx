import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETAPrediction } from "@/lib/types";
import { formatDifferenceLabel } from "@/lib/etaUtils";

export function ETAComparison({ prediction }: { prediction: ETAPrediction }) {
  const earlier = prediction.differenceMin < 0;
  const later = prediction.differenceMin > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ETA Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Railway ETA
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold text-foreground">
              {prediction.currentReportedETA}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Scheduled: {prediction.scheduledETA}</p>
          </div>
          <div className="rounded-lg border border-rail-accent/30 bg-rail-accent/[0.07] p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-rail-accent2">
              Our AI ETA
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold text-foreground">
              {prediction.predictedETA}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Range {prediction.predictionRangeStart}–{prediction.predictionRangeEnd}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border bg-navy-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={
                "flex h-9 w-9 items-center justify-center rounded-full " +
                (earlier
                  ? "bg-rail-signal/15 text-rail-signal"
                  : later
                  ? "bg-rail-amber/15 text-rail-amber"
                  : "bg-secondary text-muted-foreground")
              }
            >
              {earlier ? (
                <ArrowDown className="h-4.5 w-4.5" />
              ) : later ? (
                <ArrowUp className="h-4.5 w-4.5" />
              ) : (
                <Minus className="h-4.5 w-4.5" />
              )}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Difference vs current railway ETA</p>
              <p className="text-sm font-semibold text-foreground">
                {formatDifferenceLabel(prediction.differenceMin)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:justify-end">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-sm font-semibold text-foreground">{prediction.confidencePercent}%</p>
            </div>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rail-accent to-rail-accent2"
                style={{ width: `${prediction.confidencePercent}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          This prediction is not claimed to be more accurate than the railway-reported ETA unless
          supported by evaluation metrics — see{" "}
          <span className="font-medium text-foreground">Model Performance</span> for demo evaluation
          data.
        </p>
      </CardContent>
    </Card>
  );
}
