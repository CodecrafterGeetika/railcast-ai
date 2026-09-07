import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlatformConflict } from "@/lib/controlOfficeTypes";

const SEVERITY_VARIANT: Record<PlatformConflict["severity"], "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export function PlatformConflictPanel({ conflicts }: { conflicts: PlatformConflict[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicted Platform Conflicts</CardTitle>
        <CardDescription>
          Decision-support only — this does not automatically allocate or change platforms.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conflicts.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {c.station} — Platform {c.platform}
              </p>
              <Badge variant={SEVERITY_VARIANT[c.severity]}>{c.severity} severity</Badge>
            </div>
            <div className="mt-3 space-y-1.5">
              {c.trains.map((t) => (
                <div key={t.trainNumber} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-foreground">
                    {t.trainNumber} <span className="text-muted-foreground">— {t.trainName}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">ETA {t.eta}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rail-amber">
              <AlertTriangle className="h-3.5 w-3.5" />
              Conflict predicted in {c.conflictInMinutes} minutes.
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
