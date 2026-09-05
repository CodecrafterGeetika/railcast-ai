import { Layers, ShieldCheck, GitBranch, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const POINTS = [
  {
    icon: FlaskConical,
    title: "What this is",
    body: "RailCast AI is a prototype exploring dynamic ETA prediction for Indian Railways coaching trains, comparing the railway-reported ETA against an AI-adjusted prediction.",
  },
  {
    icon: Layers,
    title: "How predictions are formed",
    body: "The model considers current delay, current position and speed, previous station delay, historical section travel time, train density/headway, section characteristics and, optionally, weather.",
  },
  {
    icon: ShieldCheck,
    title: "Honesty about demo data",
    body: "When live railway data is unavailable, the app automatically falls back to clearly labeled demo simulation data. Demo data is never presented as live, and demo metrics are never presented as validated results.",
  },
  {
    icon: GitBranch,
    title: "Built to connect to a real backend",
    body: "The frontend consumes a stable set of TypeScript interfaces. A future Railway Live API → Backend → ML ETA Engine can be wired in through lib/apiProvider.ts without any frontend rewrite.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">About RailPulse AI</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Predicting every arrival, before it happens — a prototype for dynamic ETA intelligence on
        Indian Railways coaching trains.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-rail-accent/10 text-rail-accent2">
                <p.icon className="h-4.5 w-4.5" />
              </span>
              <CardTitle>{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
