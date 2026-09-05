import Link from "next/link";
import { TrainFront } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <TrainFront className="h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. Try searching for a train instead.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
        Back to RailPulse AI
      </Link>
    </div>
  );
}
