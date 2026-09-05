"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would report to an error-tracking service.
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#050b16] px-4 text-center text-slate-200">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />
          <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            RailPulse AI hit an unexpected error. Demo simulation data will be used where possible.
          </p>
          <Button className="mt-6" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
