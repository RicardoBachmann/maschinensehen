import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

const GridComponent = ({ map }) => {
  const [status, setStatus] = useState("initializing");
  const [latLines, setLatLines] = useState(10);
  const [lngLines, setLngLines] = useState(10);

  // Function to create grid-geoJSON
  const createGridGeoJSON = () => {
    console.log("GridComponent: Erstelle Grid GeoJSON");

    // Current map-bounds
    const bounds = map.getBounds();
    console.log("GridComponent: Map-Bounds:", bounds);

    // Extension of the bounds for the grid
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Calculate the size for each grid cell (10x10 grid)
    const lngDelta = (ne.lng - sw.lng) / lngLines;
    const latDelta = (ne.lat - sw.lat) / latLines;

    console.log("Grid Component: Grid-Size:", { lngDelta, latDelta });

    // Create features for GeoJSON
    const features = [];

    // Horizontal lines
    for (let i = 0; i <= latLines; i++) {
      const lat = sw.lat + i * latDelta;
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [sw.lng, lat],
            [ne.lng, lat],
          ],
        },
      });
    }

    // Vertical lines
    for (let i = 0; i <= lngLines; i++) {
      const lng = sw.lng + i * lngDelta;
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lng, sw.lat],
            [lng, ne.lat],
          ],
        },
      });
    }
    console.log("GridComponent: Number of grid lines:", features.length);

    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  //  Function for adding the grid to the map
  const addGridToMap = () => {
    console.log("GridComponent: Add Grid to the map");

    try {
      // Check whether the grid already exists and remove it if necessary
      if (map.getSource("grid-source")) {
        map.removeLayer("grid-layer");
        map.removeSource("grid-source");
        console.log("GridComponent: Existing grid removed");
      }

      // Create Grid-GeoJSON
      const gridData = createGridGeoJSON();

      // Add Grid as source
      map.addSource("grid-source", {
        type: "geojson",
        data: gridData,
      });

      // Add Grid-Layer
      map.addLayer({
        id: "grid-layer",
        type: "line",
        source: "grid-source",
        layout: {},
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.6,
          "line-width": 1,
        },
      });

      console.log("GridComponent: Grid successfully added");
      setStatus("grid added");
    } catch (error) {
      console.error("GridComponent: Error adding the grid:", error);
      setStatus("grid error:" + error.message);
    }
  };

  useEffect(() => {
    console.log("GridComponent: Component has been loaded");
    console.log("GridComponent: Receive map prop", map);

    if (!map) {
      setStatus("no map received");
      return;
    }
    setStatus("map recevied");

    if (!map.loaded()) {
      console.log("GridComponent: Wait for map-load event");
      map.on("load", () => {
        console.log("GridComponent: Map load event triggered");
        addGridToMap();
      });
    } else {
      console.log("GridComponent: Map already loaded");
      addGridToMap();
    }

    // Refresh the grid when the map is moved
    map.on("moveend", () => {
      console.log("GridComponent: Map move event triggered");
      addGridToMap();
    });

    // Cleanup
    return () => {
      console.log("GridComponent: Cleanup");
      if (map && map.getLayer("grid-layer")) {
        map.removeLayer("grid-layer");
      }
      if (map && map.getSource("grid-source")) {
        map.removeSource("grid-source");
      }
    };
  }, [map, latLines, lngLines]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50px",
        left: "10px",
        background: !map ? "red " : "green",
        padding: "5px",
        zIndex: 999,
      }}
    >
      <div>Grid Status: {status}</div>
      <div style={{ marginTop: "10px" }}>
        <lable>
          Horizontale Linien:
          <input
            type="number"
            min="2"
            max="50"
            value={latLines}
            onChange={(e) => setLatLines(parseInt(e.target.value, 10))}
            style={{ width: "50px", maginLeft: "5px" }}
          ></input>
          Vertikale Linien:
          <input
            type="number"
            min="2"
            max="50"
            value={lngLines}
            onChange={(e) => setLngLines(parseInt(e.target.value, 10))}
            style={{ width: "50px", maginLeft: "5px" }}
          ></input>
        </lable>
      </div>
    </div>
  );
};

export default GridComponent;
