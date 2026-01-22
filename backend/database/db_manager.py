"""
Database Manager - SQLite storage for telemetry and analysis history
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path


class DatabaseManager:
    """Manage SQLite database for telemetry and analysis history"""
    
    def __init__(self, db_path: str = "backend/data/hydroyield.db"):
        self.db_path = db_path
        self.conn = None
        
    def initialize(self):
        """Create database and tables"""
        # Ensure directory exists
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        
        # Create tables
        self._create_tables()
        
        print(f"💾 Database initialized: {self.db_path}")
    
    def _create_tables(self):
        """Create database schema"""
        cursor = self.conn.cursor()
        
        # Analysis history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                mode TEXT NOT NULL,
                scenario TEXT,
                yield_estimate REAL,
                yield_category TEXT,
                cluster_id INTEGER,
                cluster_label TEXT,
                stability_score REAL,
                stability_label TEXT,
                features TEXT,
                recommendations TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Telemetry archive table (optional, for long-term storage)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS telemetry_archive (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                air_temp REAL,
                water_temp REAL,
                ph REAL,
                ec REAL,
                tds REAL,
                lux REAL,
                rh REAL,
                scenario TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.conn.commit()
    
    def save_analysis(self, analysis: Dict[str, Any]) -> int:
        """Save analysis result to history"""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            INSERT INTO analyses (
                timestamp, mode, scenario, yield_estimate, yield_category,
                cluster_id, cluster_label, stability_score, stability_label,
                features, recommendations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis.get("timestamp", datetime.utcnow().isoformat()),
            analysis.get("mode", "manual"),
            analysis.get("scenario"),
            analysis.get("yield_estimate"),
            analysis.get("yield_category"),
            analysis.get("cluster_id"),
            analysis.get("cluster_label"),
            analysis.get("stability_score"),
            analysis.get("stability_label"),
            json.dumps(analysis.get("features", {})),
            json.dumps(analysis.get("recommendations", []))
        ))
        
        self.conn.commit()
        return cursor.lastrowid
    
    def get_analyses(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get analysis history"""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            SELECT * FROM analyses
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        
        analyses = []
        for row in rows:
            analysis = {
                "id": row["id"],
                "timestamp": row["timestamp"],
                "mode": row["mode"],
                "scenario": row["scenario"],
                "yield_estimate": row["yield_estimate"],
                "yield_category": row["yield_category"],
                "cluster_id": row["cluster_id"],
                "cluster_label": row["cluster_label"],
                "stability_score": row["stability_score"],
                "stability_label": row["stability_label"],
                "features": json.loads(row["features"]) if row["features"] else {},
                "recommendations": json.loads(row["recommendations"]) if row["recommendations"] else [],
                "created_at": row["created_at"]
            }
            analyses.append(analysis)
        
        return analyses
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("💾 Database connection closed")
