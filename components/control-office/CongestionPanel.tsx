import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CongestionPrediction } from "@/lib/controlOfficeTypes";

const LEVEL_VARIANT: Record<CongestionPrediction["level"], "success" | "warning" | "danger" | "secondary"> = {
  LOW: "success",
  MODERATE: "warning",
  HIGH: "danger",
  SEVERE: "danger",
};

export function CongestionPanel({ congestion }: { congestion: CongestionPrediction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicted Network Congestion</CardTitle>
        <CardDescription>Sections likely to see build-up in the near term.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {congestion.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-sm font-semibold text-foreground">{c.section}</p>
              <Badge variant={LEVEL_VARIANT[c.level]}>{c.level}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Expected in <span className="font-medium text-foreground">{c.predictedInMinutes} minutes</span> ·{" "}
              <span className="font-medium text-foreground">{c.affectedTrains}</span> trains affected
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Reason: {c.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
