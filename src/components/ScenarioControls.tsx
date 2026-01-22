/**
 * Scenario Controls Component - Start/Stop/Reset simulation
 */

import React, { useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import type { SimScenario } from "@/types";

interface ScenarioControlsProps {
  onStart: (scenario: SimScenario) => void;
  onStop: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const SCENARIOS: SimScenario[] = [
  "Stable Farm",
  "pH Drift",
  "Heat Stress",
  "Nutrient Dilution",
  "Light Spike",
  "Random Noise",
];

export function ScenarioControls({ onStart, onStop, onReset, isRunning }: ScenarioControlsProps) {
  const [selectedScenario, setSelectedScenario] = useState<SimScenario>("Stable Farm");

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Telemetry Simulation Controls</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as SimScenario)}
            disabled={isRunning}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario} value={scenario}>
                {scenario}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={() => onStart(selectedScenario)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}

          <button
            onClick={onReset}
            disabled={isRunning}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
          {isRunning ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Simulation running: <strong>{selectedScenario}</strong>
            </span>
          ) : (
            <span>Select a scenario and click Start to generate telemetry</span>
          )}
        </div>
      </div>
    </div>
  );
}
