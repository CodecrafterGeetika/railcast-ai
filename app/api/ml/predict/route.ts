import { NextRequest, NextResponse } from "next/server";
import { predictWithML } from "@/lib/mlClient";
import { ProviderError } from "@/lib/types";

interface PredictionRequestBody {
  train_number: string;
  current_station: string;
  departure_delay: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PredictionRequestBody>;

    /*
     * Validate required fields before calling the ML backend.
     */

    if (
      typeof body.train_number !== "string" ||
      body.train_number.trim() === ""
    ) {
      return NextResponse.json(
        {
          error: "train_number is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof body.current_station !== "string" ||
      body.current_station.trim() === ""
    ) {
      return NextResponse.json(
        {
          error: "current_station is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof body.departure_delay !== "number" ||
      !Number.isFinite(body.departure_delay)
    ) {
      return NextResponse.json(
        {
          error: "departure_delay must be a valid number",
        },
        { status: 400 }
      );
    }

    /*
     * Send exactly the fields expected by the FastAPI /predict endpoint.
     */

    const prediction = await predictWithML({
      train_number: body.train_number.trim(),
      current_station: body.current_station.trim().toUpperCase(),
      departure_delay: body.departure_delay,
    });

    /*
     * Return the real ML backend response to the frontend.
     */

    return NextResponse.json(prediction, {
      status: 200,
    });
  } catch (error) {
    /*
     * Handle known ML provider errors.
     */

    if (error instanceof ProviderError) {
      switch (error.code) {
        case "TIMEOUT":
          return NextResponse.json(
            {
              error: error.message,
            },
            { status: 504 }
          );

        case "NOT_FOUND":
          return NextResponse.json(
            {
              error: error.message,
            },
            { status: 404 }
          );

        case "RATE_LIMITED":
          return NextResponse.json(
            {
              error: error.message,
            },
            { status: 429 }
          );

        case "NETWORK":
          return NextResponse.json(
            {
              error: error.message,
            },
            { status: 503 }
          );

        case "MALFORMED":
          return NextResponse.json(
            {
              error: error.message,
            },
            { status: 502 }
          );

        case "SERVER_ERROR":
        default:
          return NextResponse.json(
            {
              error: error.message,
            },
            { status: 502 }
          );
      }
    }

    /*
     * Handle invalid JSON / unexpected errors.
     */

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    console.error("ML prediction API error:", error);

    return NextResponse.json(
      {
        error: "Failed to get prediction from ML backend",
      },
      { status: 500 }
    );
  }
}
