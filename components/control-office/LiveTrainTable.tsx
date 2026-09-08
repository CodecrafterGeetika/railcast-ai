import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/control-office/PriorityBadge";
import type { LiveTrainRow } from "@/lib/controlOfficeTypes";
import { delayColor, formatDelay } from "@/lib/etaUtils";

const STATUS_VARIANT: Record<LiveTrainRow["status"], "success" | "warning" | "danger" | "secondary"> = {
  "On Time": "success",
  Delayed: "warning",
  Critical: "danger",
  Recovering: "secondary",
};

export function LiveTrainTable({ trains }: { trains: LiveTrainRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Train Movement</CardTitle>
        <CardDescription>
          Current position, delay and priority for monitored trains in this division.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:px-2 sm:pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Train</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trains.map((t) => (
              <TableRow key={t.trainNumber}>
                <TableCell>
                  <span className="font-mono font-semibold text-foreground">{t.trainNumber}</span>
                  <span className="block text-xs text-muted-foreground">{t.trainName}</span>
                </TableCell>
                <TableCell className="text-sm text-foreground">{t.currentLocation}</TableCell>
                <TableCell className="font-mono">{t.eta}</TableCell>
                <TableCell className={`font-mono font-medium ${delayColor(t.delayMin)}`}>
                  {formatDelay(t.delayMin)}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
  {t.speedKmph > 0
    ? `${t.speedKmph} km/h`
    : "—"}
</TableCell>
                <TableCell>
                  <PriorityBadge priority={t.priority} />
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
