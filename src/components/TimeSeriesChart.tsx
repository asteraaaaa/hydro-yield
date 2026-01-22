/**
 * Time Series Chart Component
 */

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TelemetryPoint } from "@/types";

interface TimeSeriesChartProps {
  data: TelemetryPoint[];
  dataKey: keyof Omit<TelemetryPoint, "timestamp">;
  title: string;
  unit: string;
  color?: string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  dataKey,
  title,
  unit,
  color = "#3b82f6",
  height = 300,
}: TimeSeriesChartProps) {
  // Format data for chart
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: d[dataKey],
    fullTime: new Date(d.timestamp).toLocaleString(),
  }));

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: unit, angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullTime;
              }
              return label;
            }}
            formatter={(value: any) => [value.toFixed(2), title]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
