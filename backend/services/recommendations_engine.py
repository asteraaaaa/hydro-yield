"""
Recommendations Engine - Generate safe, actionable recommendations
"""

from typing import Dict, Any, List


class RecommendationsEngine:
    """Generate ranked recommendations with safety constraints"""
    
    # Optimal ranges (general hydroponic guidelines)
    OPTIMAL_RANGES = {
        "d7_ph_mean": (5.8, 6.5),
        "d7_ec_mean": (1.2, 2.2),
        "d7_air_temp_mean": (20, 26),
        "d7_water_temp_mean": (18, 22),
        "d7_lux_mean": (20000, 30000),
        "d7_rh_mean": (50, 70),
        "d7_tds_mean": (600, 1100),
    }
    
    # Feature display names
    FEATURE_NAMES = {
        "d7_ph_mean": "pH",
        "d7_ec_mean": "EC (Electrical Conductivity)",
        "d7_air_temp_mean": "Air Temperature",
        "d7_water_temp_mean": "Water Temperature",
        "d7_lux_mean": "Light Intensity",
        "d7_rh_mean": "Relative Humidity",
        "d7_tds_mean": "TDS (Total Dissolved Solids)",
    }
    
    def generate(
        self,
        features: Dict[str, float],
        predictions: Dict[str, Any],
        feature_importance: Dict[str, float],
        stability: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate ranked recommendations
        
        Args:
            features: Feature values
            predictions: Prediction results
            feature_importance: Feature importance scores
            stability: Stability assessment
            
        Returns:
            List of recommendations sorted by priority
        """
        recommendations = []
        
        # 1. Check stability first
        if stability["score"] < 50:
            recommendations.append({
                "priority": "High",
                "category": "Stability",
                "action": "Stabilize environmental conditions",
                "reason": f"High variability detected (stability score: {stability['score']:.1f}/100). Unstable conditions reduce prediction confidence.",
                "caution": "Focus on reducing fluctuations before making other adjustments. Monitor sensors for equipment issues.",
                "controllable": True
            })
        
        # 2. Check each feature against optimal range
        for feature, value in features.items():
            if feature not in self.OPTIMAL_RANGES:
                continue
            
            opt_min, opt_max = self.OPTIMAL_RANGES[feature]
            importance = feature_importance.get(feature, 0.1)
            
            # Calculate deviation
            if value < opt_min:
                deviation = (opt_min - value) / opt_min
                direction = "increase"
                status = f"below optimal range ({value:.2f} < {opt_min:.2f})"
            elif value > opt_max:
                deviation = (value - opt_max) / opt_max
                direction = "decrease"
                status = f"above optimal range ({value:.2f} > {opt_max:.2f})"
            else:
                continue  # Within range
            
            # Priority score: importance × deviation × stability factor
            stability_factor = 1.0 if stability["score"] >= 70 else 0.7
            priority_score = importance * deviation * stability_factor
            
            # Determine priority level
            if priority_score > 0.15:
                priority = "High"
            elif priority_score > 0.08:
                priority = "Medium"
            else:
                priority = "Low"
            
            # Controllability
            controllable = feature in [
                "d7_ph_mean", "d7_ec_mean", "d7_water_temp_mean",
                "d7_air_temp_mean", "d7_lux_mean"
            ]
            
            # Generate recommendation
            rec = self._create_recommendation(
                feature=feature,
                value=value,
                direction=direction,
                status=status,
                priority=priority,
                importance=importance,
                controllable=controllable
            )
            
            recommendations.append(rec)
        
        # 3. Add monitoring recommendation if everything is good
        if len(recommendations) == 0:
            recommendations.append({
                "priority": "Low",
                "category": "Monitoring",
                "action": "Continue monitoring current conditions",
                "reason": "All parameters are within optimal ranges. Maintain current management practices.",
                "caution": "Regular monitoring is essential. Small drifts can compound over time.",
                "controllable": True
            })
        
        # 4. Add category-specific guidance
        if predictions.get("category") == "Low":
            recommendations.append({
                "priority": "Medium",
                "category": "Yield Forecast",
                "action": "Review overall system performance",
                "reason": f"Predicted yield category is 'Low' (~{predictions.get('yield', 0):.1f}g). Consider environmental optimization.",
                "caution": "Do not make drastic changes. Gradual adjustments are safer. Consult agronomic expertise.",
                "controllable": True
            })
        
        # 5. Sort by priority
        priority_order = {"High": 0, "Medium": 1, "Low": 2}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))
        
        return recommendations
    
    def _create_recommendation(
        self,
        feature: str,
        value: float,
        direction: str,
        status: str,
        priority: str,
        importance: float,
        controllable: bool
    ) -> Dict[str, Any]:
        """Create individual recommendation"""
        
        feature_name = self.FEATURE_NAMES.get(feature, feature)
        
        # Action
        action = f"Consider gradually {direction}ing {feature_name}"
        
        # Reason
        reason = f"{feature_name} is {status}. Feature importance: {importance:.2%}."
        
        # Caution (always safe, no dosing quantities)
        cautions = {
            "d7_ph_mean": "Adjust pH gradually over 24-48 hours. Use pH up/down products carefully. Monitor frequently.",
            "d7_ec_mean": "Adjust nutrient concentration slowly. If decreasing, dilute with water. If increasing, add nutrients incrementally.",
            "d7_air_temp_mean": "Use ventilation, fans, or cooling systems. Avoid sudden temperature changes.",
            "d7_water_temp_mean": "Use water chillers or heaters. Change temperature gradually (1-2°C per day max).",
            "d7_lux_mean": "Adjust light height or intensity. Avoid sudden changes that can stress plants.",
            "d7_rh_mean": "Use humidifiers/dehumidifiers. Ensure good air circulation. Monitor for mold/disease.",
            "d7_tds_mean": "TDS correlates with EC. Adjust nutrient solution concentration gradually.",
        }
        
        caution = cautions.get(feature, "Adjust gradually and monitor plant response. Consult agronomic expertise.")
        
        if not controllable:
            caution += " (Note: This parameter may be harder to control directly.)"
        
        return {
            "priority": priority,
            "category": "Environmental Parameter",
            "action": action,
            "reason": reason,
            "caution": caution,
            "controllable": controllable,
            "feature": feature,
            "current_value": value
        }
