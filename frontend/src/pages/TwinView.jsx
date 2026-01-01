import React, { useEffect, useState } from "react";
import { fetchLayout } from "../services/api";
import Layout3D from "../components/Layout3D/Layout3D";
import InteractiveBuilding3D from "../components/InteractiveBuilding3D/InteractiveBuilding3D";
import SimulationPanel from "../components/SimulationPanel/SimulationPanel";
import Dashboard from "../components/Dashboard/Dashboard";

function TwinView() {
  const [layout, setLayout] = useState(null);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    async function init() {
      const layoutData = await fetchLayout("9");
      setLayout(layoutData);
    }
    init();
  }, []);

  return (
    <section className="twin-view">
      <div className="dashboard-decorative-circles">
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
        <div className="decorative-circle circle-4"></div>
      </div>
      <h1>Twin View</h1>

      <div className="twin-layout">
        <InteractiveBuilding3D buildingId="9" />
      </div>

      <div className="twin-simulation">
        <SimulationPanel
          buildingId="9"
          onSimulationComplete={setSimulation}
        />
      </div>

      {simulation && (
        <div className="twin-dashboard">
          <Dashboard simulationData={simulation} />
        </div>
      )}
    </section>
  );
}

export default TwinView;


