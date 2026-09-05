import Link from "next/link";
import { ArrowRight, Gauge, History, Radar, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrainSearch } from "@/components/TrainSearch";
import { cn } from "@/lib/utils";

const FACTORS = [
  { icon: Gauge, label: "Current delay & speed" },
  { icon: Radar, label: "Current train position" },
  { icon: History, label: "Historical section travel time" },
  { icon: TrendingUp, label: "Train density & headway" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70 rail-grid-line">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
               Dynamic ETA Intelligence
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Know when your train will{" "}
              <span className="bg-gradient-to-r from-rail-accent to-rail-accent2 bg-clip-text text-transparent">
                REALLY
              </span>{" "}
              arrive.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              AI-powered, continuously updated ETA prediction using live train movement,
              historical section behavior and network conditions.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#train-search" className={cn(buttonVariants({ size: "lg" }))}>
                Check Train ETA
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/train/12919" className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}>
                View Live Demo
              </Link>
            </div>
          </div>

          {/* Subtle railway route visualization */}
          <div className="mx-auto mt-16 max-w-4xl">
            <svg viewBox="0 0 800 100" className="w-full text-rail-steel/40" fill="none">
              <line x1="10" y1="50" x2="790" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="10 8" />
              {[10, 190, 370, 550, 730].map((x, i) => (
                <g key={x}>
                  <circle
                    cx={x}
                    cy="50"
                    r={i === 2 ? 7 : 5}
                    className={i === 2 ? "fill-rail-accent2" : "fill-rail-steel/70"}
                  />
                  {i === 2 && (
                    <circle cx={x} cy="50" r="12" className="fill-none stroke-rail-accent2/50 animate-pulse-dot" strokeWidth="1.5" />
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* Search */}
      <section id="train-search" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Predict a train&apos;s ETA</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live railway data is attempted first; if unavailable, realistic demo simulation loads
            automatically.
          </p>
        </div>
        <TrainSearch />
      </section>

      {/* Model factors */}
      <section className="border-t border-border/70 bg-navy-900/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Our model adjusts ETA dynamically
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              RailCastAI continuously compares the railway-reported ETA against a prediction
              informed by real operating conditions.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FACTORS.map((f) => (
              <Card key={f.label}>
                <CardContent className="flex flex-col items-start gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-rail-accent/10 text-rail-accent2">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA strip */}
      <section className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-12 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Operating a section or a fleet?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              See network-wide delay risk, congestion and alerts in Operations Control.
            </p>
          </div>
          <Link href="/operations" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
            Open Operations Control
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
