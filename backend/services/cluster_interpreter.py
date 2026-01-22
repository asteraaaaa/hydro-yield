"""
Cluster Interpreter - Human-readable cluster descriptions
"""

from typing import Dict, Any


class ClusterInterpreter:
    """Interpret growth pattern clusters"""
    
    # Cluster descriptions from centroid analysis + domain knowledge
    CLUSTER_DESCRIPTIONS = {
        0: {
            "label": "Hot High-Light Dry",
            "description": (
                "Very high light and air temperature with low humidity. "
                "Plants experience strong transpiration and potential dehydration stress."
            ),
            "typical_pattern": (
                "Air ~58°C, Water ~25.5°C, pH ~6.2, EC ~1.85, "
                "Lux ~55k, RH ~25%"
            ),
            "recommended_focus": (
                "Increase humidity, reduce heat load, and ensure sufficient water uptake. "
                "Watch for wilting or nutrient transport stress."
            )
        },

        1: {
            "label": "Low-Light Nutrient Heavy",
            "description": (
                "Low light intensity combined with high EC and TDS. "
                "Plants receive more nutrients than they can metabolize."
            ),
            "typical_pattern": (
                "Air ~67°C, Water ~22.5°C, pH ~7.3, EC ~2.24, "
                "Lux ~22k, TDS ~1.12"
            ),
            "recommended_focus": (
                "Increase light exposure or reduce EC to prevent salt stress "
                "and slow, inefficient growth."
            )
        },

        2: {
            "label": "Humid Balanced Growth",
            "description": (
                "High humidity with moderate temperature and balanced nutrients. "
                "This creates efficient transpiration and stable nutrient uptake."
            ),
            "typical_pattern": (
                "Air ~24°C, Water ~23.7°C, pH ~6.0, EC ~1.95, "
                "Lux ~48k, RH ~57%"
            ),
            "recommended_focus": (
                "Maintain this state. This cluster is closest to optimal "
                "growth conditions and high yield potential."
            )
        },

        3: {
            "label": "Over-Driven High-Input",
            "description": (
                "High light, high nutrients, and high heat with low humidity. "
                "Plants are pushed hard but are vulnerable to stress and burnout."
            ),
            "typical_pattern": (
                "Air ~58°C, Water ~26.3°C, pH ~6.2, EC ~2.17, "
                "Lux ~55k, RH ~25%"
            ),
            "recommended_focus": (
                "Reduce EC and light intensity or increase humidity to prevent "
                "long-term stress and inconsistent yield."
            )
        },
    }

    
    def interpret(self, cluster_id: int) -> Dict[str, Any]:
        """
        Get human-readable interpretation of cluster
        
        Args:
            cluster_id: Cluster ID from KMeans
            
        Returns:
            {
                "label": str,
                "description": str,
                "typical_pattern": str,
                "recommended_focus": str
            }
        """
        cluster_info = self.CLUSTER_DESCRIPTIONS.get(
            cluster_id,
            {
                "label": f"Cluster {cluster_id}",
                "description": "Growth pattern identified but not yet characterized",
                "typical_pattern": "Pattern analysis pending",
                "recommended_focus": "Review environmental parameters"
            }
        )
        
        return cluster_info
