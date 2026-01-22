/**
 * API Client for HydroYield Backend
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
  StabilityReport,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // HEALTH & INFO
  // ============================================================================

  async health(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  }

  async getModelInfo(): Promise<ModelInfo> {
    const response = await fetch(`${this.baseUrl}/models/info`);
    if (!response.ok) throw new Error("Failed to fetch model info");
    return response.json();
  }

  // ============================================================================
  // TELEMETRY
  // ============================================================================

  async getCurrentTelemetry(): Promise<{ data: TelemetryPoint | null; message?: string }> {
    const response = await fetch(`${this.baseUrl}/telemetry/current`);
    if (!response.ok) throw new Error("Failed to fetch current telemetry");
    return response.json();
  }

  async getTelemetryHistory(window: TimeWindow = "7d"): Promise<TelemetrySeries> {
    const response = await fetch(`${this.baseUrl}/telemetry/history?window=${window}`);
    if (!response.ok) throw new Error("Failed to fetch telemetry history");
    return response.json();
  }

  async startSimulation(
    scenario: SimScenario = "Stable Farm",
    freqMinutes: number = 15,
    durationHours?: number
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/telemetry/sim/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario,
        freq_minutes: freqMinutes,
        duration_hours: durationHours,
      }),
    });
    if (!response.ok) throw new Error("Failed to start simulation");
    return response.json();
  }

  async stopSimulation(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/telemetry/sim/stop`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to stop simulation");
    return response.json();
  }

  async resetSimulation(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/telemetry/sim/reset`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to reset simulation");
    return response.json();
  }

  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/telemetry/upload_csv`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload CSV");
    return response.json();
  }

  // ============================================================================
  // FEATURES & PREDICTIONS
  // ============================================================================

  async computeFeatures(window: string = "7d"): Promise<{
    features: FeatureVector;
    stability: StabilityReport;
    window: string;
    data_points: number;
  }> {
    const response = await fetch(`${this.baseUrl}/features/compute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ window }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to compute features");
    }
    return response.json();
  }

  async predictManual(features: FeatureVector): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/predict/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Prediction failed");
    }
    return response.json();
  }

  async predictAuto(window: string = "7d"): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/predict/auto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ window }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Auto prediction failed");
    }
    return response.json();
  }

  async getFeatureImportance(): Promise<{
    feature_importance: Record<string, number>;
    description: string;
  }> {
    const response = await fetch(`${this.baseUrl}/explain/feature_importance`);
    if (!response.ok) throw new Error("Failed to fetch feature importance");
    return response.json();
  }

  // ============================================================================
  // HISTORY
  // ============================================================================

  async getAnalysisHistory(limit: number = 50): Promise<{
    count: number;
    analyses: AnalysisResult[];
  }> {
    const response = await fetch(`${this.baseUrl}/history/analyses?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch analysis history");
    return response.json();
  }

  async saveAnalysis(analysis: AnalysisResult): Promise<any> {
    const response = await fetch(`${this.baseUrl}/history/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysis),
    });
    if (!response.ok) throw new Error("Failed to save analysis");
    return response.json();
  }
}

export const api = new APIClient();
