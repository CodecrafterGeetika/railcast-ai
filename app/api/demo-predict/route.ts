import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const train = String(body.train_number || "").trim();
    const station = String(body.current_station || "").trim().toUpperCase();

    // Emergency demo route for Train 1007
    if (train === "1007" && station === "PGT") {
      return NextResponse.json({
        train: "1007",
        current_station: "PGT",
        next_station: "CBE",
        scheduled_arrival: "11:00",
        predicted_arrival: "11:07",
        predicted_delay_min: 7,
        status: "On Time",
        model: "RailCast_AI_CatBoost_V2",
        source: "DEMO"
      });
    }

    return NextResponse.json(
      { error: "No prediction available" },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
