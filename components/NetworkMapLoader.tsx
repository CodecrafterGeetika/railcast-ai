"use client";

import dynamic from "next/dynamic";
import type { NetworkTrainMarker } from "@/lib/types";

const NetworkMap = dynamic(() => import("./NetworkMap").then((m) => m.NetworkMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-lg border border-border bg-navy-900/40 text-sm text-muted-foreground">
      Loading network map…
    </div>
  ),
});

export function NetworkMapLoader({ trains }: { trains: NetworkTrainMarker[] }) {
  return <NetworkMap trains={trains} />;
}
