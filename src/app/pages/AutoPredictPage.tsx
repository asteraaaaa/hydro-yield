/**
 * Auto Prediction Page - Compute features from telemetry and predict
 */

import { useState } from "react";
import { Zap, TrendingUp } from "lucide-react";
import { PredictionCards } from "../../components/PredictionCards";
import { ClusterCard } from "../../components/ClusterCard";
import { RecommendationList } from "../../components/RecommendationList";
import { FeatureImportanceChart } from "../../components/FeatureImportanceChart";
import { StabilityBadge } from "../../components/StabilityBadge";
import { api } from "../../services/api";
import { mockApi } from "../../services/mockApi";
import type { PredictionResponse, FeatureVector } from "../../types";

interface AutoPredictPageProps {
  demoMode: boolean;
}

export function AutoPredictPage({ demoMode }: AutoPredictPageProps) {
  const apiClient = demoMode ? mockApi : api;

  const [selectedWindow, setSelectedWindow] = useState<string>("7d");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [computedFeatures, setComputedFeatures] = useState<FeatureVector | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const prediction = await apiClient.predictAuto(selectedWindow);
      setResult(prediction);
      setComputedFeatures(prediction.features);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Auto Prediction</h2>
        <p className="text-gray-600 mt-1">
          Automatically compute features from telemetry and predict final yield
        </p>
      </div>

      {/* Controls */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Prediction Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telemetry Window (for feature aggregation)
            </label>
            <div className="flex gap-2">
              {["3d", "7d", "14d"].map((window) => (
                <button
                  key={window}
                  onClick={() => setSelectedWindow(window)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedWindow === window
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {window}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The system will compute Day-7 proxy features as the mean of sensors over the selected window
            </p>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Run Auto Prediction
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Computed Features Table */}
      {computedFeatures && (
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="border-b p-4">
            <h3 className="font-semibold text-gray-900">Computed Features (Transparency)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Mean values computed from the last {selectedWindow} of telemetry data
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FeatureItem label="Air Temp" value={computedFeatures.d7_air_temp_mean} unit="°C" />
              <FeatureItem label="Light (Lux)" value={computedFeatures.d7_lux_mean} unit="lux" />
              <FeatureItem label="pH" value={computedFeatures.d7_ph_mean} unit="" />
              <FeatureItem label="Water Temp" value={computedFeatures.d7_water_temp_mean} unit="°C" />
              <FeatureItem label="Humidity" value={computedFeatures.d7_rh_mean} unit="%" />
              <FeatureItem label="EC" value={computedFeatures.d7_ec_mean} unit="mS/cm" />
              <FeatureItem label="TDS" value={computedFeatures.d7_tds_mean} unit="ppm" />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Predictions */}
          <PredictionCards predictions={result.predictions} />

          {/* Stability */}
          <StabilityBadge stability={result.stability} showDetails />

          {/* Metadata */}
          {result.metadata && (
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 text-sm">
              <strong>Data Quality:</strong> Prediction based on {result.metadata.data_points} telemetry readings from{" "}
              {result.metadata.window} window. Stability score: {result.stability.score.toFixed(1)}/100.
            </div>
          )}

          {/* Cluster Info */}
          <ClusterCard cluster={result.predictions.cluster} />

          {/* Feature Importance */}
          <FeatureImportanceChart importance={result.feature_importance} />

          {/* Recommendations */}
          <RecommendationList recommendations={result.recommendations} />

          {/* Disclaimer */}
          <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <strong>⚠️ Disclaimer:</strong> {result.disclaimer}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="border rounded-lg p-12 text-center text-gray-500 bg-white">
          <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="mb-2">No predictions yet</p>
          <p className="text-sm">
            Select a telemetry window and click "Run Auto Prediction" to compute features and generate yield forecasts
          </p>
        </div>
      )}
    </div>
  );
}

function FeatureItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-semibold text-gray-900">
        {value.toFixed(2)} <span className="text-sm font-normal text-gray-600">{unit}</span>
      </div>
    </div>
  );
}
