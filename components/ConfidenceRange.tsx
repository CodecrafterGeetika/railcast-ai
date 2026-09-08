import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETAPrediction } from "@/lib/types";
import { timeToMinutes } from "@/lib/etaUtils";

export function ConfidenceRange({
  prediction,
}: {
  prediction: ETAPrediction;
}) {
  const rangeStart = timeToMinutes(prediction.predictionRangeStart);
  const rangeEnd = timeToMinutes(prediction.predictionRangeEnd);
  const predicted = timeToMinutes(prediction.predictedETA);

  const span = Math.max(rangeEnd - rangeStart, 1);
  const markerPct = ((predicted - rangeStart) / span) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction Uncertainty</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Our predicted arrival
            </p>

            <p className="font-mono text-2xl font-semibold text-foreground">
              {prediction.predictedETA}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Confidence
            </p>

            <p className="text-lg font-semibold text-rail-accent2">
              {prediction.confidencePercent == null
                ? "—"
                : `${prediction.confidencePercent}%`}
            </p>
          </div>
        </div>

        <div className="relative mt-6 h-2 rounded-full bg-secondary">
          <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-rail-accent/40 via-rail-accent2/40 to-rail-accent/40" />

          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy-950 bg-rail-accent2 shadow"
            style={{
              left: `${Math.min(
                Math.max(markerPct, 0),
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{prediction.predictionRangeStart}</span>
          <span>Likely range</span>
          <span>{prediction.predictionRangeEnd}</span>
        </div>

        <p className="mt-4 rounded-md border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
          Prediction interval reflects uncertainty in current operating
          conditions. Statistical validity is not claimed until the real ML
          model is connected to historical outcome data.
        </p>
      </CardContent>
    </Card>
  );
}
