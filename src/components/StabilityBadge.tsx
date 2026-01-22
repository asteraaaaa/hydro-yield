/**
 * Stability Badge Component
 */

import React from "react";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import type { StabilityReport } from "@/types";

interface StabilityBadgeProps {
  stability: StabilityReport;
  showDetails?: boolean;
}

export function StabilityBadge({ stability, showDetails = false }: StabilityBadgeProps) {
  const getIcon = () => {
    if (stability.label === "Stable") return <CheckCircle className="w-5 h-5" />;
    if (stability.label === "Unstable") return <AlertTriangle className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const colorClasses = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    red: "bg-red-100 text-red-800 border-red-300",
  };

  const color = stability.color as keyof typeof colorClasses;

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color] || colorClasses.yellow}`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{stability.label}</span>
            <span className="text-sm">{stability.score.toFixed(1)}/100</span>
          </div>
          {showDetails && (
            <div className="text-sm mt-1 opacity-90">{stability.message}</div>
          )}
        </div>
      </div>
    </div>
  );
}
