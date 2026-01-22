"""
Feature Aggregator - Compute Day-7 proxy features from telemetry
"""

from typing import List, Dict, Any
import numpy as np


class FeatureAggregator:
    """Aggregate telemetry into model-ready features"""
    
    def aggregate(self, telemetry: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Compute Day-7 mean features from telemetry window
        
        Args:
            telemetry: List of telemetry readings
            
        Returns:
            Feature dict matching model schema
        """
        if not telemetry:
            raise ValueError("No telemetry data provided")
        
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
        
        # Compute means
        features = {
            "d7_air_temp_mean": round(np.mean(sensors["air_temp"]), 2),
            "d7_lux_mean": round(np.mean(sensors["lux"]), 2),
            "d7_ph_mean": round(np.mean(sensors["ph"]), 3),
            "d7_water_temp_mean": round(np.mean(sensors["water_temp"]), 2),
            "d7_rh_mean": round(np.mean(sensors["rh"]), 2),
            "d7_ec_mean": round(np.mean(sensors["ec"]), 2),
            "d7_tds_mean": round(np.mean(sensors["tds"]), 2),
        }
        
        return features
