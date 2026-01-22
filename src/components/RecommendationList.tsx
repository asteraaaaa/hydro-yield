/**
 * Recommendation List Component
 */

import React from "react";
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Recommendation } from "@/types";

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  const getPriorityIcon = (priority: string) => {
    if (priority === "High") return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (priority === "Medium") return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <Info className="w-5 h-5 text-blue-600" />;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "High")
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">High</span>;
    if (priority === "Medium")
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Medium</span>;
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Low</span>;
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="border-b p-4">
        <h3 className="font-semibold text-gray-900">Recommendations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Ranked by priority and potential impact on yield
        </p>
      </div>

      <div className="divide-y">
        {recommendations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <div>No recommendations - all parameters optimal</div>
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                {getPriorityIcon(rec.priority)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityBadge(rec.priority)}
                    <span className="text-xs text-gray-500">{rec.category}</span>
                  </div>

                  <div className="font-medium text-gray-900 mb-2">{rec.action}</div>

                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Reason:</span> {rec.reason}
                  </div>

                  <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                    <span className="font-medium">⚠️ Caution:</span> {rec.caution}
                  </div>

                  {rec.current_value !== undefined && rec.feature && (
                    <div className="text-xs text-gray-500 mt-2">
                      Current value: {rec.current_value.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4 bg-gray-50">
        <div className="text-xs text-gray-600">
          <strong>Safety Note:</strong> All recommendations are general guidance only. Adjust gradually and monitor plant response.
          This system does not control actuators or provide dosing quantities. Consult agronomic expertise before making changes.
        </div>
      </div>
    </div>
  );
}
