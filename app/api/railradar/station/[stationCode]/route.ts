import { NextResponse } from "next/server";

import {
  fetchLiveStationBoard,
  normalizeStationTrain,
} from "@/lib/railradarStationClient";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: {
      stationCode: string;
    };
  }
) {
  try {
    const data = await fetchLiveStationBoard(
      params.stationCode,
      {
        hours: 2,
        includeIntermediate: true,
      }
    );

    return NextResponse.json({
      success: true,

      data: {
        station: data.station,
        window: data.window,
        count: data.count,

        trains: data.trains.map((train) =>
          normalizeStationTrain(
            train,
            data.station
          )
        ),
      },

      source: "railradar",

      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load RailRadar station data";

    const status =
      message.includes("API key")
        ? 401
        : message.includes("not found")
          ? 404
          : 502;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
