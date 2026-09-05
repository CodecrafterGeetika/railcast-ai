import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { StationETA } from "@/lib/types";
import { formatSignedMinutes, differenceColor } from "@/lib/etaUtils";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<StationETA["status"], string> = {
  departed: "Departed",
  current: "Current",
  next: "Next",
  upcoming: "Upcoming",
  destination: "Destination",
};

const STATUS_VARIANT: Record<StationETA["status"], "secondary" | "success" | "warning" | "default" | "outline"> = {
  departed: "outline",
  current: "success",
  next: "warning",
  upcoming: "secondary",
  destination: "default",
};

export function StationETATable({ stations }: { stations: StationETA[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Station-wise ETA</CardTitle>
        <CardDescription>Scheduled, railway-reported and AI-predicted arrival at every stop.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:px-2 sm:pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Current ETA</TableHead>
              <TableHead>Our ETA</TableHead>
              <TableHead>Difference</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map((s) => (
              <TableRow key={s.stationCode}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{s.stationName}</span>
                    <Badge variant={STATUS_VARIANT[s.status]} className="hidden sm:inline-flex">
                      {STATUS_LABEL[s.status]}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground sm:hidden">{STATUS_LABEL[s.status]}</span>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{s.scheduledETA}</TableCell>
                <TableCell className="font-mono">{s.currentReportedETA}</TableCell>
                <TableCell className="font-mono font-medium text-foreground">{s.predictedETA}</TableCell>
                <TableCell className={cn("font-mono font-medium", differenceColor(s.differenceMin))}>
                  {formatSignedMinutes(s.differenceMin)}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-foreground">{s.confidencePercent}%</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
