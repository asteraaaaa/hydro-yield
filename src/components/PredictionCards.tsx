/**
 * Prediction Cards Component - Display prediction results
 */

import React from "react";
import { Target, TrendingUp, BarChart3 } from "lucide-react";
import type { Predictions } from "@/types";

interface PredictionCardsProps {
  predictions: Predictions;
}

export function PredictionCards({ predictions }: PredictionCardsProps) {
  const getCategoryColor = (category: string) => {
    if (category === "High") return "text-green-700 bg-green-100 border-green-300";
    if (category === "Medium") return "text-yellow-700 bg-yellow-100 border-yellow-300";
    return "text-red-700 bg-red-100 border-red-300";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Yield Estimate */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Yield Estimate</div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {predictions.yield.yield.toFixed(1)}
        </div>
        <div className="text-sm text-gray-500">{predictions.yield.unit}</div>
      </div>

      {/* Category */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Yield Category</div>
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-lg font-semibold border ${getCategoryColor(predictions.category.category)}`}>
          {predictions.category.category}
        </div>
        {predictions.category.probabilities && (
          <div className="mt-3 text-xs text-gray-600">
            Confidence: {(predictions.category.probabilities[predictions.category.category] * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Cluster */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-green-100">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-sm font-medium text-gray-600">Growth Pattern</div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {predictions.cluster.label}
        </div>
        <div className="text-xs text-gray-500">Cluster {predictions.cluster.cluster}</div>
      </div>
    </div>
  );
}
