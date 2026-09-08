import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const train = String(body.train_number || "").trim();
    const station = String(body.current_station || "").trim().toUpperCase();

    if (train === "1007" && station === "PGT") {
      return NextResponse.json({
        train: "1007",
        current_station: "PGT",
        next_station: "CBE",
        scheduled_arrival: "03:00",
        predicted_arrival: "03:06",
        predicted_delay_min: 6,
        status: "Slightly Delayed",
        model: "RailCast_AI_CatBoost_V2",
        source: "DEMO"
      });
    }

    return NextResponse.json(
      { error: "No prediction available for this train/station" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid prediction request" },
      { status: 400 }
    );
  }
}
