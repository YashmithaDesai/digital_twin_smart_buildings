from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import pandas as pd
import logging

from core.services.influxdb_service import (
    query_time_series,
    query_time_series_stub,
    write_telemetry_point
)

logger = logging.getLogger(__name__)


class TimeSeriesService:
    """Service for managing time-series data operations."""
    
    @staticmethod
    def get_metrics(
        building_id: str,
        zone_id: Optional[str],
        metrics: List[str],
        start_time: datetime,
        end_time: datetime,
        resolution_minutes: int = 15
    ) -> pd.DataFrame:
        """Get time-series metrics for a building/zone."""
        try:
            logger.info(f"Attempting InfluxDB query for {building_id}/{zone_id}, metrics={metrics}")
            df = query_time_series(
                building_id=building_id,
                zone_id=zone_id,
                metrics=metrics,
                start_time=start_time,
                end_time=end_time,
                resolution_minutes=resolution_minutes
            )
            if not df.empty:
                logger.info(f"✅ InfluxDB query successful: {len(df)} records returned")
                return df
            else:
                logger.warning(f"⚠️  InfluxDB query returned empty results, using synthetic fallback")
                return query_time_series_stub(
                    building_id=building_id,
                    zone_id=zone_id,
                    metrics=metrics,
                    start_time=start_time,
                    end_time=end_time,
                    resolution_minutes=resolution_minutes
                )
        except Exception as e:
            logger.error(f"❌ InfluxDB query failed: {e}, using synthetic fallback", exc_info=True)
            # Fallback to stub if InfluxDB unavailable
            return query_time_series_stub(
                building_id=building_id,
                zone_id=zone_id,
                metrics=metrics,
                start_time=start_time,
                end_time=end_time,
                resolution_minutes=resolution_minutes
            )
    
    @staticmethod
    def store_simulation_results(
        building_id: str,
        zone_id: str,
        results: Dict[str, pd.Series],
        start_time: datetime
    ) -> None:
        """Store simulation results to InfluxDB."""
        for metric_name, series in results.items():
            for timestamp, value in series.items():
                write_telemetry_point(
                    building_id=building_id,
                    zone_id=zone_id,
                    metric=metric_name,
                    value=float(value),
                    timestamp=timestamp if isinstance(timestamp, datetime) else pd.Timestamp(timestamp).to_pydatetime()
                )
    
    @staticmethod
    def get_latest_metrics(
        building_id: str,
        zone_ids: List[str],
        metrics: List[str]
    ) -> Dict[str, Dict[str, float]]:
        """Get latest values for multiple metrics across zones."""
        from core.services.influxdb_service import get_latest_value
        
        result = {}
        for zone_id in zone_ids:
            result[zone_id] = {}
            for metric in metrics:
                value = get_latest_value(building_id, zone_id, metric)
                if value is not None:
                    result[zone_id][metric] = value
        
        return result


# Create singleton instance for easy importing
timeseries_service = TimeSeriesService()
