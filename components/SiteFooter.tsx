import { TrainFront } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-navy-950/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrainFront className="h-4 w-4" />
          <span>RailCast AI — Dynamic ETA Intelligence for Indian Railways</span>
        </div>
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground/80">
          This is a prototype. Predictions shown in Demo Simulation mode are illustrative and not
          derived from a live, trained ML model. Baseline and model metrics are demonstration
          values until connected to real evaluation data.
        </p>
      </div>
    </footer>
  );
}
