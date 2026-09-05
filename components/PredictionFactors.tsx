import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PredictionFactor } from "@/lib/types";
import { formatSignedMinutes } from "@/lib/etaUtils";
import { cn } from "@/lib/utils";

export function PredictionFactors({ factors }: { factors: PredictionFactor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Why did our ETA change?</CardTitle>
        <CardDescription>
          Explanatory demo values — structured so these will later be produced directly by the ML
          backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/70">
          {factors.map((factor) => (
            <li key={factor.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{factor.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{factor.description}</p>
              </div>
              <div className="shrink-0 text-right">
                {factor.displayValue ? (
                  <span className="text-sm font-semibold text-foreground">{factor.displayValue}</span>
                ) : (
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold",
                      factor.impactMin < 0
                        ? "text-rail-signal"
                        : factor.impactMin > 0
                        ? "text-rail-amber"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatSignedMinutes(factor.impactMin)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
