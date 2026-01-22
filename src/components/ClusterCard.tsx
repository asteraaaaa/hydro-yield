/**
 * Cluster Card Component - Display cluster interpretation
 */

import React from "react";
import { Layers } from "lucide-react";
import type { ClusterPrediction } from "@/types";

interface ClusterCardProps {
  cluster: ClusterPrediction;
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-100">
          <Layers className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{cluster.label}</h3>
          <div className="text-xs text-gray-500">Cluster {cluster.cluster}</div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="font-medium text-gray-700 mb-1">Description</div>
          <div className="text-gray-600">{cluster.description}</div>
        </div>

        <div>
          <div className="font-medium text-gray-700 mb-1">Typical Pattern</div>
          <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded">
            {cluster.typical_pattern}
          </div>
        </div>

        <div>
          <div className="font-medium text-gray-700 mb-1">Recommended Focus</div>
          <div className="text-gray-600">{cluster.recommended_focus}</div>
        </div>
      </div>
    </div>
  );
}
