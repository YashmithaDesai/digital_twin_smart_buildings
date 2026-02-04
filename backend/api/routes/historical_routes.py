from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from core.services.timeseries_service import timeseries_service

logger = logging.getLogger(__name__)


router = APIRouter()


class HistoricalDataRequest(BaseModel):
    building_id: str
    zone_id: Optional[str] = None
    metrics: List[str]  # e.g., ["temperature", "energy", "occupancy"]
    start_time: str  # ISO format
    end_time: str  # ISO format
    resolution_minutes: int = 15


class MetricPoint(BaseModel):
    timestamp: str
    metric: str
    value: float
    zone_id: Optional[str] = None


class HistoricalDataResponse(BaseModel):
    building_id: str
    points: List[MetricPoint]
    resolution_minutes: int


@router.post("/query", response_model=HistoricalDataResponse)
async def query_historical_data(request: HistoricalDataRequest):
    """Query historical time-series data."""
    try:
        logger.info(f"Historical query: {request.building_id}, metrics={request.metrics}")
        start_time = datetime.fromisoformat(request.start_time.replace("Z", "+00:00"))
        end_time = datetime.fromisoformat(request.end_time.replace("Z", "+00:00"))
        
        if start_time >= end_time:
            raise HTTPException(status_code=400, detail="start_time must be before end_time")
        
        # Limit query range to prevent abuse
        max_range_days = 90
        if (end_time - start_time).days > max_range_days:
            raise HTTPException(
                status_code=400,
                detail=f"Query range cannot exceed {max_range_days} days"
            )
        
        df = timeseries_service.get_metrics(
            building_id=request.building_id,
            zone_id=request.zone_id,
            metrics=request.metrics,
            start_time=start_time,
            end_time=end_time,
            resolution_minutes=request.resolution_minutes
        )
        
        points = []
        for _, row in df.iterrows():
            points.append(
                MetricPoint(
                    timestamp=row["timestamp"].isoformat() if hasattr(row["timestamp"], "isoformat") else str(row["timestamp"]),
                    metric=row.get("metric", request.metrics[0]),
                    value=float(row["value"]),
                    zone_id=row.get("zone_id") or request.zone_id
                )
            )
        
        logger.info(f"Returning {len(points)} data points")
        return HistoricalDataResponse(
            building_id=request.building_id,
            points=points,
            resolution_minutes=request.resolution_minutes
        )
    
    except ValueError as e:
        logger.error(f"Invalid datetime format: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid datetime format: {e}")
    except Exception as e:
        logger.error(f"Failed to query data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to query data: {str(e)}")


@router.get("/latest/{building_id}")
async def get_latest_metrics(building_id: str, zone_id: Optional[str] = None):
    """Get latest metric values for a building/zone - OPTIMIZED with bulk query."""
    from core.services.influxdb_service import get_influxdb_client
    import os
    
    logger.info(f"Fetching latest metrics for {building_id}/{zone_id}")
    
    metrics = ["temperature", "energy", "occupancy", "co2"]
    zone_ids = [zone_id] if zone_id else ["zone-core", "zone-east", "zone-west"]
    
    result = {}
    found_real_data = False
    
    try:
        # OPTIMIZED: Single bulk query for ALL zones and metrics
        client = get_influxdb_client()
        bucket = os.getenv("INFLUXDB_BUCKET", "building_telemetry")
        
        # Build filter for all metrics in one query
        metric_filters = " or ".join([f'r["_measurement"] == "{m}"' for m in metrics])
        zone_filters = " or ".join([f'r["zone_id"] == "{z}"' for z in zone_ids])
        
        flux_query = f'''
        from(bucket: "{bucket}")
          |> range(start: -30d)
          |> filter(fn: (r) => r["building_id"] == "{building_id}")
          |> filter(fn: (r) => {zone_filters})
          |> filter(fn: (r) => {metric_filters})
          |> filter(fn: (r) => r["_field"] == "value")
          |> group(columns: ["zone_id", "_measurement"])
          |> last()
          |> yield(name: "last")
        '''
        
        logger.info(f"🚀 Executing optimized bulk query for all zones/metrics")
        tables = client.query_api().query(flux_query)
        
        # Parse results into structure
        for table in tables:
            for record in table.records:
                zone_id_val = record.values.get("zone_id")
                metric = record.values.get("_measurement")
                value = record.values.get("_value")
                
                if zone_id_val not in result:
                    result[zone_id_val] = {}
                
                if value is not None:
                    result[zone_id_val][metric] = float(value)
                    found_real_data = True
        
        logger.info(f"✅ Bulk query returned data for {len(result)} zones")
        
    except Exception as e:
        logger.error(f"❌ Bulk query failed: {e}")
        found_real_data = False
    
    # Fill in synthetic defaults for missing data
    for zid in zone_ids:
        if zid not in result or not result[zid]:
            import random
            logger.warning(f"⚠️  No real data for {zid}, using synthetic defaults")
            result[zid] = {
                "energy": 100 + random.random() * 50,
                "temperature": 20 + random.random() * 5,
                "occupancy": 0.3 + random.random() * 0.4,
            }
    
    if found_real_data:
        logger.info(f"✅ Returning real InfluxDB data for {building_id}")
    else:
        logger.warning(f"⚠️  No real data found, returning synthetic defaults")
    
    return {
        "building_id": building_id,
        "latest_values": result,
        "data_source": "real" if found_real_data else "synthetic"
    }


@router.get("/health")
async def check_data_health():
    """Check InfluxDB connection status."""
    from core.services.influxdb_service import check_influxdb_health
    
    logger.info("Data health check requested")
    health = await check_influxdb_health()
    return health
