"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const CHART_GRID = "rgba(148, 163, 184, 0.12)";
const AXIS_COLOR = "#8ea3c2";

const tooltipStyle = {
  backgroundColor: "#0d1a33",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: 8,
  fontSize: 12,
  color: "#e2e8f0",
};

export function ErrorTrendChart({
  data,
}: {
  data: { label: string; baselineErrorMin: number; modelErrorMin: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="label" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={AXIS_COLOR}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          unit=" min"
          width={56}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
        <Line
          type="monotone"
          dataKey="baselineErrorMin"
          name="Baseline ETA error"
          stroke="#8ea3c2"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="modelErrorMin"
          name="Our Model ETA error"
          stroke="#38bdf8"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StationErrorBarChart({
  data,
}: {
  data: { stationName: string; baselineErrorMin: number; modelErrorMin: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="stationName" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} unit=" min" width={56} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
        <Bar dataKey="baselineErrorMin" name="Baseline MAE" fill="#8ea3c2" radius={[4, 4, 0, 0]} />
        <Bar dataKey="modelErrorMin" name="Our Model MAE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BaselineVsModelSummaryChart({
  baselineMAEMin,
  modelMAEMin,
}: {
  baselineMAEMin: number;
  modelMAEMin: number;
}) {
  const data = [
    { name: "Baseline MAE", value: baselineMAEMin },
    { name: "Our Model MAE", value: modelMAEMin },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} unit=" min" />
        <YAxis type="category" dataKey="name" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} width={110} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={index === 0 ? "#8ea3c2" : "#3b82f6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
