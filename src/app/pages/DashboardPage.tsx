/**
 * Dashboard Page - Live telemetry monitoring and scenario control
 */

import { useState, useEffect } from "react";
import { Thermometer, Droplets, Activity, Sun, Wind, Zap, Beaker } from "lucide-react";
import { KpiCard } from "../../components/KpiCard";
import { TimeSeriesChart } from "../../components/TimeSeriesChart";
import { StabilityBadge } from "../../components/StabilityBadge";
import { ScenarioControls } from "../../components/ScenarioControls";
import { api } from "../../services/api";
import { mockApi } from "../../services/mockApi";
import type { TelemetryPoint, TimeWindow, SimScenario } from "../../types";

interface DashboardPageProps {
  demoMode: boolean;
}

export function DashboardPage({ demoMode }: DashboardPageProps) {
  const apiClient = demoMode ? mockApi : api;

  const [currentData, setCurrentData] = useState<TelemetryPoint | null>(null);
  const [historyData, setHistoryData] = useState<TelemetryPoint[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow>("7d");
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current telemetry
  const fetchCurrent = async () => {
    try {
      const result = await apiClient.getCurrentTelemetry();
      if (result.data) {
        setCurrentData(result.data);
      }
    } catch (err: any) {
      console.error("Error fetching current telemetry:", err);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getTelemetryHistory(selectedWindow);
      setHistoryData(result.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Polling effect for current data
  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [demoMode]);

  // Fetch history when window changes
  useEffect(() => {
    fetchHistory();
  }, [selectedWindow, demoMode]);

  // Scenario control handlers
  const handleStart = async (scenario: SimScenario) => {
    try {
      await apiClient.startSimulation(scenario, 15);
      setIsSimRunning(true);
      setTimeout(fetchHistory, 1000);
    } catch (err: any) {
      alert(`Failed to start simulation: ${err.message}`);
    }
  };

  const handleStop = async () => {
    try {
      await apiClient.stopSimulation();
      setIsSimRunning(false);
    } catch (err: any) {
      alert(`Failed to stop simulation: ${err.message}`);
    }
  };

  const handleReset = async () => {
    try {
      await apiClient.resetSimulation();
      setHistoryData([]);
      setCurrentData(null);
    } catch (err: any) {
      alert(`Failed to reset: ${err.message}`);
    }
  };

  // Compute stability for display (simple heuristic)
  const computeStability = () => {
    if (historyData.length < 10) {
      return {
        score: 50,
        label: "Moderate" as const,
        color: "yellow",
        message: "Insufficient data for stability assessment",
        sensors: {},
      };
    }

    // Simple variance check
    const phValues = historyData.map((d) => d.ph);
    const phStd = Math.sqrt(
      phValues.reduce((sum, v) => sum + Math.pow(v - phValues.reduce((a, b) => a + b) / phValues.length, 2), 0) /
        phValues.length
    );

    const score = Math.max(0, Math.min(100, 100 * Math.exp(-phStd / 0.3)));

    return {
      score,
      label: score >= 75 ? ("Stable" as const) : score >= 50 ? ("Moderate" as const) : ("Unstable" as const),
      color: score >= 75 ? "green" : score >= 50 ? "yellow" : "red",
      message:
        score >= 75
          ? "Environmental conditions are stable"
          : score >= 50
          ? "Moderate variability detected"
          : "High variability detected",
      sensors: {},
    };
  };

  const stability = computeStability();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Live Dashboard</h2>
        <p className="text-gray-600 mt-1">Monitor environmental sensors and control simulation scenarios</p>
      </div>

      {/* Scenario Controls */}
      <ScenarioControls
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        isRunning={isSimRunning}
      />

      {/* Current KPIs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Sensor Readings</h3>
        {currentData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <KpiCard
              label="Air Temp"
              value={currentData.air_temp}
              unit="°C"
              icon={<Thermometer className="w-4 h-4" />}
              color="blue"
            />
            <KpiCard
              label="Water Temp"
              value={currentData.water_temp}
              unit="°C"
              icon={<Droplets className="w-4 h-4" />}
              color="blue"
            />
            <KpiCard label="pH" value={currentData.ph} unit="" icon={<Activity className="w-4 h-4" />} color="purple" />
            <KpiCard
              label="EC"
              value={currentData.ec}
              unit="mS/cm"
              icon={<Zap className="w-4 h-4" />}
              color="yellow"
            />
            <KpiCard
              label="TDS"
              value={currentData.tds}
              unit="ppm"
              icon={<Beaker className="w-4 h-4" />}
              color="yellow"
            />
            <KpiCard
              label="Light"
              value={currentData.lux}
              unit="lux"
              icon={<Sun className="w-4 h-4" />}
              color="green"
            />
            <KpiCard
              label="Humidity"
              value={currentData.rh}
              unit="%"
              icon={<Wind className="w-4 h-4" />}
              color="gray"
            />
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center text-gray-500 bg-white">
            No telemetry data available. Start a simulation or upload CSV data.
          </div>
        )}
      </div>

      {/* Stability Badge */}
      <StabilityBadge stability={stability} showDetails />

      {/* Time Window Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Time Series History</h3>
        <div className="flex gap-2">
          {(["24h", "3d", "7d", "14d"] as TimeWindow[]).map((window) => (
            <button
              key={window}
              onClick={() => setSelectedWindow(window)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedWindow === window
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Time Series Charts */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading history...</div>
      ) : error ? (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-red-700">Error: {error}</div>
      ) : historyData.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-gray-500 bg-white">
          No historical data for selected window. Start simulation to generate data.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TimeSeriesChart data={historyData} dataKey="air_temp" title="Air Temperature" unit="°C" color="#3b82f6" />
          <TimeSeriesChart
            data={historyData}
            dataKey="water_temp"
            title="Water Temperature"
            unit="°C"
            color="#06b6d4"
          />
          <TimeSeriesChart data={historyData} dataKey="ph" title="pH" unit="" color="#8b5cf6" />
          <TimeSeriesChart data={historyData} dataKey="ec" title="EC" unit="mS/cm" color="#f59e0b" />
          <TimeSeriesChart data={historyData} dataKey="lux" title="Light Intensity" unit="lux" color="#10b981" />
          <TimeSeriesChart data={historyData} dataKey="rh" title="Relative Humidity" unit="%" color="#6b7280" />
        </div>
      )}
    </div>
  );
}
