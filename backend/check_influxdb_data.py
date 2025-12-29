#!/usr/bin/env python3
"""
Script to check if data exists in InfluxDB bucket.
Run this from the backend directory: python check_influxdb_data.py
"""

import sys
from datetime import datetime, timedelta, timezone

from core.utils.config import get_settings
from core.services.influxdb_service import get_query_api, get_influx_client


def check_influxdb_data():
    print("=" * 70)
    print("INFLUXDB DATA CHECK")
    print("=" * 70)
    
    settings = get_settings()
    print(f"\nConfiguration:")
    print(f"  URL: {settings.influxdb_url}")
    print(f"  Org: {settings.influxdb_org}")
    print(f"  Bucket: {settings.influxdb_bucket}")
    print(f"  Token: {'SET' if settings.influxdb_token else 'EMPTY'}")
    
    # Test connection
    print(f"\n{'='*70}")
    print("Testing InfluxDB Connection...")
    print(f"{'='*70}")
    
    try:
        client = get_influx_client()
        query_api = get_query_api()
        print("✅ InfluxDB client created successfully")
    except Exception as e:
        print(f"❌ Failed to create InfluxDB client: {e}")
        return
    
    # Query 1: Check all measurements in the bucket
    print(f"\n{'='*70}")
    print("Query 1: Checking what measurements exist in bucket...")
    print(f"{'='*70}")
    
    try:
        # Query to get all measurements
        flux_query = f'''
        import "influxdata/influxdb/schema"
        schema.measurements(bucket: "{settings.influxdb_bucket}")
        '''
        
        result = query_api.query(flux_query)
        measurements = []
        for table in result:
            for record in table.records:
                if record.get_value() not in measurements:
                    measurements.append(record.get_value())
        
        if measurements:
            print(f"✅ Found {len(measurements)} measurement(s): {measurements}")
        else:
            print("❌ No measurements found in bucket")
    except Exception as e:
        print(f"⚠️  Error querying measurements: {e}")
    
    # Query 2: Check for telemetry data (energy, temperature, etc.) in the last 30 days
    print(f"\n{'='*70}")
    print("Query 2: Checking for telemetry data (energy/temp/occupancy) in last 30 days...")
    print(f"{'='*70}")
    
    try:
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=30)
        start_iso = start_time.isoformat()
        end_iso = end_time.isoformat()
        
        # Only check for our telemetry measurements, not InfluxDB internal metrics
        flux_query = f'''
        from(bucket: "{settings.influxdb_bucket}")
          |> range(start: time(v: "{start_iso}"), stop: time(v: "{end_iso}"))
          |> filter(fn: (r) => r["_measurement"] == "energy" or r["_measurement"] == "temperature" or r["_measurement"] == "occupancy" or r["_measurement"] == "humidity")
          |> limit(n: 10)
        '''
        
        result = query_api.query(flux_query)
        record_count = 0
        sample_records = []
        
        for table in result:
            for record in table.records:
                record_count += 1
                if len(sample_records) < 5:
                    sample_records.append({
                        'time': record.get_time(),
                        'measurement': record.get_measurement(),
                        'field': record.get_field(),
                        'value': record.get_value(),
                        'building_id': record.values.get('building_id', 'N/A'),
                        'zone_id': record.values.get('zone_id', 'N/A')
                    })
        
        if record_count > 0:
            print(f"✅ Found {record_count} telemetry record(s) in the last 30 days")
            print(f"\nSample records:")
            for i, rec in enumerate(sample_records, 1):
                print(f"  {i}. Time: {rec['time']}, Measurement: {rec['measurement']}, "
                      f"Value: {rec['value']}, "
                      f"Building: {rec['building_id']}, Zone: {rec['zone_id']}")
        else:
            print("❌ No telemetry records found in the last 30 days")
            print("   (Only InfluxDB internal metrics exist)")
    except Exception as e:
        print(f"⚠️  Error querying data: {e}")
        import traceback
        traceback.print_exc()
    
    # Query 3: Check what building_id values actually exist
    print(f"\n{'='*70}")
    print("Query 3: Checking what building_id values exist in data...")
    print(f"{'='*70}")
    
    try:
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=30)
        start_iso = start_time.isoformat()
        end_iso = end_time.isoformat()
        
        # First, check what building_id tags exist
        flux_query = f'''
        import "influxdata/influxdb/schema"
        schema.tagValues(bucket: "{settings.influxdb_bucket}", tag: "building_id", start: {start_iso}, stop: {end_iso})
        '''
        
        result = query_api.query(flux_query)
        building_ids = set()
        for table in result:
            for record in table.records:
                building_ids.add(record.get_value())
        
        if building_ids:
            print(f"✅ Found building_id tags: {sorted(building_ids)}")
        else:
            print("❌ No building_id tags found in data")
        
        # Now check for demo-building specifically
        print(f"\nChecking for 'demo-building' specifically...")
        flux_query = f'''
        from(bucket: "{settings.influxdb_bucket}")
          |> range(start: time(v: "{start_iso}"), stop: time(v: "{end_iso}"))
          |> filter(fn: (r) => r["building_id"] == "demo-building")
          |> filter(fn: (r) => r["_measurement"] == "energy" or r["_measurement"] == "temperature" or r["_measurement"] == "occupancy" or r["_measurement"] == "humidity")
          |> limit(n: 10)
        '''
        
        result = query_api.query(flux_query)
        record_count = 0
        zones = set()
        metrics = set()
        
        for table in result:
            for record in table.records:
                record_count += 1
                zones.add(record.values.get('zone_id', 'unknown'))
                metrics.add(record.get_measurement())
        
        if record_count > 0:
            print(f"✅ Found {record_count} record(s) for 'demo-building'")
            print(f"   Zones: {sorted(zones)}")
            print(f"   Metrics: {sorted(metrics)}")
        else:
            print("❌ No records found for 'demo-building'")
            if building_ids:
                print(f"\n⚠️  Available building_ids: {sorted(building_ids)}")
                print("   Consider updating queries to use one of these building_ids")
    except Exception as e:
        print(f"⚠️  Error querying building data: {e}")
        import traceback
        traceback.print_exc()
    
    # Query 4: Count total records
    print(f"\n{'='*70}")
    print("Query 4: Counting total records in bucket...")
    print(f"{'='*70}")
    
    try:
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=365)  # Check last year
        start_iso = start_time.isoformat()
        end_iso = end_time.isoformat()
        
        flux_query = f'''
        from(bucket: "{settings.influxdb_bucket}")
          |> range(start: time(v: "{start_iso}"), stop: time(v: "{end_iso}"))
          |> count()
        '''
        
        result = query_api.query(flux_query)
        total_count = 0
        
        for table in result:
            for record in table.records:
                total_count = record.get_value()
        
        if total_count > 0:
            print(f"✅ Total records in bucket: {total_count}")
        else:
            print("❌ Bucket is empty (no records)")
    except Exception as e:
        print(f"⚠️  Error counting records: {e}")
    
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print("If all queries returned empty/zero results:")
    print("  → InfluxDB is running but has NO DATA")
    print("  → The application will fall back to synthetic data")
    print("  → You need to populate InfluxDB with data from deployment_data.csv")


if __name__ == "__main__":
    check_influxdb_data()

