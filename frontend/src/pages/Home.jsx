import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/homepage.css";

function Home() {
  const [activeBuildingType, setActiveBuildingType] = useState("all");
  const [buildingName, setBuildingName] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [floor, setFloor] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const buildingTypes = [
    { id: "all", label: "All Buildings" },
    { id: "commercial", label: "Commercial" },
    { id: "residential", label: "Residential" },
  ];

  const quickActions = [
    { id: "energy", label: "Energy Forecast", icon: "→", path: "/dashboard" },
    { id: "occupancy", label: "Occupancy", icon: "→", path: "/analytics" },
    { id: "thermal", label: "Thermal Analysis", icon: "→", path: "/twin" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", { buildingName, selectedZone, floor });
    // Add search logic here
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-headline">
            Optimize Your Building's Performance with Digital Twin Technology
          </h1>

          {/* Building Type Tabs */}
          <div className="building-type-tabs">
            {buildingTypes.map((type) => (
              <button
                key={type.id}
                className={`building-type-tab ${
                  activeBuildingType === type.id ? "active" : ""
                }`}
                onClick={() => setActiveBuildingType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Panel */}
          <div className="search-panel">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-field">
                <label htmlFor="building-name">Building Name</label>
                <input
                  id="building-name"
                  type="text"
                  placeholder="Search Building..."
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                />
              </div>

              <div className="search-field">
                <label htmlFor="zone">Zone</label>
                <select
                  id="zone"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <option value="">Select Zone</option>
                  <option value="zone-a">Zone A</option>
                  <option value="zone-b">Zone B</option>
                  <option value="zone-c">Zone C</option>
                  <option value="zone-d">Zone D</option>
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="floor">Floor</label>
                <div className="location-input-wrapper">
                  <input
                    id="floor"
                    type="text"
                    placeholder="Floor Number"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                  <span className="location-icon">🏢</span>
                </div>
              </div>

              <button
                type="button"
                className="more-filters-btn"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                aria-label="More filters"
              >
                <span>▼</span> More
              </button>

              <button type="submit" className="search-btn" aria-label="Search">
                <span className="search-icon">🔍</span>
                Search
              </button>
            </form>

            {showMoreFilters && (
              <div className="more-filters-panel">
                <div className="filter-group">
                  <label>Energy Range (kWh)</label>
                  <div className="price-range">
                    <input type="number" placeholder="Min" />
                    <span>-</span>
                    <input type="number" placeholder="Max" />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Occupancy Level</label>
                  <select>
                    <option>Any</option>
                    <option>Low (0-25%)</option>
                    <option>Medium (26-50%)</option>
                    <option>High (51-75%)</option>
                    <option>Full (76-100%)</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>System Type</label>
                  <select>
                    <option>All Systems</option>
                    <option>HVAC</option>
                    <option>Lighting</option>
                    <option>Security</option>
                    <option>Water</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="quick-actions">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.path}
                className="quick-action-btn"
              >
                {action.label} <span>{action.icon}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Navigation Section */}
      <section className="secondary-nav-section">
        <div className="secondary-nav-container">
          <h2 className="secondary-nav-title">Explore Building Intelligence</h2>
          <div className="secondary-nav-grid">
            <Link to="/dashboard" className="nav-card">
              <div className="nav-card-icon">📊</div>
              <h3>Dashboard</h3>
              <p>Monitor real-time energy consumption, occupancy patterns, and HVAC performance metrics</p>
            </Link>
            <Link to="/analytics" className="nav-card">
              <div className="nav-card-icon">📈</div>
              <h3>Analytics</h3>
              <p>Advanced forecasting, anomaly detection, and optimization recommendations</p>
            </Link>
            <Link to="/twin" className="nav-card">
              <div className="nav-card-icon">🔄</div>
              <h3>Twin View</h3>
              <p>Interactive 3D digital twin with thermal modeling and simulation capabilities</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
