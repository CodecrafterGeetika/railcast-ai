"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    startTransition(() => {
      router.refresh();
    });
    setTimeout(() => setSpinning(false), 600);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isPending}>
      <RefreshCw className={cn("h-3.5 w-3.5", (spinning || isPending) && "animate-spin")} />
      Refresh
    </Button>
  );
}
