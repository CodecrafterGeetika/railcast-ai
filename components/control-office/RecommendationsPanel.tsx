import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { OperationalRecommendation } from "@/lib/controlOfficeTypes";

export function RecommendationsPanel({ recommendations }: { recommendations: OperationalRecommendation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Operational Recommendations</CardTitle>
        <CardDescription>
          Suggestions for the controller to consider — not automatic control actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rail-accent/15 text-rail-accent2">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-xs leading-relaxed text-foreground/90">{rec.message}</p>
              {rec.relatedTo && (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{rec.relatedTo}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
