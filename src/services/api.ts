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
const DEFAULT_TIMEOUT_MS = 15000;

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchJson<T>(
    path: string,
    init?: RequestInit,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ detail: `Request failed with status ${response.status}` }));
        throw new Error(errorBody.detail || "Request failed");
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new Error(
          `Request timed out after ${Math.round(timeoutMs / 1000)}s. ` +
            `Ensure the backend is running at ${this.baseUrl}.`
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ============================================================================
  // HEALTH & INFO
  // ============================================================================

  async health(): Promise<any> {
    return this.fetchJson("/health", undefined, 5000);
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.fetchJson("/models/info");
  }

  // ============================================================================
  // TELEMETRY
  // ============================================================================

  async getCurrentTelemetry(): Promise<{ data: TelemetryPoint | null; message?: string }> {
    return this.fetchJson("/telemetry/current");
  }

  async getTelemetryHistory(window: TimeWindow = "7d"): Promise<TelemetrySeries> {
    return this.fetchJson(`/telemetry/history?window=${window}`);
  }

  async startSimulation(
    scenario: SimScenario = "Stable Farm",
    freqMinutes: number = 15,
    durationHours?: number
  ): Promise<any> {
    return this.fetchJson("/telemetry/sim/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario,
        freq_minutes: freqMinutes,
        duration_hours: durationHours,
      }),
    });
  }

  async stopSimulation(): Promise<any> {
    return this.fetchJson("/telemetry/sim/stop", { method: "POST" });
  }

  async resetSimulation(): Promise<any> {
    return this.fetchJson("/telemetry/sim/reset", { method: "POST" });
  }

  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    return this.fetchJson("/telemetry/upload_csv", {
      method: "POST",
      body: formData,
    });
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
    return this.fetchJson("/features/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ window }),
    });
  }

  async predictManual(features: FeatureVector): Promise<PredictionResponse> {
    return this.fetchJson("/predict/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
  }

  async predictAuto(window: string = "7d"): Promise<PredictionResponse> {
    return this.fetchJson("/predict/auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ window }),
    });
  }

  async getFeatureImportance(): Promise<{
    feature_importance: Record<string, number>;
    description: string;
  }> {
    return this.fetchJson("/explain/feature_importance");
  }

  // ============================================================================
  // HISTORY
  // ============================================================================

  async getAnalysisHistory(limit: number = 50): Promise<{
    count: number;
    analyses: AnalysisResult[];
  }> {
    return this.fetchJson(`/history/analyses?limit=${limit}`);
  }

  async saveAnalysis(analysis: AnalysisResult): Promise<any> {
    return this.fetchJson("/history/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysis),
    });
  }
}

export const api = new APIClient();
