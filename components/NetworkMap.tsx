"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NetworkTrainMarker } from "@/lib/types";

function dotIcon(color: string, pulse = false) {
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:14px;height:14px;border-radius:9999px;
      background:${color};border:2px solid #050b16;
      box-shadow:0 0 0 3px rgba(255,255,255,0.08);
      ${pulse ? "animation:pulse-dot 1.8s ease-in-out infinite;" : ""}
    "></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const STATUS_COLOR: Record<NetworkTrainMarker["status"], string> = {
  "on-time": "#22c55e",
  delayed: "#ef4444",
  "at-risk": "#f5a524",
};

// A few illustrative corridor polylines connecting major demo hubs.
// Not an exhaustive representation of the Indian Railways network.
const DEMO_CORRIDORS: [number, number][][] = [
  [
    [28.6431, 77.2197],
    [26.2183, 78.1828],
    [23.2599, 77.4126],
  ],
  [
    [28.6431, 77.2197],
    [26.4499, 80.3319],
    [25.4358, 81.8463],
    [25.3176, 82.9739],
  ],
  [
    [22.7196, 75.8577],
    [23.3315, 75.0367],
    [25.2138, 75.8648],
    [28.5891, 77.2519],
  ],
  [
    [18.9696, 72.8194],
    [22.3072, 73.1812],
    [23.3315, 75.0367],
    [25.2138, 75.8648],
    [28.6431, 77.2197],
  ],
];

export function NetworkMap({ trains }: { trains: NetworkTrainMarker[] }) {
  const [tilesFailed, setTilesFailed] = useState(false);
  const center = useMemo<[number, number]>(() => [24.5, 78.5], []);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#0a1428" }}
      >
        {!tilesFailed && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTilesFailed(true) }}
          />
        )}

        {DEMO_CORRIDORS.map((corridor, i) => (
          <Polyline
            key={i}
            positions={corridor}
            pathOptions={{ color: "#3b82f6", weight: 2, opacity: 0.45, dashArray: "4 6" }}
          />
        ))}

        {trains.map((t) => (
          <Marker
            key={t.trainNumber}
            position={[t.lat, t.lng]}
            icon={dotIcon(STATUS_COLOR[t.status], t.status !== "on-time")}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">
                  {t.trainNumber} — {t.trainName}
                </p>
                <p>Status: {t.status.replace("-", " ")}</p>
                <p>Delay: {t.delayMin} min</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {tilesFailed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-navy-950/90 px-4 py-2 text-center text-[11px] text-muted-foreground">
          Map tiles unavailable — showing simplified corridor overlay with train positions.
        </div>
      )}
    </div>
  );
}
