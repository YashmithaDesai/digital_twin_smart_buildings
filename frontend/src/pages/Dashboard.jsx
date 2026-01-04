import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import Suggestions from "../components/Suggestions/Suggestions";
import ForecastChart from "../components/ForecastChart/ForecastChart";
import OccupancyForecast from "../components/OccupancyForecast/OccupancyForecast";
import {
  fetchDashboardOverview,
  fetchLatestMetrics,
  applySuggestion,
  dismissSuggestion,
} from "../services/api";

function formatLabel(label) {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function filterMetricsByZone(metrics, zone) {
  if (!zone || !metrics) return metrics;
  return Object.fromEntries(
    Object.entries(metrics).filter(([key]) => key === zone)
  );
}

function LiveMetrics({ latest, selectedZone }) {
  let zones = Object.entries(latest?.latest_values || {});
  
  // Filter by selected zone if provided
  if (selectedZone) {
    zones = zones.filter(([zone]) => zone === selectedZone);
  }
  
  if (zones.length === 0) {
    return <p className="muted">Waiting for live telemetry…</p>;
  }

  return (
    <div className="live-metrics-table">
      {zones.map(([zone, metrics]) => (
        <div key={zone} className="live-metric-row">
          <div className="live-zone">{zone}</div>
          <div className="live-metric">
            <span>Energy</span>
            <strong>{metrics.energy?.toFixed(1) ?? "--"} kWh</strong>
          </div>
          <div className="live-metric">
            <span>Temp</span>
            <strong>{metrics.temperature?.toFixed(1) ?? "--"} °C</strong>
          </div>
          <div className="live-metric">
            <span>Occupancy</span>
            <strong>{(metrics.occupancy ?? 0).toFixed(2)}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertsPanel({ alerts }) {
  if (!alerts.length) {
    return <p className="muted">No active alerts.</p>;
  }
  return (
    <ul className="alerts-list">
      {alerts.map((alert) => (
        <li key={alert.id} className={`alert-card ${alert.severity}`}>
          <div className="alert-header">
            <span className="alert-severity">{alert.severity}</span>
            <span className="alert-time">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <h4>{alert.title}</h4>
          <p>{alert.message}</p>
        </li>
      ))}
    </ul>
  );
}

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [overview, setOverview] = useState(null);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busySuggestionId, setBusySuggestionId] = useState(null);
  const buildingId = "demo-building";
  
  // Get zone and floor from URL search parameters
  const selectedZone = searchParams.get("zone");
  const selectedFloor = searchParams.get("floor");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchDashboardOverview(buildingId);
        setOverview(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [buildingId]);

  async function reloadOverview() {
    const data = await fetchDashboardOverview(buildingId);
    setOverview(data);
  }

  useEffect(() => {
    let timer;
    async function pollLatest() {
      try {
        const data = await fetchLatestMetrics(buildingId);
        setLatest(data);
      } catch (err) {
        // Ignore transient polling errors
        console.error("Latest metrics error:", err);
      }
    }
    pollLatest();
    timer = setInterval(pollLatest, 10000);
    return () => clearInterval(timer);
  }, [buildingId]);

  async function handleApplySuggestion(suggestion) {
    try {
      setBusySuggestionId(suggestion.id);
      await applySuggestion(buildingId, suggestion);
      await reloadOverview();
    } catch (err) {
      setError(err.message || "Failed to apply suggestion");
    } finally {
      setBusySuggestionId(null);
    }
  }

  async function handleDismissSuggestion(suggestion) {
    try {
      setBusySuggestionId(suggestion.id);
      await dismissSuggestion(buildingId, suggestion.id, suggestion);
      await reloadOverview();
    } catch (err) {
      setError(err.message || "Failed to dismiss suggestion");
    } finally {
      setBusySuggestionId(null);
    }
  }

  const chartData = useMemo(() => {
    let data = overview?.charts || [];
    
    // Filter chart data by selected zone if provided
    if (selectedZone && data.length > 0) {
      // If data has zone_id field, filter by it
      if (data[0]?.zone_id !== undefined) {
        data = data.filter(point => point.zone_id === selectedZone);
      }
      // Otherwise apply simple averaging per zone (if available)
    }
    
    return data;
  }, [overview?.charts, selectedZone]);

  const buildingName =
    overview?.building?.name ||
    overview?.building?.building_id ||
    "Building";

  // Calculate zone-specific KPIs if a zone is selected
  const kpis = useMemo(() => {
    if (!selectedZone || !overview?.charts || overview.charts.length === 0) {
      return overview?.kpis || {};
    }
    
    // Filter chart data for selected zone
    const zoneData = overview.charts.filter(point => point.zone_id === selectedZone);
    
    if (zoneData.length === 0) {
      return overview?.kpis || {};
    }
    
    // Calculate zone-specific metrics
    const avgEnergy = zoneData.reduce((sum, p) => sum + (p.energy || 0), 0) / zoneData.length;
    const avgOccupancy = zoneData.reduce((sum, p) => sum + (p.occupancy || 0), 0) / zoneData.length;
    const avgTemp = zoneData.reduce((sum, p) => sum + (p.temperature || 0), 0) / zoneData.length;
    const maxEnergy = Math.max(...zoneData.map(p => p.energy || 0));
    
    return {
      "avg_energy_kw": avgEnergy.toFixed(2),
      "peak_energy_kw": maxEnergy.toFixed(2),
      "avg_occupancy": avgOccupancy.toFixed(2),
      "avg_temperature": avgTemp.toFixed(1),
    };
  }, [selectedZone, overview?.charts]);

  const kpisDisplay = selectedZone ? kpis : (overview?.kpis || {});
  const carbon = overview?.carbon;

  return (
    <section className="monitoring-dashboard">
      <div className="dashboard-decorative-circles">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
        <div className="decorative-circle circle-4"></div>
      </div>
      <div className="dashboard-header">
        <div>
          <h1>{buildingName}</h1>
          {(selectedZone || selectedFloor) && (
            <div className="filter-breadcrumb">
              <span className="breadcrumb-item">Building</span>
              {selectedFloor && (
                <>
                  <span className="breadcrumb-separator">→</span>
                  <span className="breadcrumb-item">Floor {selectedFloor}</span>
                </>
              )}
              {selectedZone && (
                <>
                  <span className="breadcrumb-separator">→</span>
                  <span className="breadcrumb-item">{selectedZone}</span>
                </>
              )}
            </div>
          )}
          <p className="muted">
            Real-time view of energy, comfort, and alerts for the digital twin.
          </p>
        </div>
        {overview?.building?.primary_use && (
          <div className="building-pill">
            {overview.building.primary_use} ·{" "}
            {overview.building.sqft?.toLocaleString()} sqft
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="kpi-grid">
            {Object.entries(kpisDisplay).map(([key, value]) => (
              <div className="kpi-card" key={key}>
                <span className="kpi-label">{formatLabel(key)}</span>
                <span className="kpi-value">
                  {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                </span>
              </div>
            ))}
            {carbon && (
              <div className="kpi-card carbon">
                <span className="kpi-label">Carbon Today</span>
                <span className="kpi-value">
                  {carbon.today_tonnes.toFixed(3)} tCO₂e
                </span>
                <span className={`kpi-trend ${carbon.delta_percent >= 0 ? "up" : "down"}`}>
                  {carbon.delta_percent >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(carbon.delta_percent).toFixed(1)}% vs. yesterday
                </span>
              </div>
            )}
          </div>
            <div className="chart-card">
              <div className="chart-card-header">
                <h3>
                  Energy · Occupancy · Comfort
                  {selectedZone && <span className="zone-badge">{selectedZone}</span>}
                </h3>
              </div>
              {chartData.length === 0 && selectedZone ? (
                <p className="muted" style={{ padding: '2rem' }}>No data available for {selectedZone}</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    }
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="energy"
                    stroke="#4f46e5"
                    name="Energy (kWh)"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#22c55e"
                    name="Occupancy"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f59e0b"
                    name="Temperature (°C)"
                    dot={false}
                  />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>
                Carbon Footprint Trend
                {selectedZone && <span className="zone-badge">{selectedZone}</span>}
              </h3>
            </div>
            {chartData.length === 0 && selectedZone ? (
              <p className="muted" style={{ padding: '2rem' }}>No data available for {selectedZone}</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString([], { hour: "2-digit" })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="carbon"
                  stroke="#14b8a6"
                  fillOpacity={1}
                  fill="url(#colorCarbon)"
                  name="tCO₂e"
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="dashboard-lower-grid">
            <div className="card">
              <div className="card-header">
                <h3>Live Telemetry</h3>
                <span className="muted">
                  Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <LiveMetrics latest={latest} selectedZone={selectedZone} />
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Active Alerts</h3>
              </div>
              <AlertsPanel alerts={overview?.alerts || []} />
            </div>
          </div>

          <div className="dashboard-charts-row">
            <div className="chart-card">
              <ForecastChart buildingId={buildingId} horizonHours={24} actionsVersion={overview?.actions_version} />
            </div>
          </div>

          <div className="dashboard-charts-row">
            <div className="chart-card">
              <OccupancyForecast buildingId={buildingId} horizonHours={12} actionsVersion={overview?.actions_version} />
            </div>
          </div>

          <div className="card suggestions-card">
            <Suggestions
              suggestions={overview?.suggestions || []}
              appliedActions={overview?.applied_actions || []}
              onApply={handleApplySuggestion}
              onDismiss={handleDismissSuggestion}
              busySuggestionId={busySuggestionId}
            />
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;

