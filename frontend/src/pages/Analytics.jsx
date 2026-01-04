import React, { useEffect, useState } from "react";
import { fetchAnomalies, fetchSuggestions, applySuggestion, dismissSuggestion, fetchAppliedActions } from "../services/api";
import AnomalyDisplay from "../components/AnomalyDisplay/AnomalyDisplay";
import Suggestions from "../components/Suggestions/Suggestions";


function Analytics() {
  const [anomalies, setAnomalies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [appliedActions, setAppliedActions] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("energy");
  const [loading, setLoading] = useState(false);
  const [busySuggestionId, setBusySuggestionId] = useState(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [anomalyData, suggestionData, appliedData] = await Promise.all([
          fetchAnomalies("demo-building", selectedMetric),
          fetchSuggestions("demo-building"),
          fetchAppliedActions("demo-building"),
        ]);
        setAnomalies(anomalyData);
        setSuggestions(suggestionData);
        setAppliedActions(appliedData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    init();

    // Auto-refresh every 5 minutes
    const interval = setInterval(init, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedMetric]);

  // Handlers for Suggestions actions
  const handleApply = async (suggestion) => {
    setBusySuggestionId(suggestion.id);
    try {
      await applySuggestion("demo-building", suggestion);
      // Refresh suggestions and applied actions
      const [suggestionData, appliedData] = await Promise.all([
        fetchSuggestions("demo-building"),
        fetchAppliedActions("demo-building"),
      ]);
      setSuggestions(suggestionData);
      setAppliedActions(appliedData);
    } catch (err) {
      console.error("Failed to apply suggestion:", err);
    } finally {
      setBusySuggestionId(null);
    }
  };

  const handleDismiss = async (suggestion) => {
    setBusySuggestionId(suggestion.id);
    try {
      await dismissSuggestion("demo-building", suggestion.id, suggestion);
      // Refresh suggestions
      const suggestionData = await fetchSuggestions("demo-building");
      setSuggestions(suggestionData);
    } catch (err) {
      console.error("Failed to dismiss suggestion:", err);
    } finally {
      setBusySuggestionId(null);
    }
  };

  return (
    <section className="analytics">
      <div className="dashboard-decorative-circles">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
        <div className="decorative-circle circle-4"></div>
      </div>
      <h1>Analytics</h1>

      <div className="metric-selector">
        <label>Select Metric:</label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="energy">Energy</option>
          <option value="temperature">Temperature</option>
          <option value="co2">CO₂</option>
          <option value="occupancy">Occupancy</option>
        </select>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div className="analytics-content">
          <div className="analytics-section">
            <AnomalyDisplay anomalies={anomalies} metric={selectedMetric} />
          </div>
          <div className="analytics-section">
            <Suggestions
              suggestions={suggestions}
              appliedActions={appliedActions}
              onApply={handleApply}
              onDismiss={handleDismiss}
              busySuggestionId={busySuggestionId}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default Analytics;


