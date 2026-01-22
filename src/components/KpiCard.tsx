/**
 * KPI Card Component - Display sensor metrics
 */

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  unit: string;
  trend?: "up" | "down" | "stable";
  icon?: React.ReactNode;
  color?: string;
}

export function KpiCard({ label, value, unit, trend, icon, color = "blue" }: KpiCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-600" />;
    if (trend === "stable") return <Minus className="w-4 h-4 text-gray-600" />;
    return null;
  };

  const colorClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    yellow: "border-yellow-200 bg-yellow-50",
    red: "border-red-200 bg-red-50",
    purple: "border-purple-200 bg-purple-50",
    gray: "border-gray-200 bg-gray-50",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">{label}</div>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900">
            {typeof value === "number" ? value.toFixed(2) : value}
          </div>
          <div className="text-xs text-gray-500">{unit}</div>
        </div>
        {getTrendIcon()}
      </div>
    </div>
  );
}
