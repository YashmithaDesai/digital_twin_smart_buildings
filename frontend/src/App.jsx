import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import TwinView from "./pages/TwinView.jsx";
import Analytics from "./pages/Analytics.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import BuildingOverview from "./pages/BuildingOverview.jsx";
import ZonesAndFloors from "./pages/ZonesAndFloors.jsx";
import BuildingSystems from "./pages/BuildingSystems.jsx";
import Contact from "./pages/Contact.jsx";
import Header from "./components/Header.jsx";

import "./styles/app.css";

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app-shell ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/twin" element={<TwinView />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/building-info" element={<BuildingOverview />} />
          <Route path="/building-info/zones" element={<ZonesAndFloors />} />
          <Route path="/building-info/systems" element={<BuildingSystems />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>Digital Twin MVP — demo build</span>
      </footer>
    </div>
  );
}

export default App;


