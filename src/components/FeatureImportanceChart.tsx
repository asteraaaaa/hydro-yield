/**
 * Feature Importance Chart Component
 */

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FeatureImportanceChartProps {
  importance: Record<string, number>;
  title?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  d7_air_temp_mean: "Air Temp",
  d7_lux_mean: "Light (Lux)",
  d7_ph_mean: "pH",
  d7_water_temp_mean: "Water Temp",
  d7_rh_mean: "Humidity",
  d7_ec_mean: "EC",
  d7_tds_mean: "TDS",
};

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#14b8a6"];

export function FeatureImportanceChart({ importance, title = "Feature Importance" }: FeatureImportanceChartProps) {
  const data = Object.entries(importance).map(([feature, value], idx) => ({
    feature: FEATURE_LABELS[feature] || feature,
    importance: value * 100, // Convert to percentage
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Relative influence of each environmental factor on yield predictions (from Random Forest model)
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis dataKey="feature" type="category" tick={{ fontSize: 12 }} stroke="#6b7280" width={70} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: any) => [`${value.toFixed(2)}%`, "Importance"]}
          />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        <strong>Note:</strong> Higher values indicate stronger influence on yield. Focus adjustments on high-importance features
        for maximum impact.
      </div>
    </div>
  );
}
