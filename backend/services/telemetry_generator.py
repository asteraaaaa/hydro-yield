"""
Telemetry Generator - Synthetic IoT data injection with realistic scenarios
"""

import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import threading
import time


class TelemetryGenerator:
    """Generate realistic sensor streams with configurable scenarios"""
    
    SCENARIOS = {
        "Stable Farm": {
            "air_temp": {"mean": 24, "std": 0.5, "drift": 0},
            "water_temp": {"mean": 20, "std": 0.3, "drift": 0},
            "ph": {"mean": 6.2, "std": 0.1, "drift": 0},
            "ec": {"mean": 1.8, "std": 0.1, "drift": 0},
            "tds": {"mean": 900, "std": 50, "drift": 0},
            "lux": {"mean": 23000, "std": 1000, "drift": 0},
            "rh": {"mean": 65, "std": 3, "drift": 0},
        },
        "pH Drift": {
            "air_temp": {"mean": 24, "std": 0.5, "drift": 0},
            "water_temp": {"mean": 20, "std": 0.3, "drift": 0},
            "ph": {"mean": 6.5, "std": 0.15, "drift": -0.015},  # Drifts down
            "ec": {"mean": 1.8, "std": 0.1, "drift": 0},
            "tds": {"mean": 900, "std": 50, "drift": 0},
            "lux": {"mean": 23000, "std": 1000, "drift": 0},
            "rh": {"mean": 65, "std": 3, "drift": 0},
        },
        "Heat Stress": {
            "air_temp": {"mean": 28, "std": 1.0, "drift": 0.01},  # Elevated, slight rise
            "water_temp": {"mean": 24, "std": 0.5, "drift": 0.008},
            "ph": {"mean": 6.3, "std": 0.12, "drift": 0},
            "ec": {"mean": 1.9, "std": 0.15, "drift": 0},
            "tds": {"mean": 950, "std": 75, "drift": 0},
            "lux": {"mean": 26000, "std": 1500, "drift": 0},
            "rh": {"mean": 55, "std": 5, "drift": -0.02},  # Drops
        },
        "Nutrient Dilution": {
            "air_temp": {"mean": 23, "std": 0.5, "drift": 0},
            "water_temp": {"mean": 19, "std": 0.3, "drift": 0},
            "ph": {"mean": 6.1, "std": 0.1, "drift": 0.005},  # Slight rise
            "ec": {"mean": 2.0, "std": 0.1, "drift": -0.012},  # Drops
            "tds": {"mean": 1000, "std": 50, "drift": -6},  # Drops
            "lux": {"mean": 22000, "std": 1000, "drift": 0},
            "rh": {"mean": 68, "std": 3, "drift": 0},
        },
        "Light Spike": {
            "air_temp": {"mean": 25, "std": 0.8, "drift": 0},
            "water_temp": {"mean": 21, "std": 0.4, "drift": 0},
            "ph": {"mean": 6.2, "std": 0.1, "drift": 0},
            "ec": {"mean": 1.7, "std": 0.1, "drift": 0},
            "tds": {"mean": 850, "std": 50, "drift": 0},
            "lux": {"mean": 23000, "std": 3000, "drift": 0, "spike": True},  # Periodic spikes
            "rh": {"mean": 63, "std": 4, "drift": 0},
        },
        "Random Noise": {
            "air_temp": {"mean": 24, "std": 1.5, "drift": 0},
            "water_temp": {"mean": 20, "std": 1.0, "drift": 0},
            "ph": {"mean": 6.2, "std": 0.25, "drift": 0},
            "ec": {"mean": 1.8, "std": 0.3, "drift": 0},
            "tds": {"mean": 900, "std": 150, "drift": 0},
            "lux": {"mean": 23000, "std": 2500, "drift": 0},
            "rh": {"mean": 65, "std": 8, "drift": 0},
        },
    }
    
    def __init__(self):
        self.data: List[Dict[str, Any]] = []
        self.current_scenario = None
        self.scenario_params = None
        self.running = False
        self.thread = None
        self.freq_minutes = 15
        self.duration_hours = None
        self.start_time = None
        self.iteration = 0
        self.lock = threading.Lock()
    
    def start(self, scenario: str = "Stable Farm", freq_minutes: int = 15, duration_hours: Optional[int] = None):
        """Start telemetry generation"""
        if scenario not in self.SCENARIOS:
            raise ValueError(f"Invalid scenario. Choose from: {list(self.SCENARIOS.keys())}")
        
        with self.lock:
            if self.running:
                self.stop()
            
            self.current_scenario = scenario
            self.scenario_params = self.SCENARIOS[scenario]
            self.freq_minutes = freq_minutes
            self.duration_hours = duration_hours
            self.start_time = datetime.utcnow()
            self.iteration = 0
            self.running = True
            
            # Start background thread
            self.thread = threading.Thread(target=self._generate_loop, daemon=True)
            self.thread.start()
            
            print(f"🌱 Telemetry generation started: {scenario} @ {freq_minutes} min intervals")
    
    def stop(self):
        """Stop telemetry generation"""
        with self.lock:
            self.running = False
        
        if self.thread:
            self.thread.join(timeout=2)
        
        print("🛑 Telemetry generation stopped")
    
    def reset(self):
        """Clear all telemetry data"""
        with self.lock:
            self.data = []
            self.iteration = 0
        print("🔄 Telemetry data cleared")
    
    def is_running(self) -> bool:
        """Check if generation is active"""
        return self.running
    
    def _generate_loop(self):
        """Background loop to generate telemetry"""
        while self.running:
            # Check duration limit
            if self.duration_hours is not None:
                elapsed = (datetime.utcnow() - self.start_time).total_seconds() / 3600
                if elapsed >= self.duration_hours:
                    print(f"⏰ Duration limit reached ({self.duration_hours}h)")
                    self.running = False
                    break
            
            # Generate reading
            reading = self._generate_reading()
            
            with self.lock:
                self.data.append(reading)
                # Keep max 10,000 points
                if len(self.data) > 10000:
                    self.data = self.data[-10000:]
                self.iteration += 1
            
            # Sleep for interval
            time.sleep(self.freq_minutes * 60)
    
    def _generate_reading(self) -> Dict[str, Any]:
        """Generate single telemetry reading"""
        timestamp = datetime.utcnow()
        
        reading = {
            "timestamp": timestamp.isoformat(),
        }
        
        for sensor, params in self.scenario_params.items():
            mean = params["mean"]
            std = params["std"]
            drift = params["drift"]
            
            # Apply drift over time
            drifted_mean = mean + (drift * self.iteration)
            
            # Add noise
            value = np.random.normal(drifted_mean, std)
            
            # Spike handling (for Light Spike scenario)
            if params.get("spike") and self.iteration % 20 == 0:
                value += np.random.uniform(5000, 10000)
            
            # Clamp to realistic ranges
            value = self._clamp_value(sensor, value)
            
            reading[sensor] = round(value, 2)
        
        return reading
    
    def _clamp_value(self, sensor: str, value: float) -> float:
        """Clamp sensor values to realistic ranges"""
        ranges = {
            "air_temp": (15, 35),
            "water_temp": (15, 30),
            "ph": (4.0, 8.0),
            "ec": (0.5, 3.5),
            "tds": (250, 1750),
            "lux": (5000, 40000),
            "rh": (30, 90),
        }
        
        if sensor in ranges:
            min_val, max_val = ranges[sensor]
            return max(min_val, min(max_val, value))
        
        return value
    
    def get_current_reading(self) -> Optional[Dict[str, Any]]:
        """Get most recent reading"""
        with self.lock:
            if not self.data:
                return None
            return self.data[-1].copy()
    
    def get_history(self, time_delta: timedelta) -> List[Dict[str, Any]]:
        """Get telemetry history within time window"""
        with self.lock:
            if not self.data:
                return []
            
            cutoff = datetime.utcnow() - time_delta
            
            filtered = [
                reading for reading in self.data
                if datetime.fromisoformat(reading["timestamp"]) >= cutoff
            ]
            
            return [r.copy() for r in filtered]
    
    def load_from_dataframe(self, df):
        """Load telemetry from uploaded CSV DataFrame"""
        with self.lock:
            self.data = []
            
            for _, row in df.iterrows():
                reading = {
                    "timestamp": row["timestamp"],
                    "air_temp": float(row["air_temp"]),
                    "water_temp": float(row["water_temp"]),
                    "ph": float(row["ph"]),
                    "ec": float(row["ec"]),
                    "tds": float(row["tds"]),
                    "lux": float(row["lux"]),
                    "rh": float(row["rh"]),
                }
                self.data.append(reading)
            
            print(f"📊 Loaded {len(self.data)} telemetry records from CSV")
