/**
 * Manual Prediction Page - User enters early-stage values manually
 */

import { useState } from "react";
import { Calculator } from "lucide-react";
import { PredictionCards } from "../../components/PredictionCards";
import { ClusterCard } from "../../components/ClusterCard";
import { RecommendationList } from "../../components/RecommendationList";
import { FeatureImportanceChart } from "../../components/FeatureImportanceChart";
import { StabilityBadge } from "../../components/StabilityBadge";
import { api } from "../../services/api";
import { mockApi } from "../../services/mockApi";
import type { FeatureVector, PredictionResponse } from "../../types";

interface ManualPredictPageProps {
  demoMode: boolean;
}

export function ManualPredictPage({ demoMode }: ManualPredictPageProps) {
  const apiClient = demoMode ? mockApi : api;

  const [formData, setFormData] = useState<FeatureVector>({
    d7_air_temp_mean: 24.0,
    d7_lux_mean: 23000.0,
    d7_ph_mean: 6.2,
    d7_water_temp_mean: 20.0,
    d7_rh_mean: 65.0,
    d7_ec_mean: 1.8,
    d7_tds_mean: 900.0,
  });

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (key: keyof FeatureVector, value: string) => {
    if (value === "") {
      setFormData({ ...formData, [key]: undefined });
    } else {
      setFormData({ ...formData, [key]: parseFloat(value) });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const prediction = await apiClient.predictManual(formData);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      d7_air_temp_mean: 24.0,
      d7_lux_mean: 23000.0,
      d7_ph_mean: 6.2,
      d7_water_temp_mean: 20.0,
      d7_rh_mean: 65.0,
      d7_ec_mean: 1.8,
      d7_tds_mean: 900.0,
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manual Prediction</h2>
        <p className="text-gray-600 mt-1">
          Enter early-stage environmental conditions (≥7 days representative) to estimate final yield
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 bg-white shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Input Features</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Air Temperature"
                value={formData.d7_air_temp_mean}
                onChange={(v) => handleInputChange("d7_air_temp_mean", v)}
                unit="°C"
                min={15}
                max={35}
                step={0.1}
              />

              <InputField
                label="Light Intensity"
                value={formData.d7_lux_mean}
                onChange={(v) => handleInputChange("d7_lux_mean", v)}
                unit="lux"
                min={5000}
                max={50000}
                step={100}
              />

              <InputField
                label="pH"
                value={formData.d7_ph_mean}
                onChange={(v) => handleInputChange("d7_ph_mean", v)}
                unit=""
                min={4.0}
                max={8.0}
                step={0.1}
              />

              <InputField
                label="Water Temperature"
                value={formData.d7_water_temp_mean}
                onChange={(v) => handleInputChange("d7_water_temp_mean", v)}
                unit="°C"
                min={15}
                max={30}
                step={0.1}
              />

              <InputField
                label="Relative Humidity"
                value={formData.d7_rh_mean}
                onChange={(v) => handleInputChange("d7_rh_mean", v)}
                unit="%"
                min={30}
                max={90}
                step={1}
              />

              <InputField
                label="EC"
                value={formData.d7_ec_mean}
                onChange={(v) => handleInputChange("d7_ec_mean", v)}
                unit="mS/cm"
                min={0.5}
                max={3.5}
                step={0.1}
              />

              <InputField
                label="TDS"
                value={formData.d7_tds_mean}
                onChange={(v) => handleInputChange("d7_tds_mean", v)}
                unit="ppm"
                min={250}
                max={1750}
                step={10}
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Predicting..." : "Predict Yield"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>

            <div className="mt-4 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
              <strong>Note:</strong> Enter mean values from the first ≥7 days of growth representing early-stage conditions.
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {error && (
            <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-red-700 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              {/* Predictions */}
              <PredictionCards predictions={result.predictions} />

              {/* Stability */}
              <StabilityBadge stability={result.stability} showDetails />

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
          ) : (
            <div className="border rounded-lg p-12 text-center text-gray-500 bg-white">
              <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Enter feature values and click "Predict Yield" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  unit: string;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {unit && <span className="text-gray-500">({unit})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
