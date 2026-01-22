/**
 * History Page - View saved analyses
 */

import { useState, useEffect } from "react";
import { History, Calendar, TrendingUp, Target } from "lucide-react";
import { api } from "../../services/api";
import { mockApi } from "../../services/mockApi";
import type { AnalysisResult } from "../../types";

interface HistoryPageProps {
  demoMode: boolean;
}

export function HistoryPage({ demoMode }: HistoryPageProps) {
  const apiClient = demoMode ? mockApi : api;

  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [demoMode]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getAnalysisHistory(50);
      setAnalyses(result.analyses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string | undefined) => {
    if (category === "High") return "text-green-700 bg-green-100";
    if (category === "Medium") return "text-yellow-700 bg-yellow-100";
    if (category === "Low") return "text-red-700 bg-red-100";
    return "text-gray-700 bg-gray-100";
  };

  const getStabilityColor = (label: string | undefined) => {
    if (label === "Stable") return "text-green-700";
    if (label === "Moderate") return "text-yellow-700";
    if (label === "Unstable") return "text-red-700";
    return "text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
        <p className="text-gray-600 mt-1">View saved prediction results and analysis records</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading history...</div>
      ) : error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      ) : analyses.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-gray-500 bg-white">
          <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="mb-2">No analysis history available</p>
          <p className="text-sm">
            {demoMode
              ? "Demo mode does not persist history. Run predictions in manual or auto mode to populate history (requires backend)."
              : "Run predictions in manual or auto mode to populate history"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Saved Analyses ({analyses.length})</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className={`w-full text-left border rounded-lg p-4 transition-colors hover:bg-gray-50 ${
                    selectedAnalysis?.id === analysis.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(analysis.timestamp).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryColor(
                        analysis.yield_category
                      )}`}
                    >
                      {analysis.yield_category || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {analysis.yield_estimate?.toFixed(1) || "N/A"}g
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {analysis.mode === "auto" ? "Auto" : "Manual"} {analysis.scenario && `• ${analysis.scenario}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail View */}
          <div>
            {selectedAnalysis ? (
              <div className="border rounded-lg bg-white shadow-sm sticky top-20">
                <div className="border-b p-4">
                  <h3 className="font-semibold text-gray-900">Analysis Details</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedAnalysis.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {/* Prediction Summary */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Predictions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="text-xs text-gray-600 mb-1">Yield Estimate</div>
                        <div className="text-xl font-bold text-gray-900">
                          {selectedAnalysis.yield_estimate?.toFixed(1) || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">grams</div>
                      </div>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="text-xs text-gray-600 mb-1">Category</div>
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${getCategoryColor(
                            selectedAnalysis.yield_category
                          )}`}
                        >
                          {selectedAnalysis.yield_category || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cluster */}
                  {selectedAnalysis.cluster_label && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Growth Pattern</h4>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="font-medium text-gray-900">{selectedAnalysis.cluster_label}</div>
                        <div className="text-xs text-gray-500">Cluster {selectedAnalysis.cluster_id}</div>
                      </div>
                    </div>
                  )}

                  {/* Stability */}
                  {selectedAnalysis.stability_label && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Stability</h4>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className={`font-medium ${getStabilityColor(selectedAnalysis.stability_label)}`}>
                          {selectedAnalysis.stability_label}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {selectedAnalysis.stability_score?.toFixed(1) || "N/A"}/100
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {selectedAnalysis.features && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Input Features</h4>
                      <div className="border rounded-lg p-3 bg-gray-50 text-xs font-mono space-y-1">
                        <div>Air Temp: {selectedAnalysis.features.d7_air_temp_mean?.toFixed(2)}°C</div>
                        <div>Light: {selectedAnalysis.features.d7_lux_mean?.toFixed(0)} lux</div>
                        <div>pH: {selectedAnalysis.features.d7_ph_mean?.toFixed(2)}</div>
                        <div>Water Temp: {selectedAnalysis.features.d7_water_temp_mean?.toFixed(2)}°C</div>
                        <div>Humidity: {selectedAnalysis.features.d7_rh_mean?.toFixed(2)}%</div>
                        <div>EC: {selectedAnalysis.features.d7_ec_mean?.toFixed(2)} mS/cm</div>
                        <div>TDS: {selectedAnalysis.features.d7_tds_mean?.toFixed(0)} ppm</div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations Count */}
                  {selectedAnalysis.recommendations && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
                      <div className="text-sm text-gray-600">
                        {selectedAnalysis.recommendations.length} recommendation(s) generated
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div>Mode: {selectedAnalysis.mode}</div>
                    {selectedAnalysis.scenario && <div>Scenario: {selectedAnalysis.scenario}</div>}
                    {selectedAnalysis.created_at && (
                      <div>Saved: {new Date(selectedAnalysis.created_at).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-12 text-center text-gray-500 bg-white">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Select an analysis to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
