"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Milestone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trainSummaries } from "@/data/mockTrains";

export function TrainSearch({ className }: { className?: string }) {
  const router = useRouter();

  const [trainNumber, setTrainNumber] = useState("");
  const [currentStation, setCurrentStation] = useState("");
  const [departureDelay, setDepartureDelay] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = trainNumber.trim();

    if (!trimmed) {
      setError("Enter a train number to predict its ETA.");
      return;
    }

    const station = currentStation.trim().toUpperCase();
    const delay = Number(departureDelay);

    if (!station) {
      setError("Enter the current station code, e.g. PGT.");
      return;
    }

    if (!Number.isFinite(delay)) {
      setError("Enter the departure delay in minutes.");
      return;
    }

    setError(null);

    router.push(
      `/train/${encodeURIComponent(
        trimmed
      )}?current_station=${encodeURIComponent(
        station
      )}&departure_delay=${encodeURIComponent(String(delay))}`
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-3"
        >
          {/* Train Number */}
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Train Number
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12919"
                className="pl-9"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Current Station */}
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Current Station
            </label>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={currentStation}
                onChange={(e) => setCurrentStation(e.target.value)}
                placeholder="e.g. PGT"
                className="pl-9"
              />
            </div>
          </div>

          {/* Departure Delay */}
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Departure Delay (min)
            </label>

            <div className="relative">
              <Milestone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={departureDelay}
                onChange={(e) => setDepartureDelay(e.target.value)}
                placeholder="e.g. 18"
                type="number"
                min="0"
                className="pl-9"
              />
            </div>
          </div>

          {/* Demo trains + Predict button */}
          <div className="flex flex-col gap-2 sm:col-span-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">
                Try a demo train:
              </span>

              {trainSummaries.map((t) => (
                <button
                  type="button"
                  key={t.trainNumber}
                  onClick={() =>
                    router.push(`/train/${t.trainNumber}`)
                  }
                  className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  {t.trainNumber}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
            >
              Predict ETA
            </Button>
          </div>

          {/* Validation error */}
          {error && (
            <p className="text-xs text-rail-red sm:col-span-3">
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
