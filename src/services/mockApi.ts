/**
 * Mock API Client for Demo Mode (when backend is not available)
 */

import type {
  TelemetryPoint,
  TelemetrySeries,
  FeatureVector,
  PredictionResponse,
  AnalysisResult,
  ModelInfo,
  SimScenario,
  TimeWindow,
} from "@/types";

// Mock data generator
class MockAPIClient {
  private mockData: TelemetryPoint[] = [];
  private isSimulating = false;
  private currentScenario: SimScenario = "Stable Farm";

  constructor() {
    // Generate initial mock data
    this.generateMockData(50);
  }

  private generateMockData(count: number) {
    const now = new Date();
    for (let i = count; i > 0; i--) {
      const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
      this.mockData.push({
        timestamp: timestamp.toISOString(),
        air_temp: 24 + Math.random() * 2 - 1,
        water_temp: 20 + Math.random() * 1 - 0.5,
        ph: 6.2 + Math.random() * 0.2 - 0.1,
        ec: 1.8 + Math.random() * 0.2 - 0.1,
        tds: 900 + Math.random() * 100 - 50,
        lux: 23000 + Math.random() * 2000 - 1000,
        rh: 65 + Math.random() * 6 - 3,
      });
    }
  }

  async health(): Promise<any> {
    return {
      status: "healthy (mock)",
      timestamp: new Date().toISOString(),
      models_loaded: true,
      telemetry_active: this.isSimulating,
    };
  }

  async getModelInfo(): Promise<ModelInfo> {
    return {
      version: "v1",
      expected_features: [
        "d7_air_temp_mean",
        "d7_lux_mean",
        "d7_ph_mean",
        "d7_water_temp_mean",
        "d7_rh_mean",
        "d7_ec_mean",
        "d7_tds_mean",
      ],
      feature_count: 7,
      models: {
        regressor: {
          type: "RandomForestRegressor",
          has_feature_importance: true,
        },
        classifier: {
          type: "RandomForestClassifier",
          classes: ["Low", "Medium", "High"],
        },
        clusterer: {
          type: "KMeans",
          n_clusters: 4,
        },
      },
      dataset_version: "V1",
      feature_window: "Day 7 (≥7 days early-stage)",
    };
  }

  async getCurrentTelemetry(): Promise<{ data: TelemetryPoint | null; message?: string }> {
    if (this.mockData.length === 0) {
      return { data: null, message: "No telemetry data available. Start simulation first." };
    }
    return { data: this.mockData[this.mockData.length - 1] };
  }

  async getTelemetryHistory(window: TimeWindow = "7d"): Promise<TelemetrySeries> {
    const windowHours: Record<TimeWindow, number> = {
      "24h": 24,
      "3d": 72,
      "7d": 168,
      "14d": 336,
      "30d": 720,
    };

    const hours = windowHours[window] || 168;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    const filtered = this.mockData.filter(
      (d) => new Date(d.timestamp) >= cutoff
    );

    return {
      window,
      count: filtered.length,
      data: filtered,
    };
  }

  async startSimulation(
    scenario: SimScenario = "Stable Farm",
    freqMinutes: number = 15,
    durationHours?: number
  ): Promise<any> {
    this.isSimulating = true;
    this.currentScenario = scenario;
    // In real mode, this would start background generation
    // For mock, we just flag it
    return {
      status: "started (mock)",
      scenario,
      freq_minutes: freqMinutes,
      duration_hours: durationHours,
      message: `Mock simulation started with '${scenario}' scenario`,
    };
  }

  async stopSimulation(): Promise<any> {
    this.isSimulating = false;
    return { status: "stopped (mock)", message: "Mock simulation stopped" };
  }

  async resetSimulation(): Promise<any> {
    this.mockData = [];
    this.generateMockData(50);
    return { status: "reset (mock)", message: "Mock telemetry data cleared" };
  }

  async uploadCSV(file: File): Promise<any> {
    return {
      status: "success (mock)",
      message: `Mock upload: ${file.name}`,
      rows: 100,
    };
  }

