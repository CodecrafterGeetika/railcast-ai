import { Check, CircleDot, Circle, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StationETA } from "@/lib/types";
import { cn } from "@/lib/utils";
import { delayColor, formatDelay } from "@/lib/etaUtils";

function StationIcon({ status }: { status: StationETA["status"] }) {
  if (status === "departed") return <Check className="h-4 w-4 text-rail-signal" />;
  if (status === "current") return <CircleDot className="h-4 w-4 text-rail-accent2 animate-pulse-dot" />;
  if (status === "destination") return <Flag className="h-4 w-4 text-rail-amber" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export function StationTimeline({ stations }: { stations: StationETA[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ETA Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-1.5 space-y-0 border-l border-border">
          {stations.map((s, idx) => {
            const isLast = idx === stations.length - 1;
            return (
              <li key={s.stationCode} className="relative pb-6 pl-6 last:pb-0">
                <span className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy-900 ring-4 ring-navy-950">
                  <StationIcon status={s.status} />
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        s.status === "current" ? "text-rail-accent2" : "text-foreground"
                      )}
                    >
                      {s.stationName}
                      {s.status === "current" && (
                        <span className="ml-2 rounded-full bg-rail-accent2/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rail-accent2">
                          Current Location
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled {s.scheduledETA} · Predicted {s.predictedETA}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs font-medium", delayColor(s.predictedDelayMin))}>
                      {formatDelay(s.predictedDelayMin)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{s.confidencePercent}% confidence</p>
                  </div>
                </div>
                {!isLast && <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/50">↓</div>}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
