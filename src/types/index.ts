/**
 * TypeScript Types for HydroYield Frontend
 */

export interface TelemetryPoint {
  timestamp: string;
  air_temp: number;
  water_temp: number;
  ph: number;
  ec: number;
  tds: number;
  lux: number;
  rh: number;
}

export interface TelemetrySeries {
  window: string;
  count: number;
  data: TelemetryPoint[];
}

export type FeatureVector = {
  d7_air_temp_mean?: number;
  d7_lux_mean?: number;
  d7_ph_mean?: number;
  d7_water_temp_mean?: number;
  d7_rh_mean?: number;
  d7_ec_mean?: number;
  d7_tds_mean?: number;
};


export interface SensorStats {
  std: number;
  normalized_variance: number;
  stability_score: number;
}

export interface StabilityReport {
  score: number;
  label: "Stable" | "Moderate" | "Unstable";
  color: string;
  message: string;
  sensors: Record<string, SensorStats>;
}

export interface YieldPrediction {
  yield: number;
  unit: string;
}

export interface CategoryPrediction {
  category: "Low" | "Medium" | "High";
  probabilities?: Record<string, number>;
}

export interface ClusterPrediction {
  cluster: number;
  label: string;
  description: string;
  typical_pattern: string;
  recommended_focus: string;
}

export interface Predictions {
  yield: YieldPrediction;
  category: CategoryPrediction;
  cluster: ClusterPrediction;
}

export interface Recommendation {
  priority: "High" | "Medium" | "Low";
  category: string;
  action: string;
  reason: string;
  caution: string;
  controllable: boolean;
  feature?: string;
  current_value?: number;
}

export interface PredictionResponse {
  mode: "manual" | "auto";
  timestamp: string;
  predictions: Predictions;
  features: FeatureVector;
  stability: StabilityReport;
  feature_importance: Record<string, number>;
  recommendations: Recommendation[];
  disclaimer: string;
  metadata?: {
    window?: string;
    data_points?: number;
  };
}

export interface AnalysisResult {
  id?: number;
  timestamp: string;
  mode: string;
  scenario?: string;
  yield_estimate?: number;
  yield_category?: string;
  cluster_id?: number;
  cluster_label?: string;
  stability_score?: number;
  stability_label?: string;
  features?: FeatureVector;
  recommendations?: Recommendation[];
  created_at?: string;
}

export interface ModelInfo {
  version: string;
  expected_features: string[];
  feature_count: number;
  models: {
    regressor: {
      type: string;
      has_feature_importance: boolean;
    };
    classifier: {
      type: string;
      classes: string[];
    };
    clusterer: {
      type: string;
      n_clusters: number | null;
    };
  };
  dataset_version: string;
  feature_window: string;
}

export type SimScenario =
  | "Stable Farm"
  | "pH Drift"
  | "Heat Stress"
  | "Nutrient Dilution"
  | "Light Spike"
  | "Random Noise";

export type TimeWindow = "24h" | "3d" | "7d" | "14d" | "30d";
