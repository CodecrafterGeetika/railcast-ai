import { ArrowRightLeft, Flag, AlertOctagon, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TimelineEvent } from "@/lib/controlOfficeTypes";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<TimelineEvent["type"], { icon: React.ElementType; color: string }> = {
  arrival: { icon: Flag, color: "text-rail-accent2" },
  conflict: { icon: AlertOctagon, color: "text-rail-red" },
  section: { icon: ArrowRightLeft, color: "text-rail-amber" },
  resolution: { icon: CheckCircle, color: "text-rail-signal" },
};

export function EventsTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events (Next ~60 Minutes)</CardTitle>
        <CardDescription>What the controller should prepare for, in order.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-1.5 space-y-0 border-l border-border">
          {events.map((event, idx) => {
            const config = TYPE_CONFIG[event.type];
            return (
              <li key={`${event.time}-${idx}`} className="relative pb-5 pl-6 last:pb-0">
                <span className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy-900 ring-4 ring-navy-950">
                  <config.icon className={cn("h-3.5 w-3.5", config.color)} />
                </span>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold text-foreground">{event.time}</span>
                  <span className="text-xs text-muted-foreground">{event.description}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
