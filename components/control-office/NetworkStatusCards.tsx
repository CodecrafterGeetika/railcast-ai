import { CheckCircle2, AlertTriangle, Siren, GitMerge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function NetworkStatusCards({
  normal,
  delayed,
  critical,
  predictedConflicts,
}: {
  normal: number;
  delayed: number;
  critical: number;
  predictedConflicts: number;
}) {
  const items = [
    { icon: CheckCircle2, label: "Normal Trains", value: normal, color: "text-rail-signal", bg: "bg-rail-signal/10" },
    { icon: AlertTriangle, label: "Delayed Trains", value: delayed, color: "text-rail-amber", bg: "bg-rail-amber/10" },
    { icon: Siren, label: "Critical Trains", value: critical, color: "text-rail-red", bg: "bg-rail-red/10" },
    { icon: GitMerge, label: "Predicted Conflicts", value: predictedConflicts, color: "text-rail-accent2", bg: "bg-rail-accent/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-3 p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-md ${item.bg} ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="text-xl font-semibold text-foreground">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
