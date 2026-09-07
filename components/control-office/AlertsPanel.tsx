import { Info, AlertTriangle, Siren, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { OperationalAlert } from "@/lib/controlOfficeTypes";

const SEVERITY_CONFIG: Record
  OperationalAlert["severity"],
  { icon: React.ElementType; style: string }
> = {
  info: { icon: Info, style: "border-rail-accent2/25 bg-rail-accent2/10 text-rail-accent2" },
  warning: { icon: AlertTriangle, style: "border-rail-amber/25 bg-rail-amber/10 text-rail-amber" },
  critical: { icon: Siren, style: "border-rail-red/25 bg-rail-red/10 text-rail-red" },
  success: { icon: CheckCircle2, style: "border-rail-signal/25 bg-rail-signal/10 text-rail-signal" },
};

export function AlertsPanel({ alerts }: { alerts: OperationalAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Predictive Alerts</CardTitle>
        <CardDescription>Generated from current delay trends and section conditions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          return (
            <div key={alert.id} className={`rounded-md border px-3 py-2.5 text-xs leading-relaxed ${config.style}`}>
              <div className="flex items-start gap-2">
                <config.icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground/95">{alert.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {alert.trainNumber && <>Train {alert.trainNumber}</>}
                    {alert.trainNumber && alert.section && " · "}
                    {alert.section && <>{alert.section}</>}
                    {alert.predictedTime && <> · Predicted {alert.predictedTime}</>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
