"""
Stability Scorer - Compute stability/confidence metrics from telemetry variance
"""

from typing import List, Dict, Any
import numpy as np


class StabilityScorer:
    """Compute stability score and assessment"""
    
    # Reference std values for normalization (from typical data)
    REFERENCE_STD = {
        "air_temp": 2.0,
        "water_temp": 1.5,
        "ph": 0.3,
        "ec": 0.3,
        "tds": 150,
        "lux": 3000,
        "rh": 8.0,
    }
    
    def compute_stability(self, telemetry: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute stability score from telemetry variance
        
        Returns:
            {
                "score": 0-100,
                "label": "Stable" | "Moderate" | "Unstable",
                "message": description,
                "sensors": {sensor: {std, normalized_variance}}
            }
        """
        if len(telemetry) < 5:
            return {
                "score": 50,
                "label": "Moderate",
                "message": "Insufficient data for stability assessment",
                "sensors": {}
            }
        
        # Extract sensor arrays
        sensors = {
            "air_temp": [],
            "lux": [],
            "ph": [],
            "water_temp": [],
            "rh": [],
            "ec": [],
            "tds": [],
        }
        
        for reading in telemetry:
            for sensor in sensors:
                if sensor in reading:
                    sensors[sensor].append(reading[sensor])
        
        # Compute std for each sensor
        sensor_stats = {}
        variance_scores = []
        
        for sensor, values in sensors.items():
            if not values:
                continue
            
            std = np.std(values)
            ref_std = self.REFERENCE_STD.get(sensor, 1.0)
            
            # Normalized variance (0 = perfectly stable, >1 = more variable than reference)
            normalized_var = std / ref_std
            
            # Convert to stability score (0-100, higher = more stable)
            # Use exponential decay: score = 100 * exp(-normalized_var)
            sensor_score = 100 * np.exp(-normalized_var)
            
            sensor_stats[sensor] = {
                "std": round(std, 3),
                "normalized_variance": round(normalized_var, 3),
                "stability_score": round(sensor_score, 1)
            }
            
            variance_scores.append(sensor_score)
        
        # Overall stability score (weighted average, could weight by feature importance)
        overall_score = np.mean(variance_scores) if variance_scores else 50
        overall_score = round(overall_score, 1)
        
        # Label and message
        if overall_score >= 75:
            label = "Stable"
            color = "green"
            message = "Environmental conditions are stable. Predictions are reliable."
        elif overall_score >= 50:
            label = "Moderate"
            color = "yellow"
            message = "Moderate variability detected. Predictions have moderate confidence."
        else:
            label = "Unstable"
            color = "red"
            message = "High variability detected. Stabilize environment before trusting predictions."
        
        return {
            "score": overall_score,
            "label": label,
            "color": color,
            "message": message,
            "sensors": sensor_stats
        }
