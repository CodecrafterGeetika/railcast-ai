import type { DataSourceMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ source, className }: { source: DataSourceMode; className?: string }) {
  const isLive = source === "live";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        isLive
          ? "border-rail-signal/30 bg-rail-signal/10 text-rail-signal"
          : "border-rail-amber/30 bg-rail-amber/10 text-rail-amber",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isLive ? "bg-rail-signal animate-pulse-dot" : "bg-rail-amber animate-pulse-dot"
        )}
      />
      {isLive ? "LIVE DATA" : "DEMO SIMULATION"}
    </div>
  );
}
