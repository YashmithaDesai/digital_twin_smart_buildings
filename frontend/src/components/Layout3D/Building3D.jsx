import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Line, Box } from "@react-three/drei";
import * as THREE from "three";
import Zone3D from "./Zone3D";

// Building structure component
function BuildingStructure() {
  const floorHeight = 3;
  const buildingWidth = 14;
  const buildingDepth = 12;
  const wallThickness = 0.2;
  const floorThickness = 0.1;

  return (
    <>
      {/* Floor slabs */}
      <Box
        position={[0, -floorHeight / 2, 0]}
        args={[buildingWidth, floorThickness, buildingDepth]}
        receiveShadow
      >
        <meshStandardMaterial color="#404040" transparent opacity={0.5} />
      </Box>

      <Box
        position={[0, floorHeight / 2, 0]}
        args={[buildingWidth, floorThickness, buildingDepth]}
        receiveShadow
      >
        <meshStandardMaterial color="#404040" transparent opacity={0.5} />
      </Box>

      {/* Roof slab */}
      <Box
        position={[0, floorHeight + floorThickness / 2, 0]}
        args={[buildingWidth, floorThickness, buildingDepth]}
        receiveShadow
      >
        <meshStandardMaterial color="#505050" transparent opacity={0.4} />
      </Box>

      {/* Outer walls */}
      {/* Front wall */}
      <Box
        position={[0, 0, buildingDepth / 2]}
        args={[buildingWidth, floorHeight, wallThickness]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#606060" transparent opacity={0.8} />
      </Box>

      {/* Back wall */}
      <Box
        position={[0, 0, -buildingDepth / 2]}
        args={[buildingWidth, floorHeight, wallThickness]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#606060" transparent opacity={0.8} />
      </Box>

      {/* Left wall */}
      <Box
        position={[-buildingWidth / 2, 0, 0]}
        args={[wallThickness, floorHeight, buildingDepth]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#606060" transparent opacity={0.8} />
      </Box>

      {/* Right wall */}
      <Box
        position={[buildingWidth / 2, 0, 0]}
        args={[wallThickness, floorHeight, buildingDepth]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#606060" transparent opacity={0.8} />
      </Box>
    </>
  );
}

function Building3D({ layout, metrics, selectedMetric, onZoneClick, selectedZone }) {
  const { viewport } = useThree();

  // Calculate positions for zones in a building-like layout
  const zonePositions = useMemo(() => {
    const positions = {};
    const floorHeight = 3; // Vertical spacing between floors
    const buildingWidth = 14; // Match BuildingStructure
    const buildingDepth = 12; // Match BuildingStructure
    const margin = 1; // Margin from walls

    // Group zones by floor
    const zonesByFloor = {};
    layout.zones.forEach(zone => {
      if (!zonesByFloor[zone.floor]) {
        zonesByFloor[zone.floor] = [];
      }
      zonesByFloor[zone.floor].push(zone);
    });

    // Position zones on each floor
    Object.entries(zonesByFloor).forEach(([floor, floorZones]) => {
      const numZones = floorZones.length;
      const cols = Math.ceil(Math.sqrt(numZones));
      const rows = Math.ceil(numZones / cols);

      const cellWidth = (buildingWidth - 2 * margin) / cols;
      const cellDepth = (buildingDepth - 2 * margin) / rows;

      floorZones.forEach((zone, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        // Center the grid within building bounds with margin
        const x = (col - cols / 2 + 0.5) * cellWidth;
        const z = (row - rows / 2 + 0.5) * cellDepth;
        const y = (parseInt(floor) - 1) * floorHeight;

        positions[zone.id] = [x, y, z];
      });
    });

    return positions;
  }, [layout.zones]);

  // Create connections between zones
  const connections = useMemo(() => {
    const lines = [];
    const zoneMap = new Map(layout.zones.map((z) => [z.id, z]));

    layout.zones.forEach((zone) => {
      zone.neighbors.forEach((neighborId) => {
        const neighbor = zoneMap.get(neighborId);
        if (neighbor && zonePositions[zone.id] && zonePositions[neighborId]) {
          const start = new THREE.Vector3(...zonePositions[zone.id]);
          const end = new THREE.Vector3(...zonePositions[neighborId]);

          // Adjust to zone center height
          start.y += 0.25;
          end.y += 0.25;

          lines.push(
            <Line
              key={`${zone.id}-${neighborId}`}
              points={[start, end]}
              color="#888888"
              lineWidth={1}
              dashed={false}
            />
          );
        }
      });
    });

    return lines;
  }, [layout.zones, zonePositions]);

  return (
    <>
      {/* Building structure */}
      <BuildingStructure />

      {/* Render zones */}
      {layout.zones.map((zone) => (
        <Zone3D
          key={`${zone.id}-${selectedMetric}`}
          zone={zone}
          position={zonePositions[zone.id]}
          metrics={metrics?.[zone.id]}
          selectedMetric={selectedMetric}
          onClick={() => onZoneClick?.(zone)}
          isSelected={selectedZone?.id === zone.id}
        />
      ))}

      {/* Render connections */}
      {connections}
    </>
  );
}

export default Building3D;
