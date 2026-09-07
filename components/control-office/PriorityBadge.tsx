import { Badge } from "@/components/ui/badge";
import type { OperationalPriority } from "@/lib/controlOfficeTypes";

const PRIORITY_CONFIG: Record<OperationalPriority, { label: string; variant: "danger" | "warning" | "success" }> = {
  HIGH: { label: "🔴 HIGH", variant: "danger" },
  MEDIUM: { label: "🟠 MEDIUM", variant: "warning" },
  NORMAL: { label: "🟢 NORMAL", variant: "success" },
};

export function PriorityBadge({ priority }: { priority: OperationalPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
