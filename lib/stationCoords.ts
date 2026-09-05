// Approximate coordinates for the stations referenced by the demo fleet.
// Used only to place markers on the illustrative network map, not for
// navigation-grade routing.
export const STATION_COORDS: Record<string, [number, number]> = {
  INDB: [22.7196, 75.8577],
  UJN: [23.1765, 75.7885],
  NAD: [23.452, 75.418],
  RTM: [23.3315, 75.0367],
  KOTA: [25.2138, 75.8648],
  SWM: [26.0173, 76.3468],
  BTE: [27.2152, 77.49],
  MTJ: [27.4924, 77.6737],
  NZM: [28.5891, 77.2519],
  NDLS: [28.6431, 77.2197],
  BCT: [18.9696, 72.8194],
  BVI: [19.2288, 72.8567],
  BRC: [22.3072, 73.1812],
  AGC: [27.1592, 77.991],
  GWL: [26.2183, 78.1828],
  JHS: [25.4484, 78.5685],
  BPL: [23.2599, 77.4126],
  CNB: [26.4499, 80.3319],
  PRYJ: [25.4358, 81.8463],
  BSB: [25.3176, 82.9739],
};

export function interpolateCoords(
  fromCode: string,
  toCode: string,
  fraction: number
): [number, number] {
  const from = STATION_COORDS[fromCode] ?? [22.9734, 78.6569];
  const to = STATION_COORDS[toCode] ?? from;
  const f = Math.max(0, Math.min(1, fraction));
  return [from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f];
}
