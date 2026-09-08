import { NextRequest, NextResponse } from "next/server";
import { fetchLiveTrainStatus, TRAIN_NUMBER_PATTERN } from "@/lib/railradarClient";
import { mapToNormalizedLiveTrain } from "@/lib/railradarNormalize";
import { ProviderError } from "@/lib/types";

// ---------------------------------------------------------------------------
// GET /api/railradar/train/{trainNumber}?authoritative=true
//
// Server-side only. Adds the RailRadar Authorization header here — the key
// never reaches the browser. Returns our own NormalizedLiveTrain shape, not
// RailRadar's raw payload, so the frontend never depends on RailRadar's
// exact field names directly.
// ---------------------------------------------------------------------------

function errorStatusFor(code: ProviderError["code"]): number {
  switch (code) {
    case "MALFORMED":
      return 400;
    case "UNAUTHORIZED":
      return 502; // our key is misconfigured/rejected — not the caller's fault
    case "NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "TIMEOUT":
      return 504;
    case "NETWORK":
    case "SERVER_ERROR":
    default:
      return 502;
  }
}

export async function GET(request: NextRequest, { params }: { params: { trainNumber: string } }) {
  const trainNumber = params.trainNumber;

  if (!TRAIN_NUMBER_PATTERN.test(trainNumber)) {
    return NextResponse.json({ error: "Train number must be 4-5 digits." }, { status: 400 });
  }

  const authoritative = request.nextUrl.searchParams.get("authoritative") === "true";

  try {
    const raw = await fetchLiveTrainStatus(trainNumber, { authoritative });
    const normalized = mapToNormalizedLiveTrain(raw);
    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: errorStatusFor(err.code) });
    }
    console.error("/api/railradar/train: unexpected error", err);
    return NextResponse.json({ error: "Unexpected error fetching live train data." }, { status: 500 });
  }
}