  async computeFeatures(window: string = "7d") {
    // Use last N points to compute features
    const recent = this.mockData.slice(-50);
    
    const features: FeatureVector = {
      d7_air_temp_mean: this.avg(recent.map((r) => r.air_temp)),
      d7_lux_mean: this.avg(recent.map((r) => r.lux)),
      d7_ph_mean: this.avg(recent.map((r) => r.ph)),
      d7_water_temp_mean: this.avg(recent.map((r) => r.water_temp)),
      d7_rh_mean: this.avg(recent.map((r) => r.rh)),
      d7_ec_mean: this.avg(recent.map((r) => r.ec)),
      d7_tds_mean: this.avg(recent.map((r) => r.tds)),
    };

    const stability = {
      score: 78.5,
      label: "Stable" as const,
      color: "green",
      message: "Environmental conditions are stable. Predictions are reliable.",
      sensors: {
        air_temp: { std: 0.8, normalized_variance: 0.4, stability_score: 85.2 },
        ph: { std: 0.09, normalized_variance: 0.3, stability_score: 88.1 },
      },
    };

    return {
      features,
      stability,
      window,
      data_points: recent.length,
    };
  }

  async predictManual(features: FeatureVector): Promise<PredictionResponse> {
    // Simple mock prediction logic
    const baseYield = 180;
    const phFactor = features.d7_ph_mean >= 5.8 && features.d7_ph_mean <= 6.5 ? 1.0 : 0.85;
    const luxFactor = Math.min(features.d7_lux_mean / 25000, 1.2);
    const yieldValue = baseYield * phFactor * luxFactor;

    const category = yieldValue < 150 ? "Low" : yieldValue < 200 ? "Medium" : "High";

    return {
      mode: "manual",
      timestamp: new Date().toISOString(),
      predictions: {
        yield: { yield: Math.round(yieldValue * 100) / 100, unit: "grams" },
        category: {
          category: category as any,
          probabilities: {
            Low: category === "Low" ? 0.75 : 0.15,
            Medium: category === "Medium" ? 0.70 : 0.15,
            High: category === "High" ? 0.75 : 0.10,
          },
        },
        cluster: {
          cluster: 0,
          label: "Optimal Balanced",
          description: "Balanced environmental conditions with moderate nutrients and ideal temperature range",
          typical_pattern: "Air ~24°C, Water ~20°C, pH ~6.0, EC ~1.6, Lux ~22k",
          recommended_focus: "Maintain current balance; monitor for drift",
        },
      },
      features,
      stability: {
        score: 75,
        label: "Moderate",
        color: "yellow",
        message: "Manual entry - stability not computed",
        sensors: {},
      },
      feature_importance: {
        d7_lux_mean: 0.22,
        d7_air_temp_mean: 0.18,
        d7_ph_mean: 0.15,
        d7_ec_mean: 0.14,
        d7_water_temp_mean: 0.12,
        d7_tds_mean: 0.11,
        d7_rh_mean: 0.08,
      },
      recommendations: [
        {
          priority: "Medium",
          category: "Environmental Parameter",
          action: "Consider gradually increasing Light Intensity",
          reason: "Light Intensity is below optimal range (23000.00 < 25000). Feature importance: 22.00%.",
          caution: "Adjust light height or intensity. Avoid sudden changes that can stress plants.",
          controllable: true,
        },
      ],
      disclaimer:
        "This is a decision-support tool only. Recommendations are general guidance. Adjust gradually and monitor carefully. Do not apply without agronomic expertise.",
    };
  }

  async predictAuto(window: string = "7d"): Promise<PredictionResponse> {
    const { features } = await this.computeFeatures(window);
    const result = await this.predictManual(features);
    return {
      ...result,
      mode: "auto",
      stability: {
        score: 82.3,
        label: "Stable",
        color: "green",
        message: "Environmental conditions are stable. Predictions are reliable.",
        sensors: {},
      },
      metadata: {
        window,
        data_points: 50,
      },
    };
  }

  async getFeatureImportance() {
    return {
      feature_importance: {
        d7_lux_mean: 0.22,
        d7_air_temp_mean: 0.18,
        d7_ph_mean: 0.15,
        d7_ec_mean: 0.14,
        d7_water_temp_mean: 0.12,
        d7_tds_mean: 0.11,
        d7_rh_mean: 0.08,
      },
      description:
        "Global feature importance from Random Forest regressor. Higher values indicate stronger influence on yield predictions.",
    };
  }

  async getAnalysisHistory(limit: number = 50) {
    // Return empty for mock
    return {
      count: 0,
      analyses: [] as AnalysisResult[],
    };
  }

  async saveAnalysis(analysis: AnalysisResult) {
    return {
      status: "saved (mock)",
      analysis_id: Math.floor(Math.random() * 1000),
      message: "Analysis saved to mock storage",
    };
  }

  private avg(arr: number[]): number {
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
  }
}

export const mockApi = new MockAPIClient();
